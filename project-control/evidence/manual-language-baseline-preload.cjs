const cp=require('node:child_process'),path=require('node:path');
const root=process.cwd(),ts=require(path.join(root,'node_modules/typescript'));
const allowed=['src/data/lessons/alef_01_10.ts','src/components/LessonAiChat/helpers.ts'];
const selected=process.env.REVIEW_OLD_FILES?process.env.REVIEW_OLD_FILES.split(','):allowed;
if(selected.some(f=>!allowed.includes(f)))throw new Error('Unexpected baseline module');
const sources=new Map(selected.map(f=>[path.resolve(root,f),cp.execFileSync('git',['show','b2dd5f21eaace35604285d011e889350f1729679:'+f],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024})]));
const previousLoader=require.extensions['.ts'];
require.extensions['.ts']=function(module,filename){
  const source=sources.get(path.resolve(filename));
  if(source===undefined)return previousLoader(module,filename);
  const result=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX},fileName:filename});
  module._compile(result.outputText,filename);
};
