const test = require('node:test');
const assert = require('node:assert/strict');

// Setup mock browser globals before requiring speech.ts
const pendingEvents = [];

class FakeMediaRecorder {
  static isTypeSupported() { return true; }
  constructor(stream, options) {
    this.stream = stream;
    this.options = options;
    this.state = 'inactive';
    this.mimeType = 'audio/webm;codecs=opus';
    this.ondataavailable = null;
    this.onstop = null;
    this.onerror = null;
  }
  start() {
    this.state = 'recording';
  }
  requestData() {}
  stop() {
    this.state = 'inactive';
    const recorder = this;
    pendingEvents.push(async () => {
      if (recorder.ondataavailable) {
        recorder.ondataavailable({ data: new Blob(['OLD_TAIL']) });
      }
      if (recorder.onstop) {
        await recorder.onstop();
      }
    });
  }
}

globalThis.MediaRecorder = FakeMediaRecorder;
if (!globalThis.Blob) {
  globalThis.Blob = require('node:buffer').Blob;
}

// Minimal window/navigator mocks
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    AudioContext: class {
      createMediaStreamSource() {
        return { connect() {} };
      }
      createAnalyser() {
        return {
          fftSize: 2048,
          frequencyBinCount: 1024,
          smoothingTimeConstant: 0.8,
          getByteFrequencyData(arr) { arr.fill(10); },
          getByteTimeDomainData(arr) { arr.fill(128); },
          getFloatTimeDomainData(arr) { arr.fill(0); },
          connect() {},
          disconnect() {},
        };
      }
      close() { return Promise.resolve(); }
    },
  };
}

if (typeof globalThis.navigator === 'undefined') {
  globalThis.navigator = {
    mediaDevices: {
      getUserMedia: async () => ({
        active: true,
        getTracks: () => [{ stop() {} }],
      }),
    },
  };
}

const { HebrewSpeechRecognizer } = require('../src/lib/speech.ts');

function createIsolatedRecognizer() {
  const r = new HebrewSpeechRecognizer();
  r.isSupported = () => true;
  r.startRecognitionOnly = () => {};
  r.setupAudioAnalyser = () => {};
  return r;
}

const fakeStream = {
  active: true,
  getTracks: () => [{ stop() {} }],
};

test('Session Isolation: Old recorder onstop and late chunks do not wipe new session buffer or hijack callbacks', async () => {
  pendingEvents.length = 0;
  const recognizer = createIsolatedRecognizer();
  let oldEndCount = 0;
  let newEndCount = 0;
  const options = { mediaStream: fakeStream };

  // 1. Start Session 1
  await recognizer.start(() => {}, () => {}, () => { oldEndCount++; }, options);
  assert.equal(recognizer.getSessionState(), 'listening');
  const recorder1 = recognizer.mediaRecorder;
  assert.ok(recorder1);

  // Push chunk into Session 1
  recorder1.ondataavailable({ data: new Blob(['OLD_PREFIX']) });

  // 2. Start Session 2 (this stops session 1 asynchronously and starts a new session)
  await recognizer.start(() => {}, () => {}, () => { newEndCount++; }, options);
  const recorder2 = recognizer.mediaRecorder;
  assert.notEqual(recorder1, recorder2, 'A fresh MediaRecorder must be created for Session 2');

  // Push chunk into Session 2
  recorder2.ondataavailable({ data: new Blob(['NEW_PREFIX']) });

  const session2ChunksBefore = await new Blob(recognizer.audioChunks).text();
  assert.ok(session2ChunksBefore.includes('NEW_PREFIX'), 'Session 2 must have NEW_PREFIX before old stop event');

  // 3. Now fire the delayed Session 1 stop and late dataavailable events
  while (pendingEvents.length > 0) {
    const fn = pendingEvents.shift();
    await fn();
  }

  // 4. Verify Session 2 buffer was NOT cleared by Session 1's onstop handler!
  const session2ChunksAfter = await new Blob(recognizer.audioChunks).text();
  assert.ok(
    session2ChunksAfter.includes('NEW_PREFIX'),
    `Session 2 buffer was destroyed by old session! Got: "${session2ChunksAfter}"`
  );
  assert.equal(
    newEndCount,
    0,
    'Session 2 onEnd callback must NOT be triggered by Session 1 onstop event'
  );
  assert.equal(
    oldEndCount,
    0,
    'Closed/superseded Session 1 must not trigger stale callbacks'
  );
});

test('Buffer Preservation: STT failure preserves audio blob for retry rather than destroying user speech', async () => {
  const recognizer = createIsolatedRecognizer();
  await recognizer.start(() => {}, () => {}, () => {}, {
    mediaStream: fakeStream,
    onSilenceDetected() {},
  });
  const testAudioContent = 'test_speech_audio_bytes_2026_'.repeat(60); // ~1800 bytes (>1500b)
  recognizer.audioChunks = [new Blob([testAudioContent])];
  recognizer.peakAvgInCurrentChunk = 45;
  recognizer.peakRmsDbInCurrentChunk = -14;

  // Mock STT returning error/null (as happens during HTTP 500 or timeout)
  recognizer.transcribeAudioBlob = async () => null;

  await recognizer.handleSilenceDetected();

  // The recognizer must preserve the audio blob so the user turn is not lost
  const preserved = recognizer.getPreservedAudio();
  assert.ok(preserved.blob !== null, 'Audio blob must be preserved on STT failure');
  const preservedText = await preserved.blob.text();
  assert.equal(preservedText, testAudioContent);
});

test('State Detection: isSpeechActive reflects speech-active and transcribing states to defer watchdog', async () => {
  const recognizer = createIsolatedRecognizer();
  await recognizer.start(() => {}, () => {}, () => {}, { mediaStream: fakeStream });

  // Initially listening
  assert.equal(recognizer.getSessionState(), 'listening');
  assert.equal(recognizer.isSpeechActive(), false);

  // When speech is detected
  if (recognizer.activeSession) {
    recognizer.activeSession.state = 'speech_active';
    assert.equal(recognizer.isSpeechActive(), true);

    recognizer.activeSession.state = 'transcribing';
    assert.equal(recognizer.isSpeechActive(), true);

    recognizer.activeSession.state = 'finalizing';
    assert.equal(recognizer.isSpeechActive(), true);

    recognizer.activeSession.state = 'listening';
    assert.equal(recognizer.isSpeechActive(), false);
  }
});

test('Boundary Isolation: Late stop-tail and requestData do not leak into next recorder buffer (250ms, 500ms, 800ms)', async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let recCounter = 0;

  class ControlledRecorder {
    static isTypeSupported() { return true; }
    constructor() {
      this.id = ++recCounter;
      this.state = 'inactive';
      this.mimeType = 'audio/webm';
      this.delay = 250;
    }
    start() {
      this.state = 'recording';
      if (this.id > 1) this.ondataavailable?.({ data: new Blob(['NEW_HEADER']) });
    }
    requestData() {
      setTimeout(() => this.ondataavailable?.({ data: new Blob(['FINAL_WORD']) }), this.delay);
    }
    stop() {
      this.state = 'inactive';
      setTimeout(() => {
        this.ondataavailable?.({ data: new Blob(['OLD_STOP_TAIL']) });
        this.onstop?.();
      }, 10);
    }
  }

  const origMR = globalThis.MediaRecorder;
  globalThis.MediaRecorder = ControlledRecorder;

  try {
    for (const sttSuccess of [true, false]) {
      for (const delay of [250, 500, 800]) {
        recCounter = 0;
        const r = createIsolatedRecognizer();
        const options = { mediaStream: fakeStream, onSilenceDetected() {} };
        await r.start(() => {}, () => {}, () => {}, options);
        if (r.mediaRecorder) r.mediaRecorder.delay = delay;
        r.audioChunks = [new Blob(['x'.repeat(2000)])];
        r.peakAvgInCurrentChunk = 40;
        r.peakRmsDbInCurrentChunk = -15;

        let submitted = '';
        r.transcribeAudioBlob = async (b) => {
          submitted = await b.text();
          return sttSuccess
            ? { success: true, text: 'שלום' }
            : { success: false, reason: 'http_error', status: 500, retryable: true };
        };

        await r.handleSilenceDetected();
        await wait(Math.max(delay + 30, 40));

        const next = await new Blob(r.audioChunks).text();
        const oldRecorderDataInNewBuffer = next.includes('OLD_STOP_TAIL') || next.includes('FINAL_WORD');

        // In all cases, next buffer MUST be clean and never contain old recorder chunks
        assert.equal(
          oldRecorderDataInNewBuffer,
          false,
          `delay ${delay}ms (sttSuccess=${sttSuccess}): Old recorder chunks leaked into next buffer! Got: "${next}"`
        );
        assert.ok(
          next.includes('NEW_HEADER'),
          `delay ${delay}ms (sttSuccess=${sttSuccess}): Next buffer must begin with NEW_HEADER! Got: "${next}"`
        );

        // All delays (including 800ms) MUST include the final word and full original audio
        assert.equal(
          submitted.length,
          2010,
          `delay ${delay}ms (sttSuccess=${sttSuccess}): Submitted bytes must be 2010! Got ${submitted.length}`
        );
        assert.ok(
          submitted.includes('FINAL_WORD'),
          `delay ${delay}ms (sttSuccess=${sttSuccess}): Submitted audio must include FINAL_WORD!`
        );

        const preserved = await r.getPreservedAudio().blob?.text();
        assert.equal(
          preserved?.length,
          2010,
          `delay ${delay}ms (sttSuccess=${sttSuccess}): Preserved bytes must be 2010! Got ${preserved?.length}`
        );
        assert.ok(
          preserved?.includes('x'.repeat(2000)),
          `delay ${delay}ms (sttSuccess=${sttSuccess}): Preserved audio must retain original 2000 bytes!`
        );
        assert.ok(
          preserved?.includes('FINAL_WORD'),
          `delay ${delay}ms (sttSuccess=${sttSuccess}): Preserved audio must retain FINAL_WORD!`
        );

        r.cancel();
      }
    }
  } finally {
    globalThis.MediaRecorder = origMR;
  }
});

test('Boundary Isolation: Separately decodable real audio containers across segment boundaries without corruption or leakage', async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let recCounter = 0;

  // Helper to create a valid minimal 44-byte WAV header for mono 16-bit 16000Hz PCM
  function createWavHeader(dataLength) {
    const buffer = Buffer.alloc(44);
    buffer.write('RIFF', 0, 'ascii');
    buffer.writeUInt32LE(36 + dataLength, 4);
    buffer.write('WAVE', 8, 'ascii');
    buffer.write('fmt ', 12, 'ascii');
    buffer.writeUInt32LE(16, 16); // subchunk1 size
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(1, 22); // 1 channel
    buffer.writeUInt32LE(16000, 24); // sample rate
    buffer.writeUInt32LE(32000, 28); // byte rate (16000 * 2)
    buffer.writeUInt16LE(2, 32); // block align
    buffer.writeUInt16LE(16, 34); // bits per sample
    buffer.write('data', 36, 'ascii');
    buffer.writeUInt32LE(dataLength, 40);
    return buffer;
  }

  function validateWavContainer(buf, expectedPayloadLength) {
    assert.ok(buf.length >= 44, 'Buffer too small to be a valid WAV file');
    assert.equal(buf.subarray(0, 4).toString('ascii'), 'RIFF', 'Missing RIFF magic');
    assert.equal(buf.subarray(8, 12).toString('ascii'), 'WAVE', 'Missing WAVE format');
    assert.equal(buf.subarray(12, 16).toString('ascii'), 'fmt ', 'Missing fmt subchunk');
    assert.equal(buf.readUInt16LE(20), 1, 'Expected PCM format');
    assert.equal(buf.readUInt16LE(22), 1, 'Expected 1 channel');
    assert.equal(buf.readUInt32LE(24), 16000, 'Expected 16kHz sample rate');
    assert.equal(buf.subarray(36, 40).toString('ascii'), 'data', 'Missing data subchunk');
    const dataSize = buf.readUInt32LE(40);
    assert.equal(dataSize, expectedPayloadLength, `Expected data payload ${expectedPayloadLength} bytes`);
    assert.equal(buf.length, 44 + expectedPayloadLength, 'Total file length mismatch');
    return true;
  }

  // Segment 1 payload: 1600 bytes PCM + 400 bytes requestData chunk = 2000 bytes PCM
  const seg1Header = createWavHeader(2000);
  const seg1InitialPcm = Buffer.alloc(1600, 0x11);
  const seg1LatePcm = Buffer.alloc(400, 0x22);
  const seg1StopTail = Buffer.alloc(128, 0x33);

  // Segment 2 payload: 600 bytes PCM
  const seg2Header = createWavHeader(600);
  const seg2Pcm = Buffer.alloc(600, 0x44);

  class RealContainerRecorder {
    static isTypeSupported() { return true; }
    constructor() {
      this.id = ++recCounter;
      this.state = 'inactive';
      this.mimeType = 'audio/wav';
    }
    start() {
      this.state = 'recording';
      if (this.id === 2) {
        // Segment 2 starts with its own clean WAV header and payload
        this.ondataavailable?.({ data: new Blob([seg2Header, seg2Pcm]) });
      }
    }
    requestData() {
      // Simulates browser finalization delivering the last audio slice (400 bytes)
      setTimeout(() => this.ondataavailable?.({ data: new Blob([seg1LatePcm]) }), 50);
    }
    stop() {
      this.state = 'inactive';
      // Simulates browser stop tail flushing after segment has closed
      setTimeout(() => {
        this.ondataavailable?.({ data: new Blob([seg1StopTail]) });
        this.onstop?.();
      }, 10);
    }
  }

  const origMR = globalThis.MediaRecorder;
  globalThis.MediaRecorder = RealContainerRecorder;

  try {
    const r = createIsolatedRecognizer();
    const options = { mediaStream: fakeStream, onSilenceDetected() {} };
    await r.start(() => {}, () => {}, () => {}, options);

    // Initial audio in segment 1: header (44 bytes) + initial PCM (1600 bytes)
    r.audioChunks = [new Blob([seg1Header, seg1InitialPcm])];
    r.peakAvgInCurrentChunk = 40;
    r.peakRmsDbInCurrentChunk = -15;

    let submittedBuf = null;
    r.transcribeAudioBlob = async (b) => {
      submittedBuf = Buffer.from(await b.arrayBuffer());
      return { success: true, text: 'שלום' };
    };

    await r.handleSilenceDetected();
    await wait(80);

    // 1. Submitted audio must be a complete, structurally valid WAV container (44 header + 1600 initial + 400 late = 2044 bytes)
    assert.ok(submittedBuf, 'Submitted audio must not be null');
    assert.equal(submittedBuf.length, 2044, `Expected 2044 bytes submitted WAV, got ${submittedBuf.length}`);
    validateWavContainer(submittedBuf, 2000);

    // 2. Preserved audio must decode cleanly and equal the complete Segment 1 container
    const preservedBlob = r.getPreservedAudio().blob;
    assert.ok(preservedBlob, 'Preserved blob must exist');
    const preservedBuf = Buffer.from(await preservedBlob.arrayBuffer());
    assert.equal(preservedBuf.length, 2044, `Preserved buffer must be 2044 bytes, got ${preservedBuf.length}`);
    validateWavContainer(preservedBuf, 2000);

    // 3. Segment 2 buffer must be completely isolated and decodable on its own
    const nextBlob = new Blob(r.audioChunks);
    const nextBuf = Buffer.from(await nextBlob.arrayBuffer());
    assert.equal(nextBuf.length, 44 + 600, `Expected 644 bytes in Segment 2 WAV, got ${nextBuf.length}`);
    validateWavContainer(nextBuf, 600);

    // 4. Verify no bytes from seg1StopTail (0x33) or seg1LatePcm (0x22) leaked into Segment 2 container
    assert.ok(!nextBuf.includes(seg1StopTail), 'Segment 1 stop tail must not leak into Segment 2 container');
    assert.ok(!nextBuf.includes(seg1LatePcm), 'Segment 1 late chunk must not leak into Segment 2 container');

    r.cancel();
  } finally {
    globalThis.MediaRecorder = origMR;
  }
});

test('Watchdog Rearming: Unified scheduleWatchdogCheck handles starts_during_grace_ends_at_20s without dying', () => {
  const fs = require('fs');
  const vm = require('vm');
  const path = require('path');
  const source = fs.readFileSync(path.resolve(__dirname, '../src/components/PhoneCallSimulator/usePhoneCall.ts'), 'utf8');
  const from = source.indexOf('watchdogTimeoutRef.current = setTimeout(() => {');
  const end = source.indexOf('}, 12000);', from);
  assert.ok(from >= 0 && end >= 0, 'Watchdog block not found in usePhoneCall.ts');
  const block = source.slice(from, end + '}, 12000);'.length);

  function probe(name, activeAt, until) {
    let now = 0, nextId = 0;
    const timers = new Map(), restarts = [], events = [];
    const ctx = {
      watchdogTimeoutRef: { current: null }, watchdogRestartTimeoutRef: { current: null },
      callActiveRef: { current: true }, shouldListenRef: { current: true },
      isSendingRef: { current: false }, isAiSpeakingRef: { current: false },
      isMutedRef: { current: false }, liveTranscriptRef: { current: '' },
      callGenerationRef: { current: 1 },
      recognizerRef: { current: { isSpeechActive: () => activeAt(now) } },
      callFlightRecorder: { record: (_type, message) => events.push({ at: now, message }) },
      setSpeechNotice() {}, startListening: () => restarts.push(now),
      clearTimeout: (id) => timers.delete(id),
      setTimeout: (fn, ms) => { const id = ++nextId; timers.set(id, { fn, at: now + ms }); return id; },
    };
    vm.runInNewContext(block, ctx);
    let count = 0;
    while (timers.size) {
      const [id, timer] = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
      if (timer.at > until) break;
      if (++count > 50) throw new Error('Unexpected timer loop');
      timers.delete(id); now = timer.at; timer.fn();
    }
    return { name, restarts, pendingTimers: timers.size };
  }

  // 1. Active at 12s until 20s -> restart at 24s
  const r1 = probe('active_at_12s_until_20s', (t) => t < 20000, 30000);
  assert.deepEqual(r1.restarts, [24000], 'Must restart at 24000 when speech active until 20s');
  assert.equal(r1.pendingTimers, 0);

  // 2. Starts during grace ends at 18s -> restart at 19.5s
  const r2 = probe('starts_during_grace_ends_at_18s', (t) => t >= 12500 && t < 18000, 30000);
  assert.deepEqual(r2.restarts, [19500], 'Must restart at 19500 when speech ends at 18s');
  assert.equal(r2.pendingTimers, 0);

  // 3. Starts during grace ends at 20s -> restart at 25.5s (DEFECT REGRESSION)
  const r3 = probe('starts_during_grace_ends_at_20s', (t) => t >= 12500 && t < 20000, 30000);
  assert.deepEqual(r3.restarts, [25500], 'Must restart at 25500 without dropping watchdog!');
  assert.equal(r3.pendingTimers, 0);

  // 4. Remains active continuously -> restart not called, 1 pending timer
  const r4 = probe('remains_active_from_start', () => true, 30000);
  assert.deepEqual(r4.restarts, []);
  assert.equal(r4.pendingTimers, 1);
});


