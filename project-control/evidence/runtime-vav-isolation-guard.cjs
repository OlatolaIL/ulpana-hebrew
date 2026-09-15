const fs=require('node:fs');
const path=require('node:path');
const {after}=require('node:test');
const tracked=['window','document','navigator','HTMLElement','Element','Node','HTMLTextAreaElement','IS_REACT_ACT_ENVIRONMENT','addEventListener','removeEventListener','requestAnimationFrame','cancelAnimationFrame','SpeechSynthesisUtterance','Audio','localStorage','fetch'];
const before=new Map(tracked.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
const envNames=['NODE_ENV','JWT_SECRET','DATABASE_URL','POSTGRES_URL','GROQ_API_KEY','GEMINI_API_KEY','GROQ_FALLBACK_MODEL'];
const envBefore=new Map(envNames.map(k=>[k,{exists:Object.hasOwn(process.env,k),value:process.env[k]}]));
const sameDescriptor=(a,b)=>{
  if(a===undefined||b===undefined)return a===b;
  return ['value','get','set','writable','enumerable','configurable'].every(k=>a[k]===b[k]);
};
after(()=>{
  const leakedGlobals=tracked.filter(k=>!sameDescriptor(before.get(k),Object.getOwnPropertyDescriptor(globalThis,k)));
  const leakedEnvKeys=envNames.filter(k=>{const v=envBefore.get(k);return v.exists!==Object.hasOwn(process.env,k)||v.value!==process.env[k];});
  const result={leakedGlobals,leakedEnvKeys,scope:'Named global property descriptors and environment keys; no secret values recorded'};
  fs.writeFileSync(process.env.REVIEW_ISOLATION_OUTPUT||path.join(__dirname,'runtime-vav-isolation-current.json'),JSON.stringify(result,null,2));
  console.log('ISOLATION '+JSON.stringify(result));
  if(leakedGlobals.length||leakedEnvKeys.length){process.once('exit',()=>{process.exitCode=1;});throw new Error('Test leaves modified shared state');}
});
