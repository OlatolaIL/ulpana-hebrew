/** Explicit, bounded live evaluation. Never runs as part of npm test.
 * node --env-file=<private env path> --require ./tests/register.cjs scripts/evaluate-phone-live.cjs --run --provider=gemini --output=<path>
 */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {DETAILED_LESSONS}=require('../src/data/lessonsData.ts');
const {getLessonPhoneScenario,getPhoneLessonContract}=require('../src/data/phoneScenarios.ts');
const {buildPhonePrompt,validatePhoneReply}=require('../src/lib/phoneConversation.ts');
const {resolveAiKeys,geminiModels,groqModels}=require('../src/lib/aiModels.ts');
const getArg=(name)=>process.argv.find(a=>a.startsWith(`--${name}=`))?.slice(name.length+3);
if(!process.argv.includes('--run')) { console.error('Live requests require --run; use simulate-phone-conversations.cjs for offline auditing.'); process.exit(1); }
const provider=getArg('provider')||'gemini';
if(!['gemini','groq'].includes(provider)) throw new Error('Unknown provider');
const output=getArg('output'); if(!output) throw new Error('An evidence output path is required');
const keys=resolveAiKeys(provider), key=provider==='gemini'?keys.geminiKeys[0]:keys.groqKey;
if(!key) {console.error(`No ${provider} credential is available. No requests sent.`);process.exit(2);}
const model=(provider==='gemini'?geminiModels('phone'):groqModels('phone'))[0];
const cases=[
  {id:'rental-counter-question-and-refusal',lesson:7,gender:'male',turns:['שלום, יש בדירה מקרר ומיטה?','אני מחפש דירה של שני חדרים. כמה זה עולה?','היום לא. אפשר מחר?','תודה, להתראות']},
  {id:'rental-female-role-correction',lesson:7,gender:'female',turns:['שלום, אני משכירה דירה.','סליחה, אני מחפשת דירה של שלושה חדרים. יש מקרר?','תודה רבה, מה הכתובת?','לא היום. להתראות']},
  {id:'coffee-all-details-and-correction',lesson:2,gender:'female',turns:['שלום, אני רוצה תה בלי סוכר, בבקשה.','סליחה, עם סוכר. כמה זה עולה?','תודה רבה, אפשר גם מים?','כן, תודה, להתראות']},
  {id:'apartment-owner-27',lesson:27,gender:'female',turns:['שלום, יש מזגן בדירה?','כמה ארנונה?','תודה רבה, אפשר לראות מחר?','להתראות']},
  {id:'doctor-keeps-patient-role',lesson:14,gender:'male',turns:['שלום, כואב לי הראש.','יש לי חום. מה לעשות?','תודה רבה, להתראות']},
  {id:'booking-tamar',lesson:57,gender:'male',turns:['שלום, אפשר להזמין שולחן לארבעה אנשים?','מחר בשמונה, בבקשה.','לא היום, מחר.','תודה, להתראות']},
];
const only=getArg('case');const selected=only?cases.filter(c=>c.id===only):cases;
if(!selected.length)throw new Error('Unknown case');
const record={kind:'live-phone-evaluation',date:new Date().toISOString(),baseCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),provider,model,sourceHashes:{},cases:[],requests:0,limitations:['Representative cases only; deterministic acceptance does not certify semantic or linguistic correctness.','Synthetic students; no real learner data. No debrief/audio/ASR is tested.']};
for(const p of ['src/lib/phoneConversation.ts','src/lib/slotMemory.ts','src/data/phone/lessons01_50.ts','src/data/phone/lessons51_100.ts'])record.sourceHashes[p]=crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const save=()=>{fs.mkdirSync(path.dirname(path.resolve(output)),{recursive:true});fs.writeFileSync(output,JSON.stringify(record,null,2)+'\n');};
(async()=>{
 for(const c of selected){
  const contract=getPhoneLessonContract(c.lesson),scenario=getLessonPhoneScenario(DETAILED_LESSONS[c.lesson],c.gender);
  const vocabulary=[...new Set([...Object.values(DETAILED_LESSONS).filter(l=>l.number<=c.lesson).flatMap(l=>l.vocabulary.map(w=>w.hebrew)),...(scenario.usefulWords||[]).map(w=>w.hebrew)])];
  const history=[{role:'assistant',content:scenario.initialGreeting.hebrew}];
  const result={id:c.id,lesson:c.lesson,gender:c.gender,turns:[],initialGreeting:scenario.initialGreeting};record.cases.push(result);
  for(const student of c.turns){
   history.push({role:'user',content:student});
   const prompt=buildPhonePrompt({lessonNumber:c.lesson,gender:c.gender,contract,scenario,turns:history,vocabulary});
   let entry={student,accepted:false};result.turns.push(entry);
   const start=Date.now();
   try{
    const gem=provider==='gemini';record.requests++;
    const res=await fetch(gem?`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`:'https://api.groq.com/openai/v1/chat/completions',{
     method:'POST',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/json',...(gem?{'x-goog-api-key':key}:{Authorization:`Bearer ${key}`})},
     body:JSON.stringify(gem?{systemInstruction:{parts:[{text:prompt}]},contents:history.map(t=>({role:t.role==='user'?'user':'model',parts:[{text:t.content}]})),generationConfig:{responseMimeType:'application/json',temperature:0.3}}:{model,messages:[{role:'system',content:prompt},...history],response_format:{type:'json_object'},temperature:0.3,max_tokens:500}),
    });entry.status=res.status;entry.latencyMs=Date.now()-start;
    if(!res.ok){entry.error=`provider_http_${res.status}`;save();if(res.status===429){record.stoppedReason='Provider rate limit; remaining cases not attempted.';save();process.exitCode=1;return;}break;}
    const data=await res.json();const raw=gem?data.candidates?.[0]?.content?.parts?.[0]?.text:data.choices?.[0]?.message?.content;
    const parsed=JSON.parse(raw);entry.reply=parsed;
    const accepted=validatePhoneReply(parsed,{contract,turns:history,lessonNumber:c.lesson});entry.accepted=true;entry.endReason=accepted.endReason;entry.normalizedReply=accepted;
    history.push({role:'assistant',content:accepted.hebrew});save();
    if(accepted.shouldHangUp)break;
   }catch(e){entry.latencyMs=Date.now()-start;entry.error=e.name==='TimeoutError'?'timeout':e instanceof SyntaxError?'invalid_json':e.message.replace(/https?:\S+/g,'[url]');save();break;}
   await new Promise(r=>setTimeout(r,Number(getArg('delay-ms')||6500)));
  }
  console.log(JSON.stringify({case:c.id,requests:result.turns.length,accepted:result.turns.filter(t=>t.accepted).length}));
  save();
 }
 process.exitCode=record.cases.some(c=>c.turns.some(t=>!t.accepted))?1:0;
})().catch(()=>{save();console.error('Evaluation stopped; see sanitized evidence.');process.exitCode=1;});
