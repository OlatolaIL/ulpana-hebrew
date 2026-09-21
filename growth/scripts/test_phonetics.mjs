import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { synthesizeCue } from './generate_rent_audio.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runPhoneticTest() {
  const tests = [
    { id: 'ph_01_dash', text: 'Одной буквой ошибся — и вместо договора подписал грудь хозяйки! Хо-зэ́ — это контракт, а ха-зэ́ — грудь!' },
    { id: 'ph_02_caps', text: 'Одной буквой ошибся — и вместо договора подписал грудь хозяйки! хозЭ — это контракт, а хазЭ — грудь!' },
    { id: 'ph_03_ee', text: 'Одной буквой ошибся — и вместо договора подписал грудь хозяйки! хо-ЗЭ — это контракт, а ха-ЗЭ — грудь!' },
    { id: 'ph_04_google', text: 'Одной буквой ошибся — и вместо договора подписал грудь хозяйки! хозэ́ — это контракт, а хазэ́ — грудь!', forceGoogle: true },
  ];

  for (const t of tests) {
    const wav = await synthesizeCue({
      id: t.id,
      text: t.text,
      lang: 'ru',
      geminiVoice: 'Charon',
      speed: 1.15,
      forceWavName: `${t.id}.wav`
    });
    console.log(`Generated ${t.id}: ${wav}`);
  }
}

runPhoneticTest().catch(console.error);
