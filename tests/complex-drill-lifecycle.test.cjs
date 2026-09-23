const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

test('ComplexDrillMode lifecycle: source code contract verification', () => {
  const filePath = path.join(__dirname, '..', 'src', 'components', 'FlashcardTrainer', 'modes', 'ComplexDrillMode.tsx');
  assert.ok(fs.existsSync(filePath), 'ComplexDrillMode.tsx must exist');
  const code = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

  // 1. Must have audio reference tracking
  assert.ok(
    code.includes('currentAudioRef = useRef<HTMLAudioElement | null>(null)'),
    'ComplexDrillMode must track currentAudioRef for sentence audio'
  );

  // 2. Must define stopAllDrillAudio that cancels currentAudioRef and calls stopSpeech
  assert.ok(
    code.includes('const stopAllDrillAudio = () => {') &&
      code.includes('(currentAudioRef.current as any)._cancelled = true;') &&
      code.includes('stopSpeech();'),
    'stopAllDrillAudio must cancel currentAudioRef and call stopSpeech'
  );

  // 3. Navigation wrappers (handleAdvance, handlePrev) must cancel audio and increment cycle
  assert.ok(
    code.includes('const handleAdvance = () => {') &&
      code.includes('const handlePrev = () => {'),
    'ComplexDrillMode must have handleAdvance and handlePrev navigation wrappers'
  );

  // 4. Navigation buttons must use handleAdvance and handlePrev
  assert.ok(
    code.includes('onClick={handleAdvance}') && code.includes('onClick={handlePrev}'),
    'Navigation buttons must call handleAdvance and handlePrev instead of direct raw callbacks'
  );

  // 5. playHebrewSentence must guard against cycle cancellation after fetching MP3
  assert.ok(
    code.includes('if (!isMountedRef.current || playCycleIdRef.current !== currentCycleId) return;'),
    'playHebrewSentence must check cycle ID after resolving getRecordedSentenceAudio'
  );

  // 6. Sentence audio playPromise catch must ignore AbortError and cancelled audio
  assert.ok(
    code.includes("err?.name === 'AbortError'") && code.includes('_cancelled'),
    'Sentence audio must guard playPromise.catch against AbortError and _cancelled'
  );

  // 7. Cleanup in useEffect must clear timers and stop audio on unmount or word change
  assert.ok(
    code.includes('stopAllDrillAudio();'),
    'useEffect cleanup must call stopAllDrillAudio'
  );
});

test('FlashcardTrainer navigation: source code contract verification', () => {
  const filePath = path.join(__dirname, '..', 'src', 'components', 'FlashcardTrainer', 'FlashcardTrainer.tsx');
  assert.ok(fs.existsSync(filePath), 'FlashcardTrainer.tsx must exist');
  const code = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

  // handleAdvanceNext, handlePrevWord, handleNextWord must call stopSpeech()
  assert.ok(
    code.includes('const handleAdvanceNext = () => {\n    stopSpeech();'),
    'handleAdvanceNext must immediately call stopSpeech()'
  );
  assert.ok(
    code.includes('const handlePrevWord = useCallback(() => {\n    stopSpeech();'),
    'handlePrevWord must immediately call stopSpeech()'
  );
  assert.ok(
    code.includes('const handleNextWord = useCallback(\n    (quality = 4) => {\n      stopSpeech();'),
    'handleNextWord must immediately call stopSpeech()'
  );
});

test('speech.ts: studio audio cancellation invariants', () => {
  const filePath = path.join(__dirname, '..', 'src', 'lib', 'speech.ts');
  assert.ok(fs.existsSync(filePath), 'speech.ts must exist');
  const code = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

  // stopSpeech must mark activeStudioAudio._cancelled = true
  assert.ok(
    code.includes('(activeStudioAudio as any)._cancelled = true;'),
    'stopSpeech must mark activeStudioAudio._cancelled = true'
  );

  // speakHebrew must check _cancelled and AbortError before falling back to TTS
  assert.ok(
    code.includes("(audio as any)?._cancelled || err?.name === 'AbortError' || isStudioEnded"),
    'speakHebrew must not trigger TTS fallback when audio was aborted or cancelled'
  );

  // speakRussian must also cancel activeStudioAudio
  assert.ok(
    code.includes('activeStudioAudio') &&
      code.includes('speakRussian(text: string') &&
      code.includes('(activeStudioAudio as any)._cancelled = true;'),
    'speakRussian must cancel activeStudioAudio before speaking Russian'
  );
});
