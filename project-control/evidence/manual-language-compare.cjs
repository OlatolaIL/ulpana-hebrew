const fs=require('node:fs'),assert=require('node:assert/strict');
const before=JSON.parse(fs.readFileSync('work/manual-language-full-before-b2dd.json'));
const after=JSON.parse(fs.readFileSync(process.argv[2]));
const changes=[];const groupChanges=[];
function diff(a,b,p){if(JSON.stringify(a)===JSON.stringify(b))return;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],p+'.'+k);}else changes.push({path:p,before:a,after:b});}
for(let i=0;i<100;i++){
  const a=before.records[i],b=after.records[i];assert.equal(a.id,b.id);
  for(const key of ['lesson','phone','essay','scripted','initial'])if(JSON.stringify(a[key])!==JSON.stringify(b[key]))groupChanges.push({id:a.id,field:key});
  if(a.id>5)assert.deepEqual(b,a,'Record beyond pilot changed: '+a.id);
  assert.deepEqual(b.phone,a.phone,'Phone data changed: '+a.id);
  assert.deepEqual(b.essay,a.essay,'Essay data changed: '+a.id);
  assert.deepEqual(b.scripted,a.scripted,'Scripted dialogue changed: '+a.id);
  diff(a,b,'lesson'+a.id);
}
assert.deepEqual(after.records[3],before.records[3],'Lesson 4 changed');
const result={base:before.commit,commit:after.commit,unchangedBeyondPilot:95,unchangedPhoneScenarios:200,unchangedEssays:100,unchangedScriptedDialogues:100,lesson4Unchanged:true,groupChanges,changes};
fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
