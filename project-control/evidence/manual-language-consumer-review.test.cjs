// Independent reviewer probe. Runs from the candidate worktree; no application files written.
const path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const root=process.cwd(),fromRoot=f=>require(path.join(root,f));
const {getLessonById}=fromRoot('src/data/lessonsData.ts');
test('Actual buildInitialMessage preserves u- in greetings and suggested replies for both genders',()=>{
  const {buildInitialMessage}=fromRoot('src/components/LessonAiChat/useAiChat.ts');
  for(const gender of ['male','female']){
    const message=buildInitialMessage(getLessonById(5),gender);
    assert.ok(message.hebrew.includes('וּמְלָפְפֹנִים'));
    assert.ok(message.transcription.includes('у-млафэфонӣм'),gender+' initial transcription');
    assert.ok(message.suggestedReplies[1].transcription.includes('у-млафэфонӣм'),gender+' suggested reply');
    assert.ok(!JSON.stringify(message).includes('вэ-млафэфонӣм'));
  }
});
test('Normative present feminine gara agrees across lesson 3 table, word and explanation',()=>{
  const l=getLessonById(3);
  assert.equal(l.grammar[0].tables[0].rows[1][2],'гарá');
  assert.equal(l.vocabulary.find(w=>w.id==='w3-3').transcription,'гар / гарá');
  assert.ok(l.exercises.find(e=>e.id==='ex3-5').explanation.includes('гар / гарá'));
});
test('LessonExercises DOM ex1-2 and ex1-6: pointed Toda, wrong feedback, retry, correct feedback',async()=>{
  const keys=['window','document','navigator','HTMLElement','Element','Node','HTMLTextAreaElement','IS_REACT_ACT_ENVIRONMENT','addEventListener','removeEventListener','requestAnimationFrame','cancelAnimationFrame'];
  const globals=new Map(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  const confettiPath=require.resolve(path.join(root,'node_modules/canvas-confetti'));
  const componentPath=require.resolve(path.join(root,'src/components/LessonExercises.tsx'));
  const cached=new Map([confettiPath,componentPath].map(k=>[k,require.cache[k]]));
  const speech=fromRoot('src/lib/speech.ts'),savedSpeak=Object.getOwnPropertyDescriptor(speech,'speakHebrew');
  const React=fromRoot('node_modules/react');
  const {act}=React;
  let dom,reactRoot;
  try{
    const stub=()=>Promise.resolve();stub.default=stub;stub.reset=()=>{};stub.create=()=>stub;
    require.cache[confettiPath]={id:confettiPath,filename:confettiPath,loaded:true,exports:stub};
    delete require.cache[componentPath];
    const {JSDOM}=fromRoot('node_modules/jsdom');
    dom=new JSDOM('<!doctype html><div id="root"></div>',{url:'http://localhost',pretendToBeVisual:true});
    const values={window:dom.window,document:dom.window.document,navigator:dom.window.navigator,IS_REACT_ACT_ENVIRONMENT:true};
    for(const k of ['HTMLElement','Element','Node','HTMLTextAreaElement'])values[k]=dom.window[k];
    for(const k of ['addEventListener','removeEventListener','requestAnimationFrame','cancelAnimationFrame'])values[k]=dom.window[k].bind(dom.window);
    for(const [key,value] of Object.entries(values))Object.defineProperty(globalThis,key,{value,writable:true,configurable:true,enumerable:true});
    dom.window.Element.prototype.scrollIntoView=()=>{};dom.window.scrollTo=()=>{};
    speech.speakHebrew=()=>{};
    const {createRoot}=fromRoot('node_modules/react-dom/client');
    const {LessonExercises}=require(componentPath);
    const {createGuestProfile}=fromRoot('src/lib/storage.ts');
    const container=dom.window.document.getElementById('root');
    reactRoot=createRoot(container);
    const lesson=getLessonById(1),exercises=['ex1-2','ex1-6'].map(id=>lesson.exercises.find(e=>e.id===id));
    await act(async()=>{reactRoot.render(React.createElement(LessonExercises,{lesson:{...lesson,exercises},userProfile:createGuestProfile()}));});
    const buttons=()=>[...container.querySelectorAll('button')];
    const clickExact=async label=>{const b=buttons().find(b=>b.textContent.trim()===label);assert.ok(b,'Visible button '+label);await act(async()=>b.click());};
    const clickContaining=async label=>{const b=buttons().find(b=>b.textContent.includes(label));assert.ok(b,'Visible control '+label);await act(async()=>b.click());};
    for(let i=0;i<exercises.length;i++){
      const ex=exercises[i];
      assert.ok(buttons().some(b=>b.textContent.trim()==='תּוֹדָה'),ex.id+' pointed Toda in DOM');
      const wrong=i===0?'תּוֹדָה':ex.options.find(o=>o!==ex.correctAnswer);
      await clickExact(wrong);
      assert.ok(container.textContent.includes('Почти получилось! Обратите внимание:'),ex.id+' actual error feedback');
      assert.ok(!container.textContent.includes('Верно! Отличный ответ.'));
      await clickContaining('Попробовать ещё раз');
      assert.ok(!container.textContent.includes('Почти получилось!'));
      await clickExact(ex.correctAnswer);
      assert.ok(container.textContent.includes('Верно! Отличный ответ.'),ex.id+' actual success feedback');
      assert.ok(!container.textContent.includes('Почти получилось!'));
      if(i<exercises.length-1)await clickContaining('Следующий вопрос');
    }
  }finally{
    try{if(reactRoot)await act(async()=>reactRoot.unmount());}finally{
      dom?.window.close();
      for(const [key,desc] of globals){if(desc)Object.defineProperty(globalThis,key,desc);else delete globalThis[key];}
      Object.defineProperty(speech,'speakHebrew',savedSpeak);
      for(const [key,entry] of cached){if(entry)require.cache[key]=entry;else delete require.cache[key];}
    }
  }
  for(const [key,desc] of globals)assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis,key),desc,'restore '+key);
  for(const [key,entry] of cached)assert.equal(require.cache[key],entry,'restore cache '+key);
  assert.deepEqual(Object.getOwnPropertyDescriptor(speech,'speakHebrew'),savedSpeak);
});
