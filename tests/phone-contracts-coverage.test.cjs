'use strict';
// Runs validate_phone_contracts.cjs as a child process and asserts its output.
// This test verifies schema completeness across all 100 contracts without requiring
// a live API call. Ambiguous goal types produce warnings, not failures.
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const scriptPath = path.resolve(__dirname, '..', 'scripts', 'validate_phone_contracts.cjs');
const root = path.resolve(__dirname, '..');

test('all 100 phone contracts pass schema validation', () => {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    encoding: 'utf8',
    timeout: 30000,
  });

  if (result.error) throw result.error;

  // Must report exactly 100 contracts checked
  assert.match(result.stdout, /Lessons checked: 100/, 'Expected exactly 100 lessons checked');

  // Must report schema failures = 0
  assert.match(result.stdout, /Schema failures: 0/, 'Expected 0 schema failures');

  // Must not contain any [FAIL] lines
  assert.doesNotMatch(result.stdout, /\[FAIL\]/, 'No contract should fail schema validation');

  // Must exit cleanly
  assert.equal(result.status, 0, `Validation script exited with code ${result.status}.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
});

test('ambiguous goal types are reported explicitly (not hidden)', () => {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    encoding: 'utf8',
    timeout: 30000,
  });

  if (result.error) throw result.error;

  // The script ALWAYS reports the count of ambiguous types (even if 0)
  assert.match(result.stdout, /Ambiguous goals \(inferred as 'other'\):/, 'Ambiguous goals section must always appear');
  assert.match(result.stdout, /Ambiguous types \(author review needed\): \d+/, 'Ambiguous type count must be reported');
});
