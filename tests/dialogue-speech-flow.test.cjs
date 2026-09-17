const { test } = require('node:test');
const assert = require('node:assert/strict');
const { HebrewSpeechRecognizer } = require('../src/lib/speech.ts');

test('HebrewSpeechRecognizer: stop() preserves recorder.onstop and invokes onEnd callback', async () => {
  const recognizer = new HebrewSpeechRecognizer();

  const originalWindow = globalThis.window;
  const originalMediaRecorder = globalThis.MediaRecorder;
  const originalNavigatorDesc = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

  try {
    let recorderStopCalled = false;
    let onEndCalledWith = null;

    class MockMediaRecorder {
      constructor(stream, options) {
        this.stream = stream;
        this.options = options;
        this.state = 'recording';
        this.ondataavailable = null;
        this.onstop = null;
      }
      start() {}
      stop() {
        recorderStopCalled = true;
        this.state = 'inactive';
        if (this.ondataavailable) {
          this.ondataavailable({ data: { size: 1200, type: 'audio/webm' } });
        }
        if (this.onstop) {
          this.onstop();
        }
      }
    }
    MockMediaRecorder.isTypeSupported = () => true;

    globalThis.window = {};
    globalThis.MediaRecorder = MockMediaRecorder;
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        mediaDevices: {
          getUserMedia: async () => ({
            active: true,
            getTracks: () => [{ stop: () => {} }],
          }),
        },
        onLine: false,
      },
      configurable: true,
      writable: true,
    });

    let onErrorCalled = false;

    await recognizer.start(
      () => {},
      () => { onErrorCalled = true; },
      (transcript, blob, url) => {
        onEndCalledWith = { transcript, blob, url };
      }
    );

    // Call stop() — user finishes speaking and stops recording
    recognizer.stop();

    assert.equal(recorderStopCalled, true, 'MediaRecorder.stop() must be invoked');
    assert.ok(onEndCalledWith !== null, 'onEnd callback must be invoked upon stop()');
    assert.equal(onErrorCalled, false, 'onError must not be called during normal stop()');
  } finally {
    globalThis.window = originalWindow;
    globalThis.MediaRecorder = originalMediaRecorder;
    if (originalNavigatorDesc) {
      Object.defineProperty(globalThis, 'navigator', originalNavigatorDesc);
    }
  }
});

test('HebrewSpeechRecognizer: stop() when mediaRecorder is inactive still calls onEnd callback without hanging', async () => {
  const recognizer = new HebrewSpeechRecognizer();

  const originalWindow = globalThis.window;
  const originalNavigatorDesc = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

  let onEndCalledWith = null;
  globalThis.window = {};
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      mediaDevices: {
        getUserMedia: async () => null,
      },
      onLine: false,
    },
    configurable: true,
    writable: true,
  });

  try {
    await recognizer.start(
      () => {},
      () => {},
      (transcript, blob, url) => {
        onEndCalledWith = { transcript, blob, url };
      }
    );

    // Stop when recorder was never created / inactive
    recognizer.stop();

    assert.ok(onEndCalledWith !== null, 'onEnd callback must be invoked even if recorder was inactive');
    assert.equal(onEndCalledWith.blob, null);
  } finally {
    globalThis.window = originalWindow;
    if (originalNavigatorDesc) {
      Object.defineProperty(globalThis, 'navigator', originalNavigatorDesc);
    }
  }
});

test('HebrewSpeechRecognizer: cancel() silently aborts without invoking onEnd callback', async () => {
  const recognizer = new HebrewSpeechRecognizer();

  const originalWindow = globalThis.window;
  const originalMediaRecorder = globalThis.MediaRecorder;
  const originalNavigatorDesc = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

  let onEndCalled = false;
  class MockMediaRecorder {
    constructor() { this.state = 'recording'; }
    start() {}
    stop() {
      if (this.onstop) this.onstop();
    }
  }
  MockMediaRecorder.isTypeSupported = () => true;

  globalThis.window = {};
  globalThis.MediaRecorder = MockMediaRecorder;
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      mediaDevices: {
        getUserMedia: async () => ({
          active: true,
          getTracks: () => [{ stop: () => {} }],
        }),
      },
    },
    configurable: true,
    writable: true,
  });

  try {
    await recognizer.start(
      () => {},
      () => {},
      () => { onEndCalled = true; }
    );

    // Cancel
    recognizer.cancel();
    assert.equal(onEndCalled, false, 'cancel() must not invoke onEnd callback');
  } finally {
    globalThis.window = originalWindow;
    globalThis.MediaRecorder = originalMediaRecorder;
    if (originalNavigatorDesc) {
      Object.defineProperty(globalThis, 'navigator', originalNavigatorDesc);
    }
  }
});
