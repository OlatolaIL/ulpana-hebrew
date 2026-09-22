/** Static scenario audit. This command does not call or certify an AI model. */
const { DETAILED_LESSONS } = require('../src/data/lessonsData.ts');
const { getLessonPhoneScenario, getPhoneLessonContract } = require('../src/data/phoneScenarios.ts');
const arg = process.argv.find(a => a.startsWith('--lesson='));
const selected = arg ? Number(arg.split('=')[1]) : null;
if (selected !== null && (!Number.isInteger(selected) || selected < 1 || selected > 100)) {
  console.error('Use --lesson=1..100 or --all'); process.exit(1);
}
const ids = selected === null ? Array.from({length:100},(_,i)=>i+1) : [selected];
const failures=[];
for (const id of ids) for (const gender of ['male','female']) {
  try {
    const c=getPhoneLessonContract(id), s=getLessonPhoneScenario(DETAILED_LESSONS[id],gender);
    if (!c.facts.length || !c.studentDetails.length || !c.goals.length || !c.completionCondition ||
        !['male','female'].includes(c.callerGender) || !['incoming','outgoing'].includes(c.callType) ||
        !s.initialGreeting.hebrew || !s.initialGreeting.transcription || !s.initialGreeting.translation ||
        !s.suggestedReplies.length) throw new Error('Incomplete authored scenario');
  } catch(e) { failures.push({lesson:id,gender,error:e.message}); }
}
console.log(JSON.stringify({kind:'static-contract-audit',variants:ids.length*2,failures,liveModelTested:false},null,2));
process.exitCode=failures.length?1:0;
