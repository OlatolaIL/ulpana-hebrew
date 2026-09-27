import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const ARTIFACT_DIR = 'C:/Users/azrie/.gemini/antigravity/brain/0b3eb4ae-c78b-4220-97e8-8acf0fbee284';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const cleanMp4Path = path.resolve(ROOT, 'public/demo/lessons/lesson_01_clean_youtube_shorts.mp4');
const spicyMp4Path = path.resolve(ROOT, 'public/demo/lessons/lesson_01_spicy_youtube_shorts.mp4');

const cleanBase64 = fs.readFileSync(cleanMp4Path).toString('base64');
const spicyBase64 = fs.readFileSync(spicyMp4Path).toString('base64');

const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Урок 1: YouTube Shorts Player — Ульпан Алеф</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@500;700;900&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }
    .he-text {
      font-family: 'Heebo', sans-serif;
      direction: rtl;
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 p-4 md:p-6 antialiased">
  <div class="max-w-4xl mx-auto space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-black text-xl shadow-lg shadow-sky-500/30">
          א
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Урок 1 • Виральные YouTube Shorts
            <span class="text-xs bg-red-500/20 text-red-400 font-extrabold px-2.5 py-0.5 rounded-full border border-red-500/30">SHORTS 9:16</span>
          </h1>
          <p class="text-xs text-slate-400">Пробные ролики с таймкодами, аудиодорожкой и промокодом</p>
        </div>
      </div>
      <div class="text-xs text-slate-400 font-mono">
        HD 780×1688 • H.264
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
      <button id="tab-clean" onclick="switchTab('clean')" class="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 bg-sky-500 text-white shadow-md shadow-sky-500/20 flex items-center justify-center gap-2">
        <span>🟢 Вариант А: Clean (Ad-Safe)</span>
        <span class="text-xs bg-white/20 px-2 py-0.5 rounded-md">Офис • 34.5с</span>
      </button>
      <button id="tab-spicy" onclick="switchTab('spicy')" class="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 flex items-center justify-center gap-2">
        <span>🌶️ Вариант B: Spicy (Organic)</span>
        <span class="text-xs bg-slate-800 px-2 py-0.5 rounded-md">Тиндер • 32.9с</span>
      </button>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      
      <!-- Video Player Column (9:16) -->
      <div class="md:col-span-6 flex flex-col items-center">
        <div class="relative w-full max-w-[340px] aspect-[9/16] bg-black rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl shadow-sky-500/10">
          <video id="video-player" class="w-full h-full object-cover" controls playsinline preload="metadata">
            <source id="video-source" src="data:video/mp4;base64,${cleanBase64}" type="video/mp4">
          </video>
        </div>
        <p class="text-xs text-slate-500 mt-2 text-center">
          💡 Нажмите Play для просмотра с оригинальным звуком и титрами
        </p>
      </div>

      <!-- Info & Timestamps Column -->
      <div class="md:col-span-6 space-y-4">

        <!-- Variant Clean Details -->
        <div id="panel-clean" class="space-y-4">
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-sky-400">Сюжет Clean (Для платной рекламы)</span>
              <span class="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">100% White-Hat</span>
            </div>
            <h3 class="text-base font-bold text-white">«Он или она? Ошибка в одну букву»</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Новичок в первый день в израильском хайтеке хочет спросить у бородатого тимлида в кипе, свободен ли он. Перепутал мужское и женское местоимение — и назвал тимлида девушкой.
            </p>
          </div>

          <!-- Timecodes Jump -->
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Таймкоды и фразы:</h4>
            <div class="space-y-1.5">
              <button onclick="seekTo(0)" class="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-left transition border border-transparent hover:border-slate-700">
                <span class="text-xs text-slate-300"><b class="text-sky-400 font-mono">00:00</b> 🎣 Хук: Первый день в хайтеке</span>
                <span class="text-xs text-slate-500">Диктор</span>
              </button>
              <button onclick="seekTo(6.4)" class="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-left transition border border-transparent hover:border-slate-700">
                <span class="text-xs text-slate-300"><b class="text-sky-400 font-mono">00:06</b> 💥 <span class="he-text font-bold text-red-400">סְלִיחָה, אַתְּ פְּנוּיָה?</span></span>
                <span class="text-xs text-red-400">Факап</span>
              </button>
              <button onclick="seekTo(9.7)" class="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-left transition border border-transparent hover:border-slate-700">
                <span class="text-xs text-slate-300"><b class="text-sky-400 font-mono">00:09</b> 🧔🏻 <span class="he-text font-bold text-amber-400">אֲנִי נִרְאֶה לָךְ כְּמוֹ בַּחוּרָה?!</span></span>
                <span class="text-xs text-amber-400">Тимлид</span>
              </button>
              <button onclick="seekTo(13.7)" class="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-left transition border border-transparent hover:border-slate-700">
                <span class="text-xs text-slate-300"><b class="text-sky-400 font-mono">00:13</b> 💡 Разбор: <span class="he-text font-bold text-emerald-400">אַתָּה</span> (м.р.) vs <span class="he-text font-bold text-amber-400">אַתְּ</span> (ж.р.)</span>
                <span class="text-xs text-emerald-400">Ульпан</span>
              </button>
              <button onclick="seekTo(24.1)" class="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-left transition border border-transparent hover:border-slate-700">
                <span class="text-xs text-slate-300"><b class="text-sky-400 font-mono">00:24</b> 🚀 Оффер: Промокод <b class="text-yellow-400">SHORTS</b> (30 дней)</span>
                <span class="text-xs text-yellow-400">CTA</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Variant Spicy Details -->
        <div id="panel-spicy" class="space-y-4 hidden">
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-pink-400">Сюжет Spicy (Для органических Reels/Shorts)</span>
              <span class="text-xs bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded border border-pink-500/20 font-bold">🔥 Viral Organic</span>
            </div>
            <h3 class="text-base font-bold text-white">«Свидание в Тиндере • Комплимент таксисту»</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Парень на первом свидании с израильтянкой на набережной Тель-Авива решает сделать комплимент. Вместо женского «ат яфа́» говорит «атá яфэ́» (комплимент мужчине). Девушка угорает.
            </p>
          </div>

          <!-- Timecodes Jump -->
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Таймкоды и фразы:</h4>
            <div class="space-y-1.5">
              <button onclick="seekTo(0)" class="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-left transition border border-transparent hover:border-slate-700">
                <span class="text-xs text-slate-300"><b class="text-pink-400 font-mono">00:00</b> 🎣 Хук: Первое свидание с саброй</span>
                <span class="text-xs text-slate-500">Диктор</span>
              </button>
              <button onclick="seekTo(4.7)" class="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-left transition border border-transparent hover:border-slate-700">
                <span class="text-xs text-slate-300"><b class="text-pink-400 font-mono">00:04</b> 🙈 <span class="he-text font-bold text-pink-400">!שָׁלוֹם! אַתָּה יָפֶה מְאוֹד</span></span>
                <span class="text-xs text-pink-400">Парень</span>
              </button>
              <button onclick="seekTo(8.9)" class="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-left transition border border-transparent hover:border-slate-700">
                <span class="text-xs text-slate-300"><b class="text-pink-400 font-mono">00:08</b> 👩🏻 <span class="he-text font-bold text-rose-400">!תּוֹדָה מוֹתֶק, אֲבָל אֲנִי אִשָּׁה</span></span>
                <span class="text-xs text-rose-400">Девушка</span>
              </button>
              <button onclick="seekTo(13.4)" class="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-left transition border border-transparent hover:border-slate-700">
                <span class="text-xs text-slate-300"><b class="text-pink-400 font-mono">00:13</b> 💡 Разбор: «Атá яфэ» — мужику, «אַתְּ יָפָה» — девушке!</span>
                <span class="text-xs text-emerald-400">Ульпан</span>
              </button>
              <button onclick="seekTo(22.8)" class="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-left transition border border-transparent hover:border-slate-700">
                <span class="text-xs text-slate-300"><b class="text-pink-400 font-mono">00:22</b> 🚀 Оффер: Промокод <b class="text-yellow-400">SHORTS</b> (30 дней)</span>
                <span class="text-xs text-yellow-400">CTA</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Promo Code Card -->
        <div class="bg-gradient-to-r from-sky-900/40 via-blue-900/30 to-indigo-900/40 border border-sky-500/30 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div class="text-xs font-bold text-sky-400 uppercase tracking-wider">Промокод на экране Shorts:</div>
            <div class="text-2xl font-black text-white tracking-widest font-mono">SHORTS</div>
            <div class="text-xs text-slate-300">30 дней полного доступа ко всем 100 урокам курса</div>
          </div>
          <div class="text-right">
            <span class="text-xs bg-sky-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-md shadow-sky-500/30 inline-block">
              Free 30 Days
            </span>
          </div>
        </div>

      </div>

    </div>

  </div>

  <script>
    const cleanSrc = "data:video/mp4;base64,${cleanBase64}";
    const spicySrc = "data:video/mp4;base64,${spicyBase64}";
    const player = document.getElementById('video-player');
    const source = document.getElementById('video-source');

    function switchTab(tab) {
      const tabClean = document.getElementById('tab-clean');
      const tabSpicy = document.getElementById('tab-spicy');
      const panelClean = document.getElementById('panel-clean');
      const panelSpicy = document.getElementById('panel-spicy');

      if (tab === 'clean') {
        tabClean.className = 'flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 bg-sky-500 text-white shadow-md shadow-sky-500/20 flex items-center justify-center gap-2';
        tabSpicy.className = 'flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 flex items-center justify-center gap-2';
        panelClean.classList.remove('hidden');
        panelSpicy.classList.add('hidden');
        source.src = cleanSrc;
        player.load();
        player.play().catch(() => {});
      } else {
        tabSpicy.className = 'flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 bg-pink-500 text-white shadow-md shadow-pink-500/20 flex items-center justify-center gap-2';
        tabClean.className = 'flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 flex items-center justify-center gap-2';
        panelSpicy.classList.remove('hidden');
        panelClean.classList.add('hidden');
        source.src = spicySrc;
        player.load();
        player.play().catch(() => {});
      }
    }

    function seekTo(sec) {
      player.currentTime = sec;
      player.play().catch(() => {});
    }
  </script>
</body>
</html>
`;

const outPlayerPath = path.join(ARTIFACT_DIR, 'player_lesson_01.html');
fs.writeFileSync(outPlayerPath, htmlContent);
console.log('✅ HTML Плеер успешно создан:', outPlayerPath);
console.log('📊 Размер HTML файла:', (fs.statSync(outPlayerPath).size / 1024 / 1024).toFixed(2), 'MB');
