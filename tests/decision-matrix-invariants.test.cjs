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
  const expectedRules = ['R-01', 'R-02', 'R-03', 'R-04', 'R-05', 'R-07', 'R-08', 'R-10', 'R-11', 'R-13', 'R-14', 'R-15', 'R-16'];
  for (const rule of expectedRules) {
    assert.ok(matrixContent.includes(rule), `DECISION_MATRIX.md must define rule ${rule}`);
  }

  // Check required sections
  assert.ok(matrixContent.includes('BLOCKING'), 'Must define BLOCKING level');
  assert.ok(matrixContent.includes('SUPERSEDED'), 'Must define SUPERSEDED level');
  assert.ok(matrixContent.includes('Superseded Log'), 'Must include Superseded Log section');
});

test('R-15: Stage 6 phone call passport exists and specifies all core invariants (P-01 to P-06)', () => {
  const passportPath = path.join(repoRoot, 'docs/mechanics/stage-06-phone-call.md');
  assert.ok(fs.existsSync(passportPath), 'stage-06-phone-call.md must exist in docs/mechanics');
  const content = fs.readFileSync(passportPath, 'utf8');

  const requiredInvariants = ['P-01', 'P-02', 'P-03', 'P-04', 'P-05', 'P-06'];
  for (const inv of requiredInvariants) {
    assert.ok(content.includes(inv), `Stage 6 passport must define invariant ${inv}`);
  }
  assert.ok(content.includes('Slot Memory'), 'Must specify Slot Memory invariant');
  assert.ok(content.includes('Speech Integrity'), 'Must specify Speech Integrity invariant');
  assert.ok(content.includes('Role Rigidity'), 'Must specify Role Rigidity invariant');
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
