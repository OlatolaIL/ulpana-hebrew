// Bounded local API harness with synthetic pupils. Auth/DB stubbed; model HTTP is real.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const repo=path.resolve(__dirname,'..');
if(!process.argv.includes('--run')){console.error('Live evaluation requires --run and --output=<path>.');process.exit(1);}
require(path.join(repo,'tests/register.cjs'));
const {NextRequest}=require(path.join(repo,'node_modules/next/server'));
const auth=require(path.join(repo,'src/lib/auth.ts'));
const db=require(path.join(repo,'src/lib/db.ts'));
const rate=require(path.join(repo,'src/lib/rateLimit.ts'));
auth.verifySessionToken=async()=>({id:'synthetic-live-phone-review',subscriptionTier:'pro'});
db.getDbPool=()=>null;
rate.checkRateLimit=()=>({allowed:true,remaining:20,resetInSeconds:0});
process.env.DATABASE_URL='';process.env.POSTGRES_URL='';
const outputArg=process.argv.find(a=>a.startsWith('--output='));
if(!outputArg)throw new Error('Evidence output path is required');
const output=path.resolve(outputArg.slice(9));fs.mkdirSync(path.dirname(output),{recursive:true});
const originalFetch=globalThis.fetch;
const record={kind:'live-debrief-evaluation',date:new Date().toISOString(),sourceHashes:{},cases:[],requests:[],validationWarnings:[],limitations:['Auth/rate/DB are stubbed; provider requests and debrief validation are real.','Synthetic transcripts, no audio/ASR. A three-case smoke check is not full grading calibration.']};
console.warn=(label,error)=>record.validationWarnings.push({label,error:error instanceof Error?error.message:'unrecognized_error'});
for(const f of ['src/app/api/ai/phone/debrief/route.ts','src/lib/phoneGoalEvidence.ts','src/data/phone/lessons01_50.ts'])record.sourceHashes[f]=crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,f))).digest('hex');
globalThis.fetch=async(url,options)=>{const host=new URL(String(url)).hostname;if(!['generativelanguage.googleapis.com','api.groq.com'].includes(host))throw new Error('Unexpected external service');const start=Date.now();const res=await originalFetch(url,options);record.requests.push({host,status:res.status,latencyMs:Date.now()-start});return res;};
const {POST}=require(path.join(repo,'src/app/api/ai/phone/debrief/route.ts'));
const turn=(role,hebrew)=>({role,hebrew});
const cases=[
 {id:'introduction-complete',lesson:1,expectedSuccess:true,transcript:[turn('assistant','שלום, זה נועם. מה נשמע?'),turn('user','שלום, הכל בסדר. קוראים לי דנה.'),turn('assistant','נעים מאוד, דנה!'),turn('user','תודה, להתראות.'),turn('assistant','להתראות!')]},
 {id:'rental-explicit-refusal',lesson:7,expectedSuccess:true,transcript:[turn('assistant','שלום, כמה חדרים את מחפשת?'),turn('user','אני מחפשת שני חדרים. יש מקרר?'),turn('assistant','כן, יש מקרר ומיטה. אפשר היום בשבע בערב, זה מתאים לך?'),turn('user','לא תודה, אני לא רוצה לראות את הדירה. להתראות.'),turn('assistant','להתראות!')]},
 {id:'rental-incomplete-goodbye',lesson:7,expectedSuccess:false,transcript:[turn('assistant','שלום, כמה חדרים את מחפשת?'),turn('user','תודה, להתראות.'),turn('assistant','להתראות!')]},
];
(async()=>{for(const c of cases){const start=Date.now();const response=await POST(new NextRequest('http://localhost/api/ai/phone/debrief',{method:'POST',headers:{'Content-Type':'application/json',cookie:'ulpana_session=synthetic'},body:JSON.stringify({lessonNumber:c.lesson,userGender:'female',transcript:c.transcript})}));const report=await response.json();record.cases.push({...c,status:response.status,latencyMs:Date.now()-start,report,expectationMet:response.status===200&&report.isSuccess===c.expectedSuccess});fs.writeFileSync(output,JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify({case:c.id,status:response.status,isSuccess:report.isSuccess,expected:c.expectedSuccess}));}process.exitCode=record.cases.every(c=>c.expectationMet)?0:1;})().catch(()=>{fs.writeFileSync(output,JSON.stringify(record,null,2)+'\n');console.error('Evaluation stopped; see sanitized evidence.');process.exitCode=1;});
