const cp=require('node:child_process');
const path=require('node:path');
const root=process.cwd();
const ts=require(path.join(root,'node_modules/typescript'));
const allowed=['src/lib/speech.ts','src/app/api/ai/phone/route.ts','src/app/api/ai/chat/route.ts'];
const selected=process.env.REVIEW_OLD_FILES?process.env.REVIEW_OLD_FILES.split(','):allowed;
if(selected.some(f=>!allowed.includes(f)))throw new Error('Unexpected baseline module');
const sources=new Map(selected.map(f=>[path.resolve(root,f),cp.execFileSync('git',['show','d413f9489f144599c4c95bd8321c9613b01a78db:'+f],{cwd:root,encoding:'utf8'})]));
const previousLoader=require.extensions['.ts'];
require.extensions['.ts']=function(module,filename){
  const source=sources.get(path.resolve(filename));
  if(source===undefined)return previousLoader(module,filename);
  const result=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX},fileName:filename});
  module._compile(result.outputText,filename);
};
// Actual baseline modules in the test process only; filesystem and current tests remain unchanged.
