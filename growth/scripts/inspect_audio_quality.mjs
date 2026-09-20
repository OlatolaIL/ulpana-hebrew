import fs from 'fs';
import path from 'path';

async function checkAudio() {
  let groqKey = process.env.GROQ_API_KEY;
  if (!groqKey && fs.existsSync('.env.local')) {
    const lines = fs.readFileSync('.env.local', 'utf8').split('\n');
    for (const l of lines) {
      if (l.startsWith('GROQ_API_KEY=')) {
        groqKey = l.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }

  const files = [
    'tut5_raw_01_intro.wav',
    'tut5_raw_02_barista.wav',
    'tut5_raw_03_student.wav',
    'tut5_raw_04_eval.wav',
    'tut5_raw_05_outro.wav'
  ];

  console.log('🔍 Проверка качества и транскрипции сгенерированных аудиоклипов через Whisper Large V3...\n');

  for (const f of files) {
    const p = path.join('public/demo/audio_cache', f);
    if (!fs.existsSync(p)) {
      console.log(`⚠️ Файл не найден: ${f}`);
      continue;
    }
    const buf = fs.readFileSync(p);

    const formData = new FormData();
    formData.append('file', new Blob([buf], { type: 'audio/wav' }), f);
    formData.append('model', 'whisper-large-v3');
    formData.append('response_format', 'verbose_json');

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}` },
      body: formData
    });

    const json = await res.json();
    console.log(`🎵 ${f}:`);
    console.log(`   Распознанный текст: "${json.text}"`);
    console.log(`   Язык: ${json.language} | Длительность: ${json.duration}s`);
    if (json.segments) {
      for (const s of json.segments) {
        console.log(`   [${s.start.toFixed(2)}s - ${s.end.toFixed(2)}s]: "${s.text}" (avg_logprob: ${s.avg_logprob.toFixed(3)}, no_speech_prob: ${s.no_speech_prob.toFixed(4)})`);
      }
    }
    console.log('');
  }
}

checkAudio().catch(console.error);
