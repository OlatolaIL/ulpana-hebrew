/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.join(__dirname, '..');
const scriptPath = path.join(repoRoot, 'growth/scripts/post_to_youtube.cjs');

test('R-23: growth/scripts/post_to_youtube.cjs exists in isolated growth контур', () => {
  assert.ok(fs.existsSync(scriptPath), 'post_to_youtube.cjs must exist in growth/scripts');
});

test('R-16: post_to_youtube.cjs does NOT contain hardcoded secrets or tokens', () => {
  const content = fs.readFileSync(scriptPath, 'utf8');
  assert.ok(!content.includes('AIzaSy'), 'Must not contain hardcoded Google API keys');
  assert.ok(!content.includes('GOCSPX-'), 'Must not contain hardcoded OAuth client secrets');
  assert.ok(content.includes('process.env.YOUTUBE_CLIENT_ID'), 'Must read client ID from env');
  assert.ok(content.includes('process.env.YOUTUBE_CLIENT_SECRET'), 'Must read client secret from env');
  assert.ok(content.includes('process.env.YOUTUBE_REFRESH_TOKEN'), 'Must read refresh token from env');
});

test('YouTube Autoposter exports valid sample post structure and resolves default video', () => {
  const { samplePost, resolveVideoPath } = require(scriptPath);

  assert.ok(samplePost, 'samplePost must be defined');
  assert.ok(samplePost.title, 'samplePost.title must be defined');
  assert.ok(samplePost.title.length <= 100, 'YouTube title must be <= 100 chars');
  assert.ok(samplePost.title.includes('#Shorts'), 'Title should include #Shorts tag');
  assert.ok(samplePost.description.includes('promo=YT'), 'Description must include YT promo link');
  assert.ok(Array.isArray(samplePost.tags), 'samplePost.tags must be an array');
  assert.ok(samplePost.tags.length > 0, 'Tags array must not be empty');

  const resolved = resolveVideoPath(null);
  assert.ok(resolved, 'Must resolve a default video from public/demo');
  assert.ok(fs.existsSync(resolved), `Resolved video ${resolved} must physically exist`);
});

test('YouTube Autoposter executes clean dry-run preview (--preview)', () => {
  const res = spawnSync('node', [scriptPath, '--preview'], {
    cwd: repoRoot,
    encoding: 'utf8'
  });

  assert.strictEqual(res.status, 0, `Dry-run must exit with code 0: ${res.stderr}`);
  assert.ok(res.stdout.includes('ПРЕДПРОСМОТР (DRY RUN)'), 'Stdout must show dry run mode');
  assert.ok(res.stdout.includes('YouTube Data API v3'), 'Stdout must mention YouTube Data API v3');
  assert.ok(res.stdout.includes('#Shorts'), 'Stdout must show Shorts title');
  assert.ok(res.stdout.includes('--send'), 'Stdout must suggest --send flag');
  assert.ok(res.stdout.includes('--auth'), 'Stdout must suggest --auth flag');
});

test('YouTube Autoposter gracefully fails when credentials are missing on --send', () => {
  const res = spawnSync('node', [scriptPath, '--send'], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      YOUTUBE_CLIENT_ID: '',
      YOUTUBE_CLIENT_SECRET: '',
      YOUTUBE_REFRESH_TOKEN: ''
    }
  });

  assert.strictEqual(res.status, 1, 'Must exit with code 1 when credentials missing');
  assert.ok(
    res.stderr.includes('Отсутствуют учетные данные') || res.stderr.includes('YOUTUBE_') || res.stdout.includes('Ошибка авторизации'),
    'Must provide helpful error about missing credentials'
  );
});

test('Documentation and registry integration for YouTube autoposting', () => {
  const toolsDoc = fs.readFileSync(path.join(repoRoot, 'growth/TOOLS_AND_SCRIPTS.md'), 'utf8');
  assert.ok(toolsDoc.includes('post_to_youtube.cjs'), 'TOOLS_AND_SCRIPTS.md must document post_to_youtube.cjs');
  assert.ok(toolsDoc.includes('--auth'), 'TOOLS_AND_SCRIPTS.md must document --auth');
  assert.ok(toolsDoc.includes('--preview'), 'TOOLS_AND_SCRIPTS.md must document --preview');

  const channelsDoc = fs.readFileSync(path.join(repoRoot, 'growth/CHANNELS_AND_ASSETS.md'), 'utf8');
  assert.ok(channelsDoc.includes('YOUTUBE_CLIENT_ID'), 'CHANNELS_AND_ASSETS.md must document YOUTUBE_CLIENT_ID');
  assert.ok(channelsDoc.includes('YOUTUBE_REFRESH_TOKEN'), 'CHANNELS_AND_ASSETS.md must document YOUTUBE_REFRESH_TOKEN');

  const founderDoc = fs.readFileSync(path.join(repoRoot, 'growth/FOUNDER_TODO.md'), 'utf8');
  assert.ok(founderDoc.includes('post_to_youtube.cjs'), 'FOUNDER_TODO.md must reference post_to_youtube.cjs');
});
