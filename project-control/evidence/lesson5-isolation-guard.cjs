const fs = require('node:fs');
const path = require('node:path');
const { after } = require('node:test');
const root = process.cwd();
const globals = ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'IS_REACT_ACT_ENVIRONMENT', 'addEventListener', 'removeEventListener'];
const before = new Map(globals.map(key => [key, global[key]]));
const speech = require(path.join(root, 'src/lib/speech.ts'));
const speakBefore = speech.speakHebrew;
const confettiPath = require.resolve('canvas-confetti', { paths: [root] });
const confettiBefore = require(confettiPath);
after(() => {
  const leakedGlobals = globals.filter(key => global[key] !== before.get(key));
  const result = { leakedGlobals, speechReplaced: speech.speakHebrew !== speakBefore,
    confettiCacheReplaced: require.cache[confettiPath]?.exports !== confettiBefore };
  fs.writeFileSync(process.env.REVIEW_ISOLATION_OUTPUT || path.join('C:/Users/azrie/Documents/Codex/2026-09-13/referenced-chatgpt-conversation-this-is-an/work', 'lesson5-isolation-current.json'), JSON.stringify(result, null, 2));
  console.log('ISOLATION ' + JSON.stringify(result));
  if (leakedGlobals.length || result.speechReplaced || result.confettiCacheReplaced) {
    process.once('exit', () => { process.exitCode = 1; });
    throw new Error('Test leaves modified shared process state');
  }
});
