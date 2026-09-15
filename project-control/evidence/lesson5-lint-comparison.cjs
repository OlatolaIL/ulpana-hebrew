const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const root = 'C:/Users/azrie/Documents/antigravity/goofy-maxwell-lesson5-practice';
const { ESLint } = require(require.resolve('eslint', { paths: [root] }));
(async () => {
  const eslint = new ESLint({ cwd: root });
  const checks = [];
  for (const filename of ['src/data/lessons/alef_01_10.ts', 'src/data/phoneScenarios.ts', 'tests/pilot-mechanics-01-05.test.cjs']) {
    const oldSource = cp.execFileSync('git', ['show', 'e8148cc:' + filename], { cwd: root, encoding: 'utf8' });
    const currentSource = fs.readFileSync(path.join(root, filename), 'utf8');
    const getMessages = async source => (await eslint.lintText(source, { filePath: path.join(root, filename) }))[0].messages.map(m => ({ ruleId: m.ruleId, severity: m.severity, line: m.line, column: m.column, message: m.message }));
    const before = await getMessages(oldSource);
    const after = await getMessages(currentSource);
    const normalize = messages => messages.map(({line, column, ...m}) => m).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
    assert.deepEqual(normalize(after), normalize(before), filename + ': new lint findings');
    checks.push({ filename, before, after, sameFindingsIgnoringLocation: true });
  }
  const result = { commit: cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), checks };
  fs.writeFileSync(path.join(__dirname, 'lesson5-d413-lint-comparison.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(checks.map(c => ({file:c.filename, errors:c.after.filter(m=>m.severity===2).length, warnings:c.after.filter(m=>m.severity===1).length, unchanged:true}))));
})().catch(e => { console.error(e); process.exitCode = 1; });
