/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const matrixPath = path.join(repoRoot, 'DECISION_MATRIX.md');
const dictPath = path.join(repoRoot, 'src/data/pealimMasterDictionary.json');
const dbPath = path.join(repoRoot, 'src/lib/verbConjugations/database.ts');

test('R-00: DECISION_MATRIX.md exists and contains all required blocks, versioning, and rules', () => {
  assert.ok(fs.existsSync(matrixPath), 'DECISION_MATRIX.md must exist in repo root');
  const matrixContent = fs.readFileSync(matrixPath, 'utf8');

  // Check versioning
  assert.ok(matrixContent.includes('Версия:'), 'DECISION_MATRIX.md must include versioning header');
  assert.ok(matrixContent.includes('Дата обновления:'), 'DECISION_MATRIX.md must include update date');

  // Check required rule anchors
  const expectedRules = ['R-01', 'R-02', 'R-03', 'R-04', 'R-05', 'R-07', 'R-08', 'R-10', 'R-11', 'R-13', 'R-14', 'R-15', 'R-16', 'R-17', 'R-23', 'R-24', 'R-25'];
  for (const rule of expectedRules) {
    assert.ok(matrixContent.includes(rule), `DECISION_MATRIX.md must define rule ${rule}`);
  }

  // Check required sections
  assert.ok(matrixContent.includes('BLOCKING'), 'Must define BLOCKING level');
  assert.ok(matrixContent.includes('SUPERSEDED'), 'Must define SUPERSEDED level');
  assert.ok(matrixContent.includes('Superseded Log'), 'Must include Superseded Log section');
});

test('R-15: Stage 6 phone call passport exists and specifies all core invariants (P-01 to P-10)', () => {
  const passportPath = path.join(repoRoot, 'docs/mechanics/stage-06-phone-call.md');
  assert.ok(fs.existsSync(passportPath), 'stage-06-phone-call.md must exist in docs/mechanics');
  const content = fs.readFileSync(passportPath, 'utf8');

  const requiredInvariants = ['P-01', 'P-02', 'P-03', 'P-04', 'P-05', 'P-06', 'P-07', 'P-08', 'P-09', 'P-10'];
  for (const inv of requiredInvariants) {
    assert.ok(content.includes(inv), `Stage 6 passport must define invariant ${inv}`);
  }
  assert.ok(content.includes('Slot Memory'), 'Must specify Slot Memory invariant');
  assert.ok(content.includes('Speech Integrity'), 'Must specify Speech Integrity invariant');
  assert.ok(content.includes('Role Rigidity'), 'Must specify Role Rigidity invariant');
  assert.ok(content.includes('Ultra-Low Latency'), 'Must specify Ultra-Low Latency invariant for live dialogue (P-07)');
  assert.ok(content.includes('openai/gpt-oss-120b'), 'Must document openai/gpt-oss-120b in debrief reasoning carousel (P-10)');
});

test('R-01 & R-03: Superseded manual root and verb files must NOT exist in the codebase', () => {
  const forbiddenFiles = [
    'src/data/rootFamiliesData.ts',
    'src/lib/verbConjugations/rootFamiliesData.ts',
    'src/lib/verbConjugations/rootPresets.ts',
    'src/data/rootPresets.ts',
  ];

  for (const relPath of forbiddenFiles) {
    const fullPath = path.join(repoRoot, relPath);
    assert.ok(
      !fs.existsSync(fullPath),
      `Forbidden superseded file ${relPath} must not exist. SSOT is pealimMasterDictionary.json!`
    );
  }
});

test('R-02: verbConjugations/database.ts is auto-generated and protected against manual edits', () => {
  assert.ok(fs.existsSync(dbPath), 'database.ts must exist');
  
  // Read first 500 bytes to check banner without reading entire 20MB file
  const fd = fs.openSync(dbPath, 'r');
  const buffer = Buffer.alloc(500);
  fs.readSync(fd, buffer, 0, 500, 0);
  fs.closeSync(fd);

  const header = buffer.toString('utf8');
  assert.ok(
    header.includes('AUTO-GENERATED FILE FROM src/data/pealimMasterDictionary.json'),
    'database.ts must contain AUTO-GENERATED header from pealimMasterDictionary.json'
  );
  assert.ok(
    header.includes('DO NOT EDIT MANUALLY'),
    'database.ts must contain DO NOT EDIT MANUALLY warning'
  );
  assert.ok(
    header.includes('node scripts/fetch_pealim_dictionary.cjs --sync-db'),
    'database.ts must document the exact generator command'
  );
});

test('R-04 & R-05: Master dictionary adheres to ktiv male (full spelling) and rejects unpointed defective forms', () => {
  assert.ok(fs.existsSync(dictPath), 'pealimMasterDictionary.json must exist');
  const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

  // Critical modern ktiv male headwords that must be present in full form (expanded 25-word canary suite)
  const requiredKtivMaleWords = [
    'מושלם', 'תוכנית', 'אישה', 'להישאר', 'חשבון',
    'ביטחון', 'שיחה', 'קניון', 'סופרמרקט', 'כרטיס',
    'מונית', 'שולחן', 'מקרר', 'שירות', 'בניין',
    'חופשה', 'אוניברסיטה', 'הזמנה', 'מפתח', 'מלון',
    'מטבח', 'חוזה', 'תרופה', 'רופא', 'דירה'
  ];
  for (const word of requiredKtivMaleWords) {
    assert.ok(
      dict[word],
      `Modern ktiv male form "${word}" must exist as headword in pealimMasterDictionary.json`
    );
  }

  // Archaic defective unpointed spellings that must NEVER be registered as unpointed headwords
  const forbiddenDefectiveUnpointed = ['ממלץ', 'בתכנית', 'בטחון'];
  for (const word of forbiddenDefectiveUnpointed) {
    assert.ok(
      !dict[word],
      `Archaic unpointed defective form "${word}" is prohibited in master dictionary (violates R-05)`
    );
  }
});

test('R-16: Secrets, PAT, and sensitive API keys must not be hardcoded or committed to source files', () => {
  // Check critical files for hardcoded secrets or exposed PAT tokens
  const filesToCheck = [
    'package.json',
    'DECISION_MATRIX.md',
    'src/lib/db.ts',
    'src/lib/auth.ts',
    'src/lib/aiModels.ts',
  ];

  const sensitivePatterns = [
    /ghp_[a-zA-Z0-9]{30,}/,
    /github_pat_[a-zA-Z0-9]{20,}/,
    /sk-ant-[a-zA-Z0-9]{20,}/,
  ];

  for (const relFile of filesToCheck) {
    const fullPath = path.join(repoRoot, relFile);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');

    for (const pattern of sensitivePatterns) {
      assert.ok(
        !pattern.test(content),
        `Sensitive token pattern detected in ${relFile}! Secrets must only be stored in env vars (R-16).`
      );
    }
  }
});

test('R-17: speakHebrew calls must pass speechRate from userProfile (no bare speakHebrew calls without rate)', () => {
  // Scan key TTS-heavy files: bare speakHebrew(text) without { rate: ... } is a R-17 violation
  const filesToScan = [
    'src/components/LessonAiChat/useAiChat.ts',
    'src/components/LessonVocabulary.tsx',
    'src/components/LessonTheory.tsx',
    'src/components/PhoneCallSimulator/usePhoneCall.ts',
    'src/components/VerbConjugationView.tsx',
    'src/components/LessonEssay/EssayEvaluationView.tsx',
  ];

  for (const relFile of filesToScan) {
    const fullPath = path.join(repoRoot, relFile);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');

    // Find all speakHebrew invocations — each must be followed by { rate: ... }
    const bareCallPattern = /speakHebrew\([^)]+\)(?!\s*;?\s*\/\/)/g;
    const allCalls = content.match(/speakHebrew\(/g) || [];
    const callsWithRate = content.match(/speakHebrew\([^)]+\{\s*rate:/g) || [];

    assert.ok(
      allCalls.length === callsWithRate.length,
      `R-17 violation in ${relFile}: ${allCalls.length - callsWithRate.length} speakHebrew call(s) missing { rate: ... } from userProfile.speechRate`
    );
  }
});

test('R-17: DECISION_MATRIX.md defines Блок 7 with user profile settings rule', () => {
  const matrixContent = fs.readFileSync(matrixPath, 'utf8');
  assert.ok(matrixContent.includes('R-17'), 'DECISION_MATRIX.md must define R-17');
  assert.ok(matrixContent.includes('showNikkud'), 'R-17 must reference showNikkud');
  assert.ok(matrixContent.includes('speechRate'), 'R-17 must reference speechRate');
  assert.ok(matrixContent.includes('fontStyle'), 'R-17 must reference fontStyle');
  assert.ok(matrixContent.includes('Блок 7'), 'DECISION_MATRIX.md must have Блок 7');
});

test('R-19: DECISION_MATRIX.md defines R-19 server Whisper engine with button-only submit and offline fallback', () => {
  const matrixContent = fs.readFileSync(matrixPath, 'utf8');
  assert.ok(matrixContent.includes('R-19'), 'DECISION_MATRIX.md must define R-19');
  assert.ok(matrixContent.includes('Whisper'), 'R-19 must mention Whisper');
  assert.ok(matrixContent.includes('/api/ai/transcribe'), 'R-19 must mention /api/ai/transcribe');
  assert.ok(matrixContent.includes('по кнопке'), 'R-19 must specify button-only submit');
  assert.ok(matrixContent.includes('фолбэк'), 'R-19 must specify fallback');

  // Verify that useScriptedDialogue implements audio fallback to /api/ai/transcribe
  const scriptedDialogueHookPath = path.join(repoRoot, 'src/components/ScriptedDialogueTrainer/useScriptedDialogue.ts');
  assert.ok(fs.existsSync(scriptedDialogueHookPath), 'useScriptedDialogue.ts must exist');
  const code = fs.readFileSync(scriptedDialogueHookPath, 'utf8');
  assert.ok(code.includes('/api/ai/transcribe'), 'useScriptedDialogue.ts must implement /api/ai/transcribe audio fallback');
  assert.ok(code.includes('disableAutoSilenceStop'), 'useScriptedDialogue.ts must disable auto silence stop');
});

test('R-22: Zero-Drift Policy for ComplexDrills is documented and supported by automation scripts', () => {
  const matrixContent = fs.readFileSync(matrixPath, 'utf8');
  assert.ok(matrixContent.includes('R-22'), 'DECISION_MATRIX.md must define R-22');
  assert.ok(matrixContent.includes('Zero-Drift Policy'), 'R-22 must define Zero-Drift Policy');
  assert.ok(matrixContent.includes('npm run drills:audit'), 'R-22 must document drills:audit');
  assert.ok(matrixContent.includes('npm run drills:sync'), 'R-22 must document drills:sync');

  // Verify that scripts exist
  const auditScriptPath = path.join(repoRoot, 'scripts/audit_complex_drills_coverage.cjs');
  const syncScriptPath = path.join(repoRoot, 'scripts/sync_complex_drills.cjs');
  assert.ok(fs.existsSync(auditScriptPath), 'scripts/audit_complex_drills_coverage.cjs must exist');
  assert.ok(fs.existsSync(syncScriptPath), 'scripts/sync_complex_drills.cjs must exist');

  // Verify package.json scripts
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
  assert.ok(pkg.scripts['drills:audit'], 'package.json must contain drills:audit script');
  assert.ok(pkg.scripts['drills:sync'], 'package.json must contain drills:sync script');
});

test('R-23: Growth Engine isolation and MARKETING_STRATEGY.md passport exist', () => {
  const matrixContent = fs.readFileSync(matrixPath, 'utf8');
  assert.ok(matrixContent.includes('R-23'), 'DECISION_MATRIX.md must define R-23');
  assert.ok(matrixContent.includes('MARKETING_STRATEGY.md'), 'R-23 must reference MARKETING_STRATEGY.md');

  const strategyPath = path.join(repoRoot, 'growth/MARKETING_STRATEGY.md');
  assert.ok(fs.existsSync(strategyPath), 'growth/MARKETING_STRATEGY.md must exist');
  const strategyContent = fs.readFileSync(strategyPath, 'utf8');
  assert.ok(strategyContent.includes('Growth Engine'), 'Passport must define Growth Engine');
  assert.ok(strategyContent.includes('Мамы олим'), 'Passport must document key viral segment');
  assert.ok(strategyContent.includes('Solopreneur + AI'), 'Passport must document automation principles');

  const toolsPath = path.join(repoRoot, 'growth/TOOLS_AND_SCRIPTS.md');
  assert.ok(fs.existsSync(toolsPath), 'growth/TOOLS_AND_SCRIPTS.md must exist');
});

test('R-24: Curated Studio Audio Registry is defined with word/sentence assets and test suite', () => {
  const matrixContent = fs.readFileSync(matrixPath, 'utf8');
  assert.ok(matrixContent.includes('R-24'), 'DECISION_MATRIX.md must define R-24');
  assert.ok(matrixContent.includes('CURATED_STUDIO_AUDIO'), 'R-24 must document CURATED_STUDIO_AUDIO');
  assert.ok(matrixContent.includes('CURATED_SENTENCE_AUDIO'), 'R-24 must document CURATED_SENTENCE_AUDIO');
  assert.ok(matrixContent.includes('fetch_curated_audio.cjs'), 'R-24 must document fetch_curated_audio.cjs');
  assert.ok(matrixContent.includes('Франкенштейн'), 'Superseded Log must document Frankenstein syllable splicing ban');

  // Verify scripts and test files exist
  const fetchScriptPath = path.join(repoRoot, 'scripts/fetch_curated_audio.cjs');
  const testSuitePath = path.join(repoRoot, 'tests/studio-audio-dispatch.test.cjs');
  assert.ok(fs.existsSync(fetchScriptPath), 'scripts/fetch_curated_audio.cjs must exist');
  assert.ok(fs.existsSync(testSuitePath), 'tests/studio-audio-dispatch.test.cjs must exist');

  // Verify key audio assets exist
  const sababaWordPath = path.join(repoRoot, 'public/audio/words/sababa.mp3');
  const tachlesWordPath = path.join(repoRoot, 'public/audio/words/tachles.mp3');
  const sababaSentencePath = path.join(repoRoot, 'public/audio/sentences/hakol_sababa.mp3');
  assert.ok(fs.existsSync(sababaWordPath), 'public/audio/words/sababa.mp3 must exist');
  assert.ok(fs.existsSync(tachlesWordPath), 'public/audio/words/tachles.mp3 must exist');
  assert.ok(fs.existsSync(sababaSentencePath), 'public/audio/sentences/hakol_sababa.mp3 must exist');

  // Verify speech.ts implements both registries and sentence audio getter
  const speechPath = path.join(repoRoot, 'src/lib/speech.ts');
  const speechCode = fs.readFileSync(speechPath, 'utf8');
  assert.ok(speechCode.includes('CURATED_STUDIO_AUDIO'), 'speech.ts must define CURATED_STUDIO_AUDIO');
  assert.ok(speechCode.includes('CURATED_SENTENCE_AUDIO'), 'speech.ts must define CURATED_SENTENCE_AUDIO');
  assert.ok(speechCode.includes('getCuratedSentenceAudio'), 'speech.ts must export getCuratedSentenceAudio');
});

test('R-25: Viral Video Engine and VIDEO_PRODUCTION_PLAYBOOK.md invariants are defined and enforced', () => {
  const matrixContent = fs.readFileSync(matrixPath, 'utf8');
  assert.ok(matrixContent.includes('R-25'), 'DECISION_MATRIX.md must define R-25');
  assert.ok(matrixContent.includes('VIDEO_PRODUCTION_PLAYBOOK.md'), 'R-25 must reference VIDEO_PRODUCTION_PLAYBOOK.md');
  assert.ok(matrixContent.includes('position: absolute; inset: 0; visibility: hidden;'), 'R-25 must enforce scene positioning invariant');
  assert.ok(matrixContent.includes('косинусное сглаживание 15ms'), 'R-25 must enforce de-clicking invariant');

  const playbookPath = path.join(repoRoot, 'growth/VIDEO_PRODUCTION_PLAYBOOK.md');
  assert.ok(fs.existsSync(playbookPath), 'growth/VIDEO_PRODUCTION_PLAYBOOK.md must exist');
  const playbookContent = fs.readFileSync(playbookPath, 'utf8');
  assert.ok(playbookContent.includes('390x844'), 'Playbook must define mobile 9:16 viewport');
  assert.ok(playbookContent.includes('15ms'), 'Playbook must define 15ms de-clicking window');
  assert.ok(playbookContent.includes('atempo=1.22'), 'Playbook must define narrator speedup');

  // Verify tutorials registry exists
  const registryPath = path.join(repoRoot, 'growth/tutorials/registry.json');
  assert.ok(fs.existsSync(registryPath), 'growth/tutorials/registry.json must exist');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  assert.ok(registry.stages && registry.stages['stage-05-dialogue'], 'registry.json must track stage-05-dialogue in stages');
});


