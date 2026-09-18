/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');

test('Device diagnostics module collects complete diagnostic snapshot', async () => {
  const { collectDeviceDiagnostics } = require('../src/lib/deviceDiagnostics.ts');
  const report = await collectDeviceDiagnostics();

  assert.ok(report, 'Report should be defined');
  assert.ok(report.timestamp, 'Report must have timestamp');
  assert.ok(report.environment, 'Report must have environment data');
  assert.ok(report.pwaAndCache, 'Report must have PWA and cache data');
  assert.ok(report.speechSynthesis, 'Report must have speech synthesis data');
  assert.ok(report.phoneticTransformations, 'Report must have phonetic transformations');
  assert.equal(report.phoneticTransformations['סבבה'], 'סַבָּ-בָּה');
  assert.equal(report.phoneticTransformations['סַבָּבָה'], 'סַבָּ-בָּה');
  assert.ok(report.liveSpeechTest, 'Report must have live speech test result');
});

test('Navbar.tsx contains diagnostic button and DeviceDiagnosticsModal in the header', () => {
  const navbarPath = path.join(repoRoot, 'src/components/Navbar.tsx');
  const content = fs.readFileSync(navbarPath, 'utf8');

  assert.ok(
    content.includes('handleRunDiagnostics'),
    'Navbar must contain handleRunDiagnostics handler'
  );
  assert.ok(
    content.includes('DeviceDiagnosticsModal'),
    'Navbar must render DeviceDiagnosticsModal'
  );
  assert.ok(
    content.includes('Диагностика синтеза речи и аудио устройства'),
    'Navbar must have diagnostic button with proper title'
  );
});

test('DeviceDiagnosticsModal renders 1-click copy, download and live speech test replay', () => {
  const modalPath = path.join(repoRoot, 'src/components/DeviceDiagnosticsModal.tsx');
  const content = fs.readFileSync(modalPath, 'utf8');

  assert.ok(
    content.includes('handleCopy'),
    'Modal must support 1-click clipboard copy'
  );
  assert.ok(
    content.includes('downloadDiagnosticsFile'),
    'Modal must support downloading diagnostics file'
  );
  assert.ok(
    content.includes('handlePlayVariant'),
    'Modal must support replaying speech test variants'
  );
  assert.ok(
    content.includes('SABABA_TEST_VARIANTS'),
    'Modal must contain sababa phonetic test variants bench'
  );
});
