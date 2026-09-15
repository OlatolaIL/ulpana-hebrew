const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const root = path.resolve(process.argv[2]);
const output = path.resolve(process.argv[3]);
global.fetch = () => { throw new Error('Network is forbidden in this isolated review'); };
global.localStorage = { getItem: () => null };
const sinks = [];
global.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
global.Audio = class {
  constructor(url) { this.src = url; }
  play() {
    sinks.push({ sink: 'fallback-audio', text: new URL(this.src).searchParams.get('q'), rate: this.playbackRate });
    queueMicrotask(() => this.onended?.());
    return Promise.resolve();
  }
  pause() {}
};
global.window = { speechSynthesis: {
  getVoices: () => [], cancel() {}, resume() {},
  speak(utterance) {
    sinks.push({ sink: 'browser-tts', text: utterance.text, lang: utterance.lang, rate: utterance.rate });
    queueMicrotask(() => utterance.onend?.());
  }
} };
require(path.join(root, 'tests/register.cjs'));
const speech = require(path.join(root, 'src/lib/speech.ts'));
(async () => {
  const input = 'לֶחֶם וּגְבִינָה';
  await speech.speakHebrew(input, { rate: 0.8 });
  assert.equal(sinks.length, 1);
  assert.equal(sinks[0].sink, 'browser-tts');
  const native = window.speechSynthesis;
  delete window.speechSynthesis;
  await speech.speakHebrew(input, { rate: 0.8 });
  assert.equal(sinks.length, 2);
  assert.equal(sinks[1].sink, 'fallback-audio');
  window.speechSynthesis = { ...native, speak(utterance) { queueMicrotask(() => utterance.onerror?.({ error: 'synthetic-provider-error' })); } };
  const warn = console.warn;
  console.warn = () => {};
  try { await speech.speakHebrew(input, { rate: 0.8 }); } finally { console.warn = warn; }
  assert.equal(sinks.length, 3);
  assert.equal(sinks[2].sink, 'fallback-audio');
  speech.stopSpeech();
  const result = { recordedAt: new Date().toISOString(),
    commit: cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    input, sinks, method: 'Actual speakHebrew through native synthesis, unsupported synthesis and error fallback; synthetic browser endpoints, no network or physical audio' };
  fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
})().catch(error => { console.error(error); process.exitCode = 1; });
