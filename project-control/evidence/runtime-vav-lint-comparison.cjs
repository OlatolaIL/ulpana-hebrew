const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root='C:/Users/azrie/Documents/antigravity/goofy-maxwell-runtime-vav';
const {ESLint}=require(require.resolve('eslint',{paths:[root]}));
(async()=>{
  const eslint=new ESLint({cwd:root});const checks=[];
  for(const file of ['src/lib/speech.ts','src/app/api/ai/phone/route.ts','src/app/api/ai/chat/route.ts']){
    const old=cp.execFileSync('git',['show','d413f94:'+file],{cwd:root,encoding:'utf8'}),current=fs.readFileSync(path.join(root,file),'utf8');
    const lint=async text=>(await eslint.lintText(text,{filePath:path.join(root,file)}))[0].messages.map(({ruleId,severity,message,line,column})=>({ruleId,severity,message,line,column}));
    const before=await lint(old),after=await lint(current);
    const normalized=xs=>xs.map(({line,column,...m})=>m).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
    assert.deepEqual(normalized(after),normalized(before),file+': lint findings changed');
    checks.push({file,before,after,unchangedIgnoringLocation:true});
  }
  const result={commit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),checks};
  fs.writeFileSync(path.join(__dirname,'runtime-vav-lint-comparison.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(checks.map(x=>({file:x.file,errors:x.after.filter(m=>m.severity===2).length,warnings:x.after.filter(m=>m.severity===1).length,unchanged:true}))));
})().catch(e=>{console.error(e);process.exitCode=1;});
