const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(process.argv[2]),output=path.resolve(process.argv[3]);
require(path.join(root,'tests/register.cjs'));
const {getLessonById}=require(path.join(root,'src/data/lessonsData.ts'));
const {getLessonPhoneScenario}=require(path.join(root,'src/data/phoneScenarios.ts'));
const {getLessonEssayPrompt}=require(path.join(root,'src/data/essayTopics.ts'));
const {getScriptedDialogueForLesson}=require(path.join(root,'src/data/dialogueLessons.ts'));
const {buildInitialMessage}=require(path.join(root,'src/components/LessonAiChat/useAiChat.ts'));
const records=Array.from({length:100},(_,i)=>{
  const id=i+1,lesson=getLessonById(id);
  return {id,lesson,phone:{male:getLessonPhoneScenario(lesson,'male'),female:getLessonPhoneScenario(lesson,'female')},essay:getLessonEssayPrompt(id),scripted:getScriptedDialogueForLesson(id),initial:{male:buildInitialMessage(lesson,'male'),female:buildInitialMessage(lesson,'female')}};
});
const result={capturedAt:new Date().toISOString(),commit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),records};
fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({commit:result.commit,records:records.length,fields:Object.keys(records[0]),output}));
