import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import fs from 'fs';
import path from 'path';

async function testOne(name, text) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata('ru-RU-DmitryNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text, { rate: '+10%' });
  const file = path.resolve(`public/demo/test_${name}.mp3`);
  const ws = fs.createWriteStream(file);
  audioStream.pipe(ws);
  await new Promise((resolve, reject) => {
    audioStream.on('end', resolve);
    audioStream.on('error', reject);
    ws.on('error', reject);
  });
  await new Promise(r => setTimeout(r, 200));
  try { tts.close(); } catch (_) {}
  console.log(`${name}: created (${fs.statSync(file).size} bytes)`);
}

async function main() {
  // Вариант А: акут \u0301
  await testOne('acute', 'Жара\u0301 плюс тридцать пять в Тель-Авиве. Это произошло от сло\u0301ва «золотое яблоко».');
  // Вариант Б: контекст, исключающий падежную двусмысленность
  await testOne('context', 'На улице жарá, плюс тридцать пять в Тель-Авиве. Название произошло от слóва «золотое яблоко».');
  // Вариант В: без акута с однозначным синтаксисом
  await testOne('syntax', 'На улице стоит жара, тридцать пять градусов в Тель-Авиве. Это от слова «золотое яблоко».');
}

main().catch(console.error);
