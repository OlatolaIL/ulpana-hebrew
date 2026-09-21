import fs from 'fs';
import path from 'path';

async function check() {
  let groqKey = process.env.GROQ_API_KEY;
  if (!groqKey && fs.existsSync('.env.local')) {
    const lines = fs.readFileSync('.env.local', 'utf8').split('\n');
    for (const l of lines) {
      if (l.startsWith('GROQ_API_KEY=')) {
        groqKey = l.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }

  const files = ['rent_cue_04_explainer.wav', 'ph_01_dash.wav', 'ph_02_caps.wav', 'ph_03_ee.wav', 'ph_04_google.wav'];
  for (const f of files) {
    const p = path.resolve('public/demo/audio_cache', f);
    if (!fs.existsSync(p)) continue;
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
    console.log(`${f}: "${json.text}"`);
    if (json.segments) {
      for (const s of json.segments) {
        console.log(`   [${s.start.toFixed(2)}s - ${s.end.toFixed(2)}s]: "${s.text}"`);
      }
    }
  }
}

check().catch(console.error);
