const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const Module = require('node:module');
const root = process.cwd();
const ts = require(path.join(root, 'node_modules/typescript'));
const filename = path.join(root, 'src/data/lessons/alef_01_10.ts');
const source = cp.execFileSync('git', ['show', 'e8148cc0ec2d107b76b5db53908f3aa0e6202b34:src/data/lessons/alef_01_10.ts'], { cwd: root, encoding: 'utf8' });
const old = new Module(filename, module);
old.filename = filename;
old.paths = Module._nodeModulePaths(path.dirname(filename));
require.cache[filename] = old;
old._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);
old.loaded = true;
// Real old lesson data only. Current component and current tests are unchanged.
