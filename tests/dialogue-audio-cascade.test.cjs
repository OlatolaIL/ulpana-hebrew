/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');

test('Dialogue Audio: getDialogueTurnKey generates deterministic unique keys', () => {
  const { getDialogueTurnKey } = require(path.join(repoRoot, 'src/lib/dialogueAudio.ts'));

  assert.equal(getDialogueTurnKey(3, 't3-1', 'female', 'male'), 'd3_t3-1_fm');
  assert.equal(getDialogueTurnKey(3, 't3-2', 'male', 'female'), 'd3_t3-2_mf');
  assert.equal(getDialogueTurnKey(3, 't3-2', 'male', 'male'), 'd3_t3-2_mm');
  assert.equal(getDialogueTurnKey(3, 't3-2', 'female', 'female'), 'd3_t3-2_ff');
});

test('Dialogue Audio: manifest.json exists and all files are physically on disk', () => {
  const manifestPath = path.join(repoRoot, 'public/audio/dialogues/manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'public/audio/dialogues/manifest.json must exist');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const keys = Object.keys(manifest);
  assert.ok(keys.length >= 24, `Manifest should contain at least 24 entries, found: ${keys.length}`);

  for (const key of keys) {
    const entry = manifest[key];
    assert.ok(entry.fileName, `Entry ${key} must have fileName`);
    assert.ok(entry.engine === 'edge' || entry.engine === 'gemini', `Entry ${key} must have valid engine`);
    assert.ok(entry.speakerGender === 'male' || entry.speakerGender === 'female', `Entry ${key} must have speakerGender`);

    const filePath = path.join(repoRoot, 'public/audio/dialogues', entry.fileName);
    assert.ok(fs.existsSync(filePath), `Audio file ${filePath} must exist on disk`);
    const stat = fs.statSync(filePath);
    assert.ok(stat.size > 1000, `Audio file ${filePath} must be non-empty (>1000 bytes), actual: ${stat.size}`);
  }
});

test('Dialogue Audio: useScriptedDialogue uses 3-tier cascade and stopDialogueAudio', () => {
  const hookSource = fs.readFileSync(path.join(repoRoot, 'src/components/ScriptedDialogueTrainer/useScriptedDialogue.ts'), 'utf8');

  assert.ok(
    hookSource.includes('playDialogueTurnAudio'),
    'useScriptedDialogue must use playDialogueTurnAudio for turn playback'
  );
  assert.ok(
    hookSource.includes('stopDialogueAudio'),
    'useScriptedDialogue must use stopDialogueAudio for cleanup and cancellations'
  );
});
