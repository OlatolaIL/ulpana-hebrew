const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const targetKeys = [
  's_392cbe7aaa39.mp3',
  's_2d0daf0b9dd6.mp3',
  's_160366f4363c.mp3',
  's_c12650002d81.mp3',
  's_b9ed15db09af.mp3'
];

const metaPath = path.join(repoRoot, 'public/audio/sentences/audio_metadata.json');
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

const items = targetKeys.map(k => {
  const m = meta[k] || {};
  const filePath = path.join(repoRoot, 'public/audio/sentences', k);
  const base64 = fs.readFileSync(filePath).toString('base64');
  return {
    file: k,
    sentenceHe: m.sentenceHe || '',
    sentenceRu: m.sentenceRu || '',
    transcription: m.sentenceTranscription || '',
    gender: m.gender || (k === 's_b9ed15db09af.mp3' ? 'male' : 'female'),
    voice: m.voice || (k === 's_b9ed15db09af.mp3' ? 'Orus' : 'Aoede'),
    base64: 'data:audio/mp3;base64,' + base64
  };
});

const cardsHtml = items.map((item, idx) => `
    <div class="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-indigo-500/50 transition-all space-y-3 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold ${item.gender === 'male' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' : 'text-pink-500 bg-pink-500/10 border-pink-500/20'} border px-2.5 py-0.5 rounded-full">
            #${idx + 1} ${item.gender === 'male' ? '♂ Orus (мужской)' : '♀ Aoede (женский)'}
          </span>
          <span class="text-xs font-mono text-[var(--muted-foreground)]">${item.file}</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-2xl font-bold text-[var(--foreground)] tracking-wide" dir="rtl">${item.sentenceHe}</div>
        <div class="text-sm text-[var(--muted-foreground)] font-medium">${item.sentenceRu}</div>
        ${item.transcription ? `<div class="text-xs text-indigo-500 font-mono">[${item.transcription}]</div>` : ''}
      </div>

      <div class="pt-1">
        <audio controls class="w-full h-10 rounded-lg">
          <source src="${item.base64}" type="audio/mp3">
          Ваш браузер не поддерживает аудио.
        </audio>
      </div>
    </div>
`).join('');

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Аудиоплеер предложений курса</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
</head>
<body class="bg-transparent text-[var(--foreground)] antialiased p-4">
  <div class="max-w-2xl mx-auto space-y-4">
    <div class="flex items-center justify-between pb-3 border-b border-[var(--border)]">
      <div>
        <h2 class="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
          🎙️ Прослушивание 5 фраз Gemini 3.8 Flash-Lite TTS
        </h2>
        <p class="text-xs text-[var(--muted-foreground)] mt-1">
          Студийный синтез курса «Ульпан Алеф» • Голоса: Aoede (♀) и Orus (♂)
        </p>
      </div>
      <span class="text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
        Verified Studio MP3
      </span>
    </div>

    ${cardsHtml}
  </div>
</body>
</html>`;

const outPath = 'C:/Users/azrie/.gemini/antigravity/brain/da8395f7-c3a4-48a7-ae02-4b2d545ac441/sentences_audio_player.html';
fs.writeFileSync(outPath, html, 'utf8');
console.log('Successfully wrote artifact to', outPath, 'Bytes:', fs.statSync(outPath).size);
