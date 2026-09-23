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

