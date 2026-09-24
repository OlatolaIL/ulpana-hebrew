/**
 * Бесплатный голосовой движок (Text-to-Speech и Speech-to-Text) для иврита
 */

import { stripNikkud } from './transcription';
import { notifyAudioBlocked } from './audioNotifier';
import { callFlightRecorder } from './callDiagnostics';
import { PEALIM_MASTER_LEXICON } from './ulpanDictionary';

let preferredHebrewVoice: SpeechSynthesisVoice | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let speechSafetyTimer: any = null;
let activeFallbackAudio: HTMLAudioElement | null = null;
let activeStudioAudio: HTMLAudioElement | null = null;

/**
 * Инициализация и поиск лучшего голоса для иврита в системе
 */
export function initHebrewVoices(): Promise<SpeechSynthesisVoice | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(null);
      return;
    }

    loadSentenceManifest();

    const findVoice = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        const heVoice =
          voices.find((v) => v.lang === 'he-IL' || v.lang === 'he') ||
          voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('he')) ||
          null;
        if (heVoice) preferredHebrewVoice = heVoice;
        return heVoice;
      } catch {
        return null;
      }
    };

    const existing = findVoice();
    if (existing) {
      resolve(existing);
      return;
    }

    try {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(findVoice());
      };
    } catch {}

    setTimeout(() => {
      resolve(findVoice());
    }, 500);
  });
}

/**
 * Реестр канонических огласовок и автоисправлений для синтезаторов речи (TTS).
 * Гарантирует правильное ударение для сеголатов (милель) и корректное чтение частых слов.
 */
const PHONETIC_CORRECTIONS: [RegExp, string][] = [
  // 1. Исправление типичных опечаток в никуде и сленговых ударений
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])בְּטֶח(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1בֶּטַח'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])מְרוּהֶטֶת(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1מְרוֹהֶטֶת'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])סָבָא(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1סַבָּא'],
  // Нормализация сленга: приводим негласованное «סבבה» к כתיב מלא с огласовками סַבָּבָה (цельное слово без пробелов)
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])סבבה(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1סַבָּבָה'],

  // 2. Сеголаты и слова с ударением на первый слог (милель), если поданы без огласовок
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])בטח(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1בֶּטַח'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])בוקר(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1בּוֹקֶר'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])בֹקר(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1בּוֹקֶר'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])ערב(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1עֶרֶב'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])לילה(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1לַיְלָה'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])ילד(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1יֶלֶד'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])ילדה(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1יַלְדָּה'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])ספר(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1סֵפֶר'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])לחם(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1לֶחֶם'],

  // 3. Базовые устойчивые выражения курса
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])בסדר(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1בְּסֵדֶר'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])בבקשה(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1בְּבַקָּשָׁה'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])תודה(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1תּוֹדָה'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])שלום(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1שָׁלוֹם'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])להתראות(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1לְהִתְרָאוֹת'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])קפה(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1קָפֶה'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])סוכר(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1סוּכָּר'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])חשבון(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1חֶשְׁבּוֹן'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])אפשר(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1אֶפְשָׁר'],

  // 4. Огласовка и дагеш для ульпана (гарантия звука [п] вместо [ф] для синтезатора)
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])([לבמה]?ָ?)אוּלְפָן(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1$2אוּלְפָּן'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])([לבמה]?)אולפן(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1$2אוּלְפָּן'],

  // 5. חתונה: фиксация патаха (звук [а]), чтобы синтезаторы речи (Microsoft Asaf, Google TTS) не сбивались на «хетуна»
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])(?:חֲתוּנָּה|חֲתֻנָּה|חֲתוּנָה|חתונה)(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1חַתּוּנָה'],
  [/(^|[\s.,!?:;«»"״׳()[\]{}—])(?:חֲתוּנּוֹת|חֲתֻנּוֹת|חֲתוּנוֹת|חתונות)(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, '$1חַתּוּנוֹת'],
];

/**
 * Исправление базовой фонетики фраз для естественного звучания
 */
function fixHebrewPhonetics(text: string): string {
  if (!text) return '';
  let res = text;

  // Применяем реестр канонических огласовок
  for (const [pattern, replacement] of PHONETIC_CORRECTIONS) {
    res = res.replace(pattern, replacement);
  }

  // Гарантируем дагеш в букве פ после шва в любых формах слова ульпан (לְפָּן)
  res = res.replace(/(\u05dc\u05b0)\u05e4(?!\u05bc)(\u05b8\u05df)/g, '$1\u05e4\u05bc$2');

  res = res.replace(/(^|\s)ספרי(\s+ли|\s+לי)/g, '$1סַפְּרִי$2');
  res = res.replace(/(^|\s)ספר(\s+ли|\s+לי)/g, '$1סַפֵּר$2');
  res = res.replace(/(^|\s)תספרי(\s+ли|\s+לי)/g, '$1תְּסַפְּרִי$2');
  res = res.replace(/(^|\s)תספר(\s+ли|\s+לי)/g, '$1תְּסַפֵּר$2');
  return res;
}

/**
 * Очищает текст от эмодзи, служебных символов и меток перед озвучкой
 */
export function cleanHebrewForSpeech(text: string): string {
  if (!text) return '';
  // Если слово/фраза содержит варианты через слэш (например "עוֹלֶה / עוֹלָה" или "רוֹצֶה / רוֹצָה"),
  // берём первую (базовую) форму, чтобы синтезатор не читал оба варианта слитно как одно предложение
  const primaryText = text.includes('/') ? text.split('/')[0] : text;
  let res = primaryText
    // Удаляем иконки, мета-метки и эмодзи
    .replace(/[♂♀⚥✔️❌①②③④⑤👉📦🌸🎙️👥↗️➡️⬅️⬆️⬇️✨💫\u200D\uFE0F\uFE0E]/g, '')
    // Нормализуем восточные/юникодные знаки вопроса и восклицания
    .replace(/[؟？]/g, '?')
    .replace(/[！]/g, '!')
    // Удаляем любые комментарии и переводы в круглых скобках, например "(одна выпечка)", "(кáма зэ олé? — м.р.)"
    .replace(/\([^)]*\)/g, ' ')
    // Удаляем кавычки, скобки и стрелки
    .replace(/["'«»[\]{}()<>→]/g, ' ')
    // Заменяем цифры 0-10 на ивритские числительные (женский род: номера квартир, домов, даты),
    // чтобы синтезатор речи произносил их, а не пропускал
    .replace(/(^|[^\d])(10|[0-9])(?=[^\d]|$)/g, (_m, p1, d) => {
      const digitsMap: Record<string, string> = {
        '0': 'אֶפֶס',
        '1': 'אַחַת',
        '2': 'שְׁתַּיִם',
        '3': 'שָׁלוֹשׁ',
        '4': 'אַרְבַּע',
        '5': 'חָמֵשׁ',
        '6': 'שֵׁשׁ',
        '7': 'שֶׁבַע',
        '8': 'שְׁמוֹנֶה',
        '9': 'תֵּשַׁע',
        '10': 'עֶשֶׂר',
      };
      return `${p1} ${digitsMap[d] || d} `;
    })
    // Сохраняем символы иврита (\u0590-\u05FF), дефис, пробелы и ЗНАКИ ПРЕПИНАНИЯ (.,!?:;)
    // чтобы голосовой движок выдерживал паузы между предложениями и делал вопросительную интонацию
    .replace(/[^\u0590-\u05FF\s.,!?:;-]/g, ' ')
    // Удаляем лишние разделители
    .replace(/[—–_\\|•]/g, ' ')
    .replace(/\s+/g, ' ')
    // Нормализуем пробелы перед и после знаков препинания
    .replace(/\s+([.,!?:;])/g, '$1')
    .replace(/([.,!?:;])(?=[\u0590-\u05FF])/g, '$1 ')
    .trim();

  return fixHebrewPhonetics(res);
}

/**
 * Высоконадежное воспроизведение произношения через Google TTS Audio fallback
 */
export function playFallbackAudio(
  text: string,
  rate: number = 0.75,
  lang: string = 'iw'
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    try {
      if (activeFallbackAudio) {
        try {
          activeFallbackAudio.onended = null;
          activeFallbackAudio.onerror = null;
          activeFallbackAudio.pause();
          activeFallbackAudio.src = '';
        } catch {}
        activeFallbackAudio = null;
      }

      // Google Translate TTS не умеет читать огласованный иврит (никуд):
      // тּוֹדָה → «теуда», בְּבַקָּשָׁה → «беваакаша».
      // Снимаем никуд строго перед формированием URL — только для Google TTS.
      // cleanText (с огласовками) сохраняем для определения isQuestion и playbackRate.
      let cleanText = text
        .replace(/[؟？]/g, '?')
        .replace(/[！]/g, '!')
        .replace(/[\"'״׳()[\]{}—<>«»]/g, ' ')
        .replace(/\s+([.,!?:;])/g, '$1')
        .replace(/([.,!?:;])(?=[\u0590-\u05FF\u0400-\u04FFa-zA-Z])/g, '$1 ')
        .replace(/\s+/g, ' ')
        .trim();
      if (!cleanText) {
        resolve();
        return;
      }

      if (lang === 'ru') {
        cleanText = fixRussianPhonetics(cleanText);
      }

      const isQuestion = cleanText.includes('?');
      const effectiveRate = isQuestion ? Math.max(rate || 0.75, 0.8) : (rate || 0.75);

      // Для иврита снимаем огласовки перед отправкой в Google TTS — без них читает правильно
      const ttsText = lang === 'iw' ? stripNikkud(cleanText).replace(/\s+/g, ' ').trim() : cleanText;

      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(ttsText)}`;
      const audio = new Audio(url);
      activeFallbackAudio = audio;
      audio.playbackRate = Math.max(0.6, Math.min(1.3, effectiveRate));

      let isEnded = false;
      let fallbackTimeout: any = null;

      const finish = () => {
        if (!isEnded) {
          isEnded = true;
          if (fallbackTimeout) {
            clearTimeout(fallbackTimeout);
            fallbackTimeout = null;
          }
          audio.onended = null;
          audio.onerror = null;
          if (activeFallbackAudio === audio) {
            activeFallbackAudio = null;
          }
          resolve();
        }
      };

      audio.onended = finish;
      audio.onerror = finish;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err: any) => {
          if (err?.name === 'NotAllowedError') {
            notifyAudioBlocked('audio_play_not_allowed');
          }
          finish();
        });
      }

      fallbackTimeout = setTimeout(finish, 6000);
    } catch {
      resolve();
    }
  });
}

/**
 * Локальный реестр студийных записей для сленговых и исключительных слов,
 * отсутствующих в академическом словаре Pealim
 */
const CURATED_STUDIO_AUDIO: Record<string, string> = {
  'סבבה': '/audio/words/sababa.mp3',
  'סַבָּבָה': '/audio/words/sababa.mp3',
  'סַבָּבָּה': '/audio/words/sababa.mp3',
  'תכלס': '/audio/words/tachles.mp3',
  'תַּכְלֶס': '/audio/words/tachles.mp3',
  'פראייר': '/audio/words/fraier.mp3',
  'פְרָאיֶיר': '/audio/words/fraier.mp3',
  'סחבק': '/audio/words/sahbak.mp3',
  'סַחְבָּק': '/audio/words/sahbak.mp3',
  'פנצר': '/audio/words/pancher.mp3',
  "פנצ'ר": '/audio/words/pancher.mp3',
  "פַּנְצֶ'ר": '/audio/words/pancher.mp3',
  'צימר': '/audio/words/tzimer.mp3',
  'צִימֶר': '/audio/words/tzimer.mp3',
  'טאבו': '/audio/words/tabu.mp3',
  'טַאבּוּ': '/audio/words/tabu.mp3',
  'סילבוס': '/audio/words/syllabus.mp3',
  'סִילָבּוּס': '/audio/words/syllabus.mp3',
  'צהל': '/audio/words/zahal.mp3',
  'צה"ל': '/audio/words/zahal.mp3',
  'צַהַ"ל': '/audio/words/zahal.mp3',
  'באסה': '/audio/words/baasa.mp3',
  'בָּאסָה': '/audio/words/baasa.mp3',
  'יאללה': '/audio/words/yalla.mp3',
  'יַאלְלָה': '/audio/words/yalla.mp3',
  // Огласованные формы омографа את (местоимение «ты» ж.р., Pealim ID 4645)
  'אַתְּ': 'https://audio.pealim.com/v0/sv/sv6n9j9pyogt.mp3',
  'אַתְּ': 'https://audio.pealim.com/v0/sv/sv6n9j9pyogt.mp3',
};

/**
 * Локальный реестр предгенерированных аудиозаписей для предложений со сленгом
 * и нерегулярным ударением (R-24)
 */
const CURATED_SENTENCE_AUDIO: Record<string, string> = {
  'הכל סבבה תודה רבה': '/audio/sentences/hakol_sababa.mp3',
  'תכלס אתה ממש צודק': '/audio/sentences/tachles_tsodek.mp3',
  'אף אחד לא פראייר': '/audio/sentences/lo_fraier.mp3',
  'הוא סחבק אמיתי שלנו': '/audio/sentences/sahbak_amiti.mp3',
  'הוא סחבק אמתי שלנו': '/audio/sentences/sahbak_amiti.mp3',
  "יש לי פנצ'ר באוטו": '/audio/sentences/pancher_baoto.mp3',
  'יש לי פנצר באוטו': '/audio/sentences/pancher_baoto.mp3',
  'שכרנו צימר יפה בצפון': '/audio/sentences/tzimer_tzafon.mp3',
  'הדירה כבר רשומה בטאבו': '/audio/sentences/tabu_dira.mp3',
  'הסילבוס מפורט מאד השנה': '/audio/sentences/syllabus_mevorat.mp3',
  'הסילבוס מפורט מאוד השנה': '/audio/sentences/syllabus_mevorat.mp3',
  'צהל מגן על המדינה': '/audio/sentences/zahal_megen.mp3',
  'צה"ל מגן על המדינה': '/audio/sentences/zahal_megen.mp3',
};

/**
 * Нормализация фразы для поиска в реестре предложений (снятие огласовок и знаков препинания)
 */
export function normalizeSentenceKey(sentence: string): string {
  return stripNikkud(sentence)
    .replace(/["״׳']/g, '')
    .replace(/[.,!?:;«»()[\]{}—\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

let cachedSentenceManifest: Record<string, string> | null = null;
let isManifestLoading = false;

/**
 * Читает выбранный администратором глобальный движок озвучки предложений
 */
export function getSentenceAudioEngine(): 'current' | 'google_cloud' | 'edge_neural' {
  if (typeof window === 'undefined') return 'edge_neural';
  try {
    return (localStorage.getItem('sentence_audio_engine') as 'edge_neural' | 'google_cloud' | 'current') || 'edge_neural';
  } catch {
    return 'edge_neural';
  }
}

/**
 * Устанавливает выбранный администратором глобальный движок озвучки предложений
 */
export function setSentenceAudioEngine(engine: 'current' | 'google_cloud' | 'edge_neural'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('sentence_audio_engine', engine);
  } catch {}
}

/**
 * Фоновая предзагрузка манифеста предгенерированных предложений Google Cloud / Edge Neural TTS
 */
export function loadSentenceManifest(): void {
  if (cachedSentenceManifest || isManifestLoading || typeof window === 'undefined') return;
  isManifestLoading = true;
  fetch('/audio/sentences/manifest.json')
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data && typeof data === 'object') {
        cachedSentenceManifest = data;
      }
    })
    .catch(() => {})
    .finally(() => {
      isManifestLoading = false;
    });
}

/**
 * Поиск предгенерированной аудиозаписи для предложения со сленгом (R-24)
 * или студийного TTS (Edge Neural / Google Cloud при включенном глобальном переключателе)
 */
export function getCuratedSentenceAudio(sentence: string, gender: 'male' | 'female' = 'male'): string | null {
  if (!sentence || typeof sentence !== 'string') return null;
  const key = normalizeSentenceKey(sentence);

  // 1. Постоянный базовый реестр сленга (R-24)
  if (CURATED_SENTENCE_AUDIO[key]) {
    return CURATED_SENTENCE_AUDIO[key];
  }

  // 2. Если включен режим студийных предложений (Google Cloud / Edge Neural) — проверяем манифест
  const engine = getSentenceAudioEngine();
  if (engine === 'google_cloud' || engine === 'edge_neural') {
    if (!cachedSentenceManifest) {
      loadSentenceManifest();
    }
    if (cachedSentenceManifest) {
      // Для женского профиля проверяем женскую дорожку (Hila ♀)
      if (gender === 'female') {
        const femaleKey = `${key}::female`;
        if (cachedSentenceManifest[femaleKey]) {
          const fileName = cachedSentenceManifest[femaleKey];
          return fileName.startsWith('/') ? fileName : `/audio/sentences/${fileName}`;
        }
      }
      if (cachedSentenceManifest[key]) {
        const fileName = cachedSentenceManifest[key];
        return fileName.startsWith('/') ? fileName : `/audio/sentences/${fileName}`;
      }
    }
  }

  return null;
}

/**
 * Принудительный поиск записанного MP3 файла в базе (манифесте) независимо от активного режима платформы.
 * Возвращает прямой URL на файл (/audio/sentences/s_....mp3) или null, если фразы нет в базе.
 */
export async function getRecordedSentenceAudio(
  sentence: string,
  gender: 'male' | 'female' = 'male'
): Promise<string | null> {
  if (!sentence || typeof sentence !== 'string') return null;
  const key = normalizeSentenceKey(sentence);

  if (CURATED_SENTENCE_AUDIO[key]) {
    return CURATED_SENTENCE_AUDIO[key];
  }

  if (!cachedSentenceManifest) {
    try {
      const res = await fetch('/audio/sentences/manifest.json');
      if (res.ok) {
        cachedSentenceManifest = await res.json();
      }
    } catch {}
  }

  if (cachedSentenceManifest) {
    if (gender === 'female') {
      const femaleKey = `${key}::female`;
      if (cachedSentenceManifest[femaleKey]) {
        const fileName = cachedSentenceManifest[femaleKey];
        return fileName.startsWith('/') ? fileName : `/audio/sentences/${fileName}`;
      }
    }
    if (cachedSentenceManifest[key]) {
      const fileName = cachedSentenceManifest[key];
      return fileName.startsWith('/') ? fileName : `/audio/sentences/${fileName}`;
    }
  }

  return null;
}

/**
 * Получение списка доступных системных голосов иврита на текущем устройстве/браузере
 */
export function getAvailableHebrewVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  try {
    const voices = window.speechSynthesis.getVoices();
    return voices.filter(
      (v) => v.lang === 'he-IL' || v.lang === 'he' || (v.lang && v.lang.toLowerCase().startsWith('he'))
    );
  } catch {
    return [];
  }
}

/**
 * Поиск студийной аудиозаписи слова из мастер-словаря Pealim (только для точных словарных форм)
 * СТРОГИЙ ПРИОРИТЕТ: огласованная форма (NFC) проверяется первой, чтобы исключить коллизии омографов (את - ат / эт)
 */
export function getStudioAudioForWord(word: string): string | null {
  if (!word) return null;
  const trimmed = word.trim();
  const nfcWord = trimmed.normalize('NFC');
  const clean = stripNikkud(trimmed).trim();
  if (!clean || clean.includes(' ')) return null;

  // 1. Приоритет точного огласованного совпадения в кастомном реестре (сленг и омографы)
  if (CURATED_STUDIO_AUDIO[nfcWord] || CURATED_STUDIO_AUDIO[trimmed]) {
    return CURATED_STUDIO_AUDIO[nfcWord] || CURATED_STUDIO_AUDIO[trimmed];
  }

  // 2. Приоритет точного огласованного совпадения в мастере Pealim (NFC и сырая форма)
  try {
    const vocalizedEntry = PEALIM_MASTER_LEXICON[nfcWord] || PEALIM_MASTER_LEXICON[trimmed];
    if (vocalizedEntry?.audio) {
      return vocalizedEntry.audio;
    }
  } catch {}

  // 3. Проверяем наличие в кастомном реестре исключений по неогласованной форме
  const normalizedKey = clean.replace(/["״׳']/g, '');
  if (CURATED_STUDIO_AUDIO[clean] || CURATED_STUDIO_AUDIO[normalizedKey]) {
    return CURATED_STUDIO_AUDIO[clean] || CURATED_STUDIO_AUDIO[normalizedKey];
  }

  // 4. Поиск по неогласованной форме в мастере Pealim (фолбэк только если огласовка не дала результата)
  try {
    const entry = PEALIM_MASTER_LEXICON[clean];
    return entry?.audio || null;
  } catch {
    return null;
  }
}

/**
 * Универсальная озвучка иврита (студийное аудио Pealim для отдельных слов + браузерный Web Speech API + моментальный фолбэк на Audio)
 */
export function speakHebrew(
  text: string,
  options: { rate?: number; pitch?: number; gender?: 'male' | 'female'; preferStudioAudio?: boolean } = {}
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    // 1. Очищаем все предыдущие таймеры и активные проигрыватели
    if (speechSafetyTimer) {
      clearTimeout(speechSafetyTimer);
      speechSafetyTimer = null;
    }

    if (activeUtterance) {
      activeUtterance.onend = null;
      activeUtterance.onerror = null;
      activeUtterance = null;
    }

    if (activeFallbackAudio) {
      try {
        activeFallbackAudio.onended = null;
        activeFallbackAudio.onerror = null;
        activeFallbackAudio.pause();
        activeFallbackAudio.src = '';
      } catch {}
      activeFallbackAudio = null;
    }

    if (activeStudioAudio) {
      try {
        activeStudioAudio.onended = null;
        activeStudioAudio.onerror = null;
        activeStudioAudio.pause();
        activeStudioAudio.src = '';
      } catch {}
      activeStudioAudio = null;
    }

    const speechText = cleanHebrewForSpeech(text);
    if (!speechText) {
      resolve();
      return;
    }

    let userRate = 0.7;
    let userGender: 'male' | 'female' = 'male';
    try {
      const stored = localStorage.getItem('hebrew_app_profile_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.speechRate === 'number') userRate = parsed.speechRate;
        if (parsed.gender === 'female' || parsed.gender === 'male') userGender = parsed.gender;
      }
    } catch {}

    const rate = options.rate ?? userRate;
    const gender = options.gender ?? userGender;

    // Вспомогательная функция воспроизведения через браузерный TTS / Fallback Audio
    const playWithTts = () => {
      // Если speechSynthesis не поддерживается в браузере — сразу запускаем fallback audio
      if (!('speechSynthesis' in window)) {
        playFallbackAudio(speechText, rate).then(() => resolve());
        return;
      }

      try {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
      } catch {}

      let isFinished = false;
      const finish = () => {
        if (!isFinished) {
          isFinished = true;
          activeUtterance = null;
          if (speechSafetyTimer) {
            clearTimeout(speechSafetyTimer);
            speechSafetyTimer = null;
          }
          resolve();
        }
      };

      try {
        const isQuestion = speechText.includes('?');
        const utterance = new SpeechSynthesisUtterance(speechText);
        activeUtterance = utterance;
        utterance.lang = 'he-IL';
        // Для вопросов темп не должен быть чрезмерно замедленным (>=0.78), чтобы не размывать восходящий тон
        utterance.rate = isQuestion ? Math.max(rate, 0.78) : rate;
        const defaultPitch = options.gender === 'male' ? 0.85 : (options.gender === 'female' ? 1.05 : 1.0);
        // Для вопросов слегка повышаем питч (+12%), создавая естественный вопросительный контур в браузере
        const questionPitchBonus = isQuestion ? 0.12 : 0;
        utterance.pitch = options.pitch ?? Math.min(1.4, defaultPitch + questionPitchBonus);

        const voices = window.speechSynthesis.getVoices();
        const heVoices = voices.filter(
          (voice) => voice.lang === 'he-IL' || voice.lang === 'he' || (voice.lang && voice.lang.toLowerCase().startsWith('he'))
        );

        let matchedVoice: SpeechSynthesisVoice | null = null;
        if (options.gender === 'male') {
          matchedVoice = heVoices.find((v) => /asaf|guy|david|male|גבר/i.test(v.name)) || null;
        } else if (options.gender === 'female') {
          matchedVoice = heVoices.find((v) => /hila|sara|carmit|female|אישה/i.test(v.name)) || null;
        }

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        } else if (preferredHebrewVoice) {
          utterance.voice = preferredHebrewVoice;
        } else if (heVoices.length > 0) {
          utterance.voice = heVoices[0];
        }

        utterance.onend = () => {
          if (speechSafetyTimer) {
            clearTimeout(speechSafetyTimer);
            speechSafetyTimer = null;
          }
          finish();
        };

        utterance.onerror = (e) => {
          if (speechSafetyTimer) {
            clearTimeout(speechSafetyTimer);
            speechSafetyTimer = null;
          }
          // Если воспроизведение было отменено пользователем или кодом — НЕ запускаем фолбэк повторно!
          if (e.error === 'canceled' || e.error === 'interrupted') {
            finish();
            return;
          }
          if (e.error === 'not-allowed') {
            notifyAudioBlocked('tts_not_allowed');
          }
          console.warn('Browser TTS error, using audio fallback:', e);
          playFallbackAudio(speechText, rate).then(() => finish());
        };

        // Защитный таймаут: если speechSynthesis завис (частый баг Chrome/iOS) — один раз переключаемся на audio
        const maxDurationMs = Math.max(3500, speechText.length * 200 + 2000);
        speechSafetyTimer = setTimeout(() => {
          if (!isFinished) {
            isFinished = true;
            speechSafetyTimer = null;
            if (activeUtterance) {
              activeUtterance.onend = null;
              activeUtterance.onerror = null;
              activeUtterance = null;
            }
            try {
              window.speechSynthesis.cancel();
            } catch {}
            playFallbackAudio(speechText, rate).then(() => finish());
          }
        }, maxDurationMs);

        // ВАЖНО: Запуск СТРОГО СИНХРОННЫЙ!
        // Никаких setTimeout(..., 15)! Мобильные браузеры (iOS Safari / Android Chrome) требуют
        // воспроизведения звука строго внутри пользовательского жеста (User Activation).
        try {
          window.speechSynthesis.speak(utterance);
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch (err: any) {
          if (err?.name === 'NotAllowedError') {
            notifyAudioBlocked('tts_not_allowed');
          }
          if (speechSafetyTimer) {
            clearTimeout(speechSafetyTimer);
            speechSafetyTimer = null;
          }
          playFallbackAudio(speechText, rate).then(() => finish());
        }
      } catch (err: any) {
        if (err?.name === 'NotAllowedError') {
          notifyAudioBlocked('tts_not_allowed');
        }
        if (speechSafetyTimer) {
          clearTimeout(speechSafetyTimer);
          speechSafetyTimer = null;
        }
        playFallbackAudio(speechText, rate).then(() => finish());
      }
    };

    // 2. Проверяем наличие студийного аудио для одиночных слов или предгенерированных предложений со сленгом (R-24)
    if (options.preferStudioAudio !== false && typeof Audio !== 'undefined') {
      const cleanWord = stripNikkud(text).trim();
      const studioWordAudioUrl = !cleanWord.includes(' ') ? getStudioAudioForWord(text) : null;
      const curatedSentenceAudioUrl = !studioWordAudioUrl ? getCuratedSentenceAudio(text, gender) : null;
      const targetAudioUrl = studioWordAudioUrl || curatedSentenceAudioUrl;

      if (targetAudioUrl) {
        let isStudioEnded = false;
        let studioTimeout: any = null;
        let audio: HTMLAudioElement | null = null;

        const finishStudio = () => {
          if (!isStudioEnded) {
            isStudioEnded = true;
            if (studioTimeout) {
              clearTimeout(studioTimeout);
              studioTimeout = null;
            }
            if (activeStudioAudio === audio) {
              activeStudioAudio = null;
            }
            resolve();
          }
        };

        try {
          audio = new Audio(targetAudioUrl);
          activeStudioAudio = audio;
          // R-17: применяем скорость воспроизведения из профиля пользователя.
          // Диапазон 0.5–1.5 — безопасный для HTML5 Audio на всех платформах.
          // При rate=0.7 (дефолт) диктор звучит на 70% скорости — удобно для начинающих.
          audio.playbackRate = Math.max(0.5, Math.min(1.5, rate));
          audio.onended = finishStudio;
          audio.onerror = () => {
            if ((audio as any)?._cancelled || isStudioEnded) return;
            isStudioEnded = true;
            if (studioTimeout) {
              clearTimeout(studioTimeout);
              studioTimeout = null;
            }
            if (activeStudioAudio === audio) {
              activeStudioAudio = null;
            }
            playWithTts();
          };

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((err: any) => {
              if ((audio as any)?._cancelled || err?.name === 'AbortError' || isStudioEnded) {
                isStudioEnded = true;
                if (studioTimeout) {
                  clearTimeout(studioTimeout);
                  studioTimeout = null;
                }
                if (activeStudioAudio === audio) {
                  activeStudioAudio = null;
                }
                resolve();
                return;
              }
              if (err?.name === 'NotAllowedError') {
                notifyAudioBlocked('audio_play_not_allowed');
              }
              if (!isStudioEnded) {
                isStudioEnded = true;
                if (studioTimeout) {
                  clearTimeout(studioTimeout);
                  studioTimeout = null;
                }
                if (activeStudioAudio === audio) {
                  activeStudioAudio = null;
                }
                playWithTts();
              }
            });
          }

          // Страховочный таймаут (увеличен пропорционально замедлению воспроизведения)
          const studioTimeoutMs = Math.round(6000 / Math.max(0.5, rate));
          studioTimeout = setTimeout(finishStudio, studioTimeoutMs);
          return;
        } catch {
          // При ошибке Audio переходим к TTS
        }
      }
    }

    // Для предложений, фраз или при отсутствии студийной записи — запускаем связный TTS
    playWithTts();
  });
}

/**
 * Остановка любой воспроизводимой речи
 */
export function stopSpeech(): void {
  if (typeof window !== 'undefined') {
    if (speechSafetyTimer) {
      clearTimeout(speechSafetyTimer);
      speechSafetyTimer = null;
    }
    if (activeUtterance) {
      activeUtterance.onend = null;
      activeUtterance.onerror = null;
      activeUtterance = null;
    }
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
    if (activeFallbackAudio) {
      try {
        activeFallbackAudio.onended = null;
        activeFallbackAudio.onerror = null;
        activeFallbackAudio.pause();
        activeFallbackAudio.currentTime = 0;
        activeFallbackAudio.src = '';
      } catch {}
      activeFallbackAudio = null;
    }
    if (activeStudioAudio) {
      try {
        (activeStudioAudio as any)._cancelled = true;
        activeStudioAudio.onended = null;
        activeStudioAudio.onerror = null;
        activeStudioAudio.pause();
        activeStudioAudio.currentTime = 0;
        activeStudioAudio.src = '';
      } catch {}
      activeStudioAudio = null;
    }
  }
}

/**
 * Фонетическая нормализация русского текста для синтеза речи (TTS).
 * Разрешает омографы и устраняет ошибки ударений (например, "ле́том" вместо "лётом", "сто́ит" vs "стои́т", "плачу́" vs "пла́чу").
 */
export function fixRussianPhonetics(text: string): string {
  if (!text) return '';
  let res = text;

  // 1. "летом" -> "ле́том" (акцент \u0301 на 'е' блокирует ошибочное превращение синтезатором в "лётом")
  res = res.replace(/(^|[^\wа-яА-ЯёЁ])([лЛ])етом(?=[^\wа-яА-ЯёЁ]|$)/g, '$1$2е\u0301том');

  // 2. "плачу" -> "плачу́" / "заплачу́" (оплата / לשלם, исключаем ложное "пла́чу" - рыдания)
  res = res.replace(
    /(^|[\s.,!?:;«»"״׳()[\]{}—])(я\s+сейчас\s+|сейчас\s+|я\s+)?([Пп]лач[уу́])(?=\s+(?:картой|кредитной|наличными|за\s+|чек|по\s+|в\b)|$)/gi,
    (m, p1, p2, p3) => `${p1 || ''}${p2 || ''}${p3[0] === 'П' ? 'Плачу\u0301' : 'плачу\u0301'}`
  );
  res = res.replace(
    /(^|[\s.,!?:;«»"״׳()[\]{}—])([Пп]лач[уу́])(?=\s+(?:картой|кредитной|наличными|деньгами|за\s+|по\s+счет))/gi,
    (m, p1, p2) => `${p1}${p2[0] === 'П' ? 'Плачу\u0301' : 'плачу\u0301'}`
  );
  res = res.replace(
    /(^|[\s.,!?:;«»"״׳()[\]{}—])(я\s+)([Зз]аплач[уу́])(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/gi,
    (m, p1, p2, p3) => `${p1}${p2}${p3[0] === 'З' ? 'Заплачу\u0301' : 'заплачу\u0301'}`
  );

  // 3. "стоит" (цена/целесообразность: сто́ит) vs (стоять на ногах/месте: стои́т)
  // 3.1. Стоимость / целесообразность (сто́ит): сколько стоит, это стоит, стоит сделать
  res = res.replace(
    /(сколько(?:\s+[а-яА-ЯёЁ\w-]+){0,4}\s+)([Сс]тоит)(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/gi,
    (m, p1, p2) => `${p1}${p2[0] === 'С' ? 'Сто\u0301ит' : 'сто\u0301ит'}`
  );
  res = res.replace(
    /(^|[\s.,!?:;«»"״׳()[\]{}—])(это|всё|все|оно|билет|рубашка|номер)\s+([Сс]тоит)(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/gi,
    (m, p1, p2, p3) => `${p1}${p2} ${p3[0] === 'С' ? 'Сто\u0301ит' : 'сто\u0301ит'}`
  );
  res = res.replace(
    /(^|[\s.,!?:;«»"״׳()[\]{}—])([Сс]тоит)(?=\s+(?:взять|сделать|повторить|посмотреть|купить|пойти|улучшить|обратить|помнить|[а-яА-ЯёЁ]+ть|[а-яА-ЯёЁ]+ти))/gi,
    (m, p1, p2) => `${p1}${p2[0] === 'С' ? 'Сто\u0301ит' : 'сто\u0301ит'}`
  );
  res = res.replace(
    /(^|[\s.,!?:;«»"״׳()[\]{}—])(не|очень)\s+([Сс]тоит)(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/gi,
    (m, p1, p2, p3) => `${p1}${p2} ${p3[0] === 'С' ? 'Сто\u0301ит' : 'сто\u0301ит'}`
  );
  res = res.replace(
    /(^|[\s.,!?:;«»"״׳()[\]{}—])([Сс]тоит)(?=\s+\d|\s+девят|\s+десят|\s+сто|\s+[а-яА-ЯёЁ]+дцать|\s+шекел)/gi,
    (m, p1, p2) => `${p1}${p2[0] === 'С' ? 'Сто\u0301ит' : 'сто\u0301ит'}`
  );

  // 3.2. Стояние (стои́т): позиция, нахождение вертикально
  res = res.replace(
    /(^|[\s.,!?:;«»"״׳()[\]{}—])(он|она|кто|человек|автобус|машина|книга|поезд|друг)\s+([Сс]тоит)(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/gi,
    (m, p1, p2, p3) => `${p1}${p2} ${p3[0] === 'С' ? 'Стои\u0301т' : 'стои\u0301т'}`
  );
  res = res.replace(
    /(^|[\s.,!?:;«»"״׳()[\]{}—])([Сс]тоит)(?=\s+(?:возле|около|у\b|на\s+|в\s+|перед|сзади|рядом|там|здесь|тут))/gi,
    (m, p1, p2) => `${p1}${p2[0] === 'С' ? 'Стои\u0301т' : 'стои\u0301т'}`
  );
  res = res.replace(
    /(Глагол:\s*стоять[^\n]*?)([Сс]тоит)/gi,
    (m, p1, p2) => `${p1}${p2[0] === 'С' ? 'Стои\u0301т' : 'стои\u0301т'}`
  );

  // 4. "дома" (до́ма - наречие места / בבית)
  res = res.replace(
    /(отдыхает|сидит|находится|был|будет|остался|остается|сейчас|сегодня|включил|выключил|забыл)\s+(дом[аа́])(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/gi,
    '$1 до\u0301ма'
  );
  res = res.replace(
    /(^|[\s.,!?:;«»"״׳()[\]{}—])(дом[аа́])\s+(днем|утром|вечером|ночью|сейчас)/gi,
    '$1до\u0301ма $3'
  );

  // 5. "уже" -> "уже́" (наречие времени / כבר)
  res = res.replace(
    /(^|[\s.,!?:;«»"״׳()[\]{}—])([Уу])же(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g,
    '$1$2же\u0301'
  );

  return res;
}

/**
 * Очищает русский перевод от пояснений в скобках (род, число, цифры, комментарии),
 * чтобы синтезатор речи (TTS) не зачитывал лишние пометки ("(100)" -> "сто сто", "(м.р.)" -> "м.р.")
 */
export function cleanRussianForSpeech(text: string): string {
  if (!text) return '';

  let res = text
    // 1. Удаляем иконки, мета-метки и эмодзи
    .replace(/[♂♀⚥✔️❌①②③④⑤👉📦🌸🎙️👥↗️➡️⬅️⬆️⬇️✨💫\u200D\uFE0F\uFE0E]/g, '')
    // 2. Удаляем любые пояснения и комментарии внутри круглых, квадратных и фигурных скобок:
    // например: "сто (100)" -> "сто", "ночь (м.р.)" -> "ночь", "рука (кисть/рука, ж.р.)" -> "рука"
    .replace(/\([^)]*(\)|$)/g, ' ')
    .replace(/\[[^\]]*(\]|$)/g, ' ')
    .replace(/\{[^}]*(\}|$)/g, ' ')
    .replace(/<[^>]*>/g, ' ');

  // 3. Удаляем указания грамматического рода и чисел, даже если они написаны без скобок через дефис или запятую:
  // например: "это - м.р.", "книга - м.р. на иврите", "слово, ж.р.", "муж. род", "ж.р.", "мн.ч."
  res = res.replace(
    /(?:^|[\s,;—–-])+(?:(?:м|ж|ср)\.?\s*р\.?|(?:м|ж)\.(?!\w)|муж(?:\.|ской)?(?:\s+род)?|жен(?:\.|ский)?(?:\s+род)?|мн\.?\s*ч\.?|ед\.?\s*ч\.?)(?:[\s,;—–-]|$)/gi,
    ' '
  );

  // 4. Если в фразе есть варианты через слэш (например "один / одна", "он / она", "хочу / хочет"),
  // берем первый (базовый) вариант, соответствующий первой форме на иврите
  if (res.includes('/')) {
    const parts = res.split('/');
    if (parts[0]?.trim()) {
      res = parts[0];
    }
  }

  // 5. Если это короткий словарный перевод с синонимами через запятую или точку с запятой (например "есть, кушать", "ветер; дух", "жить, проживать"),
  // берем первое значение для лаконичной озвучки карточки.
  // Не обрезаем полноценные предложения со сложноподчиненной связью или обращением (например: "Не беспокойся, я заплачу", "Я знаю, что это трудно").
  if (res.includes(';')) {
    const parts = res.split(';');
    if (parts[0]?.trim()) {
      res = parts[0];
    }
  } else if (res.includes(',')) {
    const parts = res.split(',');
    const words = res.trim().split(/\s+/);
    const secondPart = parts[1]?.trim() || '';
    const isSubordinateOrContinuation = /^(?:что|как|когда|если|где|куда|откуда|потому|но|а|и|или|я|ты|он|она|мы|они|вы)\b/i.test(secondPart);
    if (words.length <= 5 && !isSubordinateOrContinuation && secondPart.split(/\s+/).length <= 2) {
      res = parts[0];
    }
  }

  // 6. Если в тексте уже есть буквенные слова, удаляем оставшиеся изолированные цифры и числовые метки
  // (например, если встретилось "сто 100" -> "сто", "двадцать 20" -> "двадцать"),
  // чтобы голос не читал число дважды
  if (/[а-яА-ЯёЁa-zA-Z]/.test(res)) {
    res = res.replace(/(?:^|\s)\d+[-–—]?(?:й|я|е|го|му|м|ом|х|ти)?(?:\s|$)/g, ' ');
    res = res.replace(/\b\d+\b/g, ' ');
  }

  // 7. Удаляем кавычки, технические знаки, стрелки и лишние разделители
  res = res
    .replace(/["'«»"״׳`~@#$%^&*+=<>\\|/]/g, ' ')
    .replace(/[—–_]/g, ' ')
    .replace(/\s+/g, ' ')
    // Убираем висящие знаки пунктуации по краям
    .replace(/^[\s,;.—–-]+|[\s,;.—–-]+$/g, '')
    .trim();

  // Страховочный возврат: если строка опустела (например, если карточка содержала только цифры или пояснение),
  // возвращаем очищенный базовый текст с нормализацией
  if (!res) {
    const base = text.replace(/[()[\]{}«»—"']/g, ' ').replace(/\s+/g, ' ').trim();
    return fixRussianPhonetics(base);
  }

  // 8. Фонетическая нормализация омографов (ле́том, сто́ит vs стои́т, плачу́ vs пла́чу, до́ма, уже́)
  res = fixRussianPhonetics(res);

  return res;
}

/**
 * Озвучка русского текста через Web Speech API (для режима карточек "Авто на слух")
 */
export function speakRussian(text: string, options: { rate?: number } = {}): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    // 1. Очищаем все предыдущие таймеры и активные проигрыватели
    if (speechSafetyTimer) {
      clearTimeout(speechSafetyTimer);
      speechSafetyTimer = null;
    }

    if (activeUtterance) {
      activeUtterance.onend = null;
      activeUtterance.onerror = null;
      activeUtterance = null;
    }

    if (activeFallbackAudio) {
      try {
        activeFallbackAudio.onended = null;
        activeFallbackAudio.onerror = null;
        activeFallbackAudio.pause();
        activeFallbackAudio.src = '';
      } catch {}
      activeFallbackAudio = null;
    }

    if (activeStudioAudio) {
      try {
        (activeStudioAudio as any)._cancelled = true;
        activeStudioAudio.onended = null;
        activeStudioAudio.onerror = null;
        activeStudioAudio.pause();
        activeStudioAudio.currentTime = 0;
        activeStudioAudio.src = '';
      } catch {}
      activeStudioAudio = null;
    }

    const clean = cleanRussianForSpeech(text);
    if (!clean) {
      resolve();
      return;
    }

    // Если speechSynthesis не поддерживается в браузере — запускаем fallback audio на русском
    if (!('speechSynthesis' in window)) {
      playFallbackAudio(clean, options.rate ?? 0.95, 'ru').then(() => resolve());
      return;
    }

    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    } catch {}

    let isDone = false;
    const done = () => {
      if (!isDone) {
        isDone = true;
        activeUtterance = null;
        if (speechSafetyTimer) {
          clearTimeout(speechSafetyTimer);
          speechSafetyTimer = null;
        }
        resolve();
      }
    };

    try {
      const utterance = new SpeechSynthesisUtterance(clean);
      activeUtterance = utterance;
      utterance.lang = 'ru-RU';
      utterance.rate = options.rate ?? 0.95;

      const voices = window.speechSynthesis.getVoices();
      const ruVoice = voices.find(
        (v) => v.lang === 'ru-RU' || v.lang === 'ru' || (v.lang && v.lang.toLowerCase().startsWith('ru'))
      );
      if (ruVoice) utterance.voice = ruVoice;

      utterance.onend = () => {
        if (speechSafetyTimer) {
          clearTimeout(speechSafetyTimer);
          speechSafetyTimer = null;
        }
        done();
      };

      utterance.onerror = (e) => {
        if (speechSafetyTimer) {
          clearTimeout(speechSafetyTimer);
          speechSafetyTimer = null;
        }
        if (e?.error === 'canceled' || e?.error === 'interrupted') {
          done();
          return;
        }
        playFallbackAudio(clean, options.rate ?? 0.95, 'ru').then(() => done());
      };

      // Страховочный таймер от зависания SpeechSynthesis
      const maxDurationMs = Math.max(3000, clean.length * 150 + 1500);
      speechSafetyTimer = setTimeout(() => {
        if (!isDone) {
          isDone = true;
          speechSafetyTimer = null;
          if (activeUtterance) {
            activeUtterance.onend = null;
            activeUtterance.onerror = null;
            activeUtterance = null;
          }
          try {
            window.speechSynthesis.cancel();
          } catch {}
          playFallbackAudio(clean, options.rate ?? 0.95, 'ru').then(() => done());
        }
      }, maxDurationMs);

      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch {
          if (speechSafetyTimer) {
            clearTimeout(speechSafetyTimer);
            speechSafetyTimer = null;
          }
          playFallbackAudio(clean, options.rate ?? 0.95, 'ru').then(() => done());
        }
      }, 15);
    } catch {
      playFallbackAudio(clean, options.rate ?? 0.95, 'ru').then(() => resolve());
    }
  });
}

/**
 * Очистка текста от дублирующихся смежных фраз и слов
 */
export function cleanDuplicatePhrases(text: string): string {
  if (!text) return '';
  let cleaned = text.replace(/\s+/g, ' ').trim();

  // 1. Проверяем точный повтор двух одинаковых половин: "X X" -> "X"
  const words = cleaned.split(' ').filter(Boolean);
  if (words.length >= 4 && words.length % 2 === 0) {
    const half = words.length / 2;
    const firstHalf = words.slice(0, half).join(' ');
    const secondHalf = words.slice(half).join(' ');
    if (firstHalf.toLowerCase() === secondHalf.toLowerCase()) {
      return firstHalf;
    }
  }

  // 2. Проверяем повторы подфраз длины от 2 до 8 слов: "A B C A B C" -> "A B C"
  for (let phraseLen = Math.min(8, Math.floor(words.length / 2)); phraseLen >= 2; phraseLen--) {
    let changed = false;
    for (let i = 0; i <= words.length - 2 * phraseLen; i++) {
      const p1 = words.slice(i, i + phraseLen).join(' ');
      const p2 = words.slice(i + phraseLen, i + 2 * phraseLen).join(' ');
      if (p1.toLowerCase() === p2.toLowerCase() && p1.length > 3) {
        words.splice(i + phraseLen, phraseLen);
        changed = true;
        break;
      }
    }
    if (changed) {
      cleaned = words.join(' ');
    }
  }

  return cleaned;
}

/**
 * Умная сшивка фрагментов распознавания (защита от багов WebKit / Android Chrome)
 */
export function stitchSpeechChunks(chunks: string[]): string {
  let accumulated = '';

  for (const rawChunk of chunks) {
    const chunk = rawChunk.trim();
    if (!chunk) continue;

    if (!accumulated) {
      accumulated = chunk;
      continue;
    }

    const normAcc = accumulated.replace(/\s+/g, ' ').trim();
    const normChunk = chunk.replace(/\s+/g, ' ').trim();

    // 1. Точный дубликат
    if (normAcc.toLowerCase() === normChunk.toLowerCase()) {
      continue;
    }

    // 2. Новый фрагмент уже содержится в конце или внутри накопленного
    if (normAcc.toLowerCase().endsWith(normChunk.toLowerCase()) || normAcc.toLowerCase().includes(normChunk.toLowerCase())) {
      continue;
    }

    // 3. Накопленный текст является префиксом нового фрагмента (Android cumulative)
    // Например: acc = "שלום", chunk = "שלום מה נשמע" -> заменяем на chunk
    if (normChunk.toLowerCase().startsWith(normAcc.toLowerCase())) {
      accumulated = normChunk;
      continue;
    }

    // 4. Проверяем частичное перекрытие слов на стыке (suffix-prefix overlap)
    // Например: acc = "אני רוצה קפה", chunk = "קפה עם חלב" -> "אני רוצה קפה עם חלב"
    const accWords = normAcc.split(' ');
    const chunkWords = normChunk.split(' ');
    let overlapFound = false;

    const maxOverlap = Math.min(accWords.length, chunkWords.length);
    for (let overlapLen = maxOverlap; overlapLen >= 1; overlapLen--) {
      const accSuffix = accWords.slice(-overlapLen).join(' ').toLowerCase();
      const chunkPrefix = chunkWords.slice(0, overlapLen).join(' ').toLowerCase();

      if (accSuffix === chunkPrefix) {
        const remainingChunk = chunkWords.slice(overlapLen).join(' ');
        accumulated = remainingChunk ? `${normAcc} ${remainingChunk}` : normAcc;
        overlapFound = true;
        break;
      }
    }

    // 5. Если перекрытия нет, просто соединяем через пробел
    if (!overlapFound) {
      accumulated = `${normAcc} ${normChunk}`;
    }
  }

  return cleanDuplicatePhrases(accumulated);
}

/**
 * Омофоническая нормализация типичных ошибок распознавания речи на иврите.
 * Буквы ע и א звучат одинаково [э], а ט и ת звучат одинаково [т].
 * В результате עֵט (ручка), אֶת (предлог), עֵת (время), אֵט (медленно) и טת звучат на слух абсолютно одинаково [эт]!
 * Модели ASR (Google, Whisper) из-за частотности предлога את почти всегда транскрибируют [эт] через алеф и тав.
 */
export function normalizeHebrewSpeechTranscript(text: string): string {
  if (!text) return '';
  let res = text.trim();

  // 1. Указательное слово (זה / הנה / כן זה) + омофон ручки (עת / אט / טת)
  res = res.replace(/(^|[\s.,!?:;])(זֶ?ה|הִ?נֵּ?ה|כֵּ?ן\s+זֶ?ה)\s+(?:עֵ?ת|אֵ?ט|טֵ?ת|טת)(?=[\s.,!?:;]|$)/gi, '$1$2 עֵט');
  res = res.replace(/(^|[\s.,!?:;])(זה|הנה|כן\s+זה)\s+(?:עת|אט|טת)(?=[\s.,!?:;]|$)/gi, '$1$2 עט');

  // 2. Одиночное слово [эт] (עת / אט / טת) при коротком устном ответе
  res = res.replace(/^(?:עת|אט|טת)[.!?]?$/gi, 'עט');
  res = res.replace(/^(?:עֵת|אֵט|טֵת)[.!?]?$/gi, 'עֵט');

  return res;
}

/**
 * Проверка на типичные галлюцинации моделей Whisper при тишине или неразборчивом шуме
 */
export function isWhisperSilenceHallucination(text: string): boolean {
  if (!text) return true;
  const clean = text
    .replace(/[.,!?:;״"'\-_/\\]/g, '')
    .trim()
    .toLowerCase();

  const hallucinations = new Set([
    'תודה על הצפייה',
    'תודה שצפיתם',
    'צפייה מהנה',
    'thanks for watching',
    'thank you for watching',
    'спасибо за просмотр',
    'субтитры',
    'редактор субтитров',
  ]);

  return hallucinations.has(clean);
}

export interface SpeechRecognizerOptions {
  vocabulary?: string[];
  apiKey?: string;
  provider?: 'groq' | 'gemini';
  continuous?: boolean;
  silenceDurationMs?: number;
  speechThreshold?: number;
  audioContext?: AudioContext | null;
  mediaStream?: MediaStream | null;
  energyThresholdDb?: number; // Порог минимальной RMS-энергии голоса (в dB, дефолт -35 dB)
  onAudioLevel?: (level: number) => void;
  onSilenceDetected?: (transcript: string, audioBlob?: Blob | null, audioUrl?: string | null) => void;
  onAudioRecorded?: (audioBlob: Blob, audioUrl: string) => void;
  onSpeechStart?: () => void;
  disableAutoSilenceStop?: boolean; // R-19: Отправка строго по кнопке, без отсечки по паузе
}

/**
 * Кроссплатформенный интерфейс распознавания речи (Speech-to-Text) для иврита
 * с поддержкой iPhone/Safari, Android и ПК через MediaRecorder + VAD + AI Transcription.
 */
export type RecognizerState = 'idle' | 'listening' | 'speech_active' | 'finalizing' | 'transcribing' | 'closed';

export interface TranscriptionResult {
  success: boolean;
  text?: string;
  reason?: 'filtered' | 'silence_hallucination' | 'prompt_hallucination' | 'no_speech_prob' | 'http_error' | 'network_error' | 'empty' | 'offline';
  status?: number;
  retryable?: boolean;
  rawText?: string;
  engine?: string;
  requestId?: string;
  latencyMs?: number;
}

export interface RecorderSegment {
  readonly id: number;
  recorder: MediaRecorder;
  chunks: Blob[];
  mimeType: string;
  isClosed: boolean;
}

export interface RecognizerSession {
  readonly id: number;
  state: RecognizerState;
  audioChunks: Blob[];
  activeSegment: RecorderSegment | null;
  mimeType: string;
  onResult: ((transcript: string, isFinal: boolean) => void) | null;
  onError: ((error: string) => void) | null;
  onEnd: ((lastTranscript: string, audioBlob?: Blob | null, audioUrl?: string | null) => void) | null;
  options: SpeechRecognizerOptions;
  hasDetectedSpeech: boolean;
  silenceStartTime: number | null;
  lastTranscript: string;
  preservedBlob: Blob | null;
  preservedUrl: string | null;
  recorder: MediaRecorder | null;
  finalizingSegments?: RecorderSegment[];
}

export class HebrewSpeechRecognizer {
  private recognition: any = null;
  private sessionCounter = 0;
  private segmentCounter = 0;
  private activeSession: RecognizerSession | null = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaSourceNode: MediaStreamAudioSourceNode | null = null;
  private vadInterval: any = null;
  private isListening = false;
  private isProcessingSilence = false;
  private ambientNoiseFloor = 10;
  private peakAvgInCurrentChunk = 0;
  private peakRmsDbInCurrentChunk = -100;

  private ensureActiveSession(): RecognizerSession {
    if (!this.activeSession || this.activeSession.state === 'closed') {
      this.activeSession = {
        id: ++this.sessionCounter,
        state: 'listening',
        audioChunks: [],
        activeSegment: null,
        mimeType: '',
        onResult: null,
        onError: null,
        onEnd: null,
        options: {},
        hasDetectedSpeech: false,
        silenceStartTime: null,
        lastTranscript: '',
        preservedBlob: null,
        preservedUrl: null,
        recorder: null,
        finalizingSegments: [],
      };
    }
    return this.activeSession;
  }

  public get audioChunks(): Blob[] {
    if (this.activeSession?.activeSegment) {
      return this.activeSession.activeSegment.chunks;
    }
    return this.activeSession ? this.activeSession.audioChunks : [];
  }
  public set audioChunks(chunks: Blob[]) {
    this.ensureActiveSession();
    this.activeSession!.audioChunks = chunks;
    if (this.activeSession!.activeSegment) {
      this.activeSession!.activeSegment.chunks = chunks;
    }
  }

  public get mediaRecorder(): MediaRecorder | null {
    return this.activeSession ? this.activeSession.recorder : null;
  }
  public set mediaRecorder(rec: MediaRecorder | null) {
    this.ensureActiveSession();
    this.activeSession!.recorder = rec;
  }

  public get currentOptions(): SpeechRecognizerOptions {
    return this.activeSession ? this.activeSession.options : {};
  }
  public set currentOptions(opts: SpeechRecognizerOptions) {
    this.ensureActiveSession();
    this.activeSession!.options = opts;
  }

  public get lastTranscript(): string {
    return this.activeSession ? this.activeSession.lastTranscript : '';
  }
  public set lastTranscript(text: string) {
    if (this.activeSession) {
      this.activeSession.lastTranscript = text;
    }
  }

  public get hasDetectedSpeech(): boolean {
    return this.activeSession ? this.activeSession.hasDetectedSpeech : false;
  }
  public set hasDetectedSpeech(val: boolean) {
    if (this.activeSession) {
      this.activeSession.hasDetectedSpeech = val;
    }
  }

  public get silenceStartTime(): number | null {
    return this.activeSession ? this.activeSession.silenceStartTime : null;
  }
  public set silenceStartTime(val: number | null) {
    if (this.activeSession) {
      this.activeSession.silenceStartTime = val;
    }
  }

  public get onResultCb(): ((transcript: string, isFinal: boolean) => void) | null {
    return this.activeSession ? this.activeSession.onResult : null;
  }
  public set onResultCb(cb: ((transcript: string, isFinal: boolean) => void) | null) {
    if (this.activeSession) {
      this.activeSession.onResult = cb;
    }
  }

  public get onErrorCb(): ((error: string) => void) | null {
    return this.activeSession ? this.activeSession.onError : null;
  }
  public set onErrorCb(cb: ((error: string) => void) | null) {
    if (this.activeSession) {
      this.activeSession.onError = cb;
    }
  }

  public get onEndCb(): ((lastTranscript: string, audioBlob?: Blob | null, audioUrl?: string | null) => void) | null {
    return this.activeSession ? this.activeSession.onEnd : null;
  }
  public set onEndCb(cb: ((lastTranscript: string, audioBlob?: Blob | null, audioUrl?: string | null) => void) | null) {
    if (this.activeSession) {
      this.activeSession.onEnd = cb;
    }
  }

  public isSpeechActive(): boolean {
    if (!this.activeSession) return false;
    return (
      this.activeSession.hasDetectedSpeech ||
      this.activeSession.state === 'speech_active' ||
      this.activeSession.state === 'finalizing' ||
      this.activeSession.state === 'transcribing' ||
      this.isProcessingSilence
    );
  }

  public getSessionState(): RecognizerState {
    return this.activeSession ? this.activeSession.state : 'idle';
  }

  public getPreservedAudio(): { blob: Blob | null; url: string | null } {
    return {
      blob: this.activeSession?.preservedBlob || null,
      url: this.activeSession?.preservedUrl || null,
    };
  }

  public clearPreservedAudio(): void {
    if (this.activeSession) {
      if (this.activeSession.preservedUrl) {
        try { URL.revokeObjectURL(this.activeSession.preservedUrl); } catch {}
      }
      this.activeSession.preservedBlob = null;
      this.activeSession.preservedUrl = null;
    }
  }

  public async retryPreservedAudio(): Promise<TranscriptionResult | string | null> {
    const session = this.activeSession;
    if (!session || !session.preservedBlob) return null;
    const mimeType = session.mimeType || session.recorder?.mimeType || 'audio/webm';
    return this.transcribeAudioBlob(session.preservedBlob, mimeType);
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') ||
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  public async start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: (lastTranscript: string, audioBlob?: Blob | null, audioUrl?: string | null) => void,
    options?: SpeechRecognizerOptions
  ): Promise<void> {
    if (!this.isSupported()) {
      onError('Запись звука не поддерживается в этом браузере.');
      return;
    }

    // Safely isolate old session so its asynchronous stop / ondataavailable cannot corrupt the new session
    const oldSession = this.activeSession;
    const preservedBlob = oldSession?.preservedBlob || null;
    const preservedUrl = oldSession?.preservedUrl || null;

    if (oldSession) {
      oldSession.state = 'closed';
      oldSession.onResult = null;
      oldSession.onError = null;
      const oldRecorder = oldSession.recorder;
      oldSession.recorder = null;
      oldSession.activeSegment = null;
      if (oldRecorder && oldRecorder.state !== 'inactive') {
        try {
          oldRecorder.stop();
        } catch {}
      }
    }

    const sessionId = ++this.sessionCounter;
    const session: RecognizerSession = {
      id: sessionId,
      state: 'listening',
      audioChunks: [],
      activeSegment: null,
      mimeType: '',
      onResult,
      onError,
      onEnd,
      options: options || {},
      hasDetectedSpeech: false,
      silenceStartTime: null,
      lastTranscript: '',
      preservedBlob,
      preservedUrl,
      recorder: null,
      finalizingSegments: [],
    };
    this.activeSession = session;
    this.isListening = true;
    this.hasDetectedSpeech = false;
    this.silenceStartTime = null;
    this.isProcessingSilence = false;
    this.ambientNoiseFloor = 10;
    this.peakAvgInCurrentChunk = 0;
    this.peakRmsDbInCurrentChunk = -100;

    // 1. Запуск браузерного распознавания речи (Web Speech API для живого превью)
    this.startRecognitionOnly();

    // 2. Получение или переиспользование аудиопотока и VAD анализатора громкости
    try {
      let stream = options?.mediaStream || this.mediaStream;
      if (!stream || !stream.active) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        }
      }

      if (!this.isListening || session.state === 'closed') {
        return;
      }

      if (stream) {
        this.mediaStream = stream;

        // Настройка Web Audio API AnalyserNode для VAD и анимации звуковых волн
        this.setupAudioAnalyser(stream, options?.audioContext);

        // Выбираем лучший поддерживаемый формат (Safari на iPhone использует audio/mp4)
        let mimeType = '';
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
          } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/aac')) {
            mimeType = 'audio/aac';
          }
        }
        session.mimeType = mimeType;

        this.startSessionRecorder(session, stream);
      }
    } catch (err: any) {
      console.warn('MediaRecorder / microphone error:', err);
      if (!this.recognition) {
        this.isListening = false;
        session.state = 'closed';
        session.onError?.(err?.message || 'Не удалось получить доступ к микрофону');
      }
    }
  }

  private isSessionClosed(session: RecognizerSession): boolean {
    return (session.state as string) === 'closed';
  }

  private startSessionRecorder(session: RecognizerSession, stream: MediaStream): void {
    if (this.isSessionClosed(session)) return;

    try {
      const mimeType = session.mimeType || 'audio/webm';
      const recorder = session.mimeType
        ? new MediaRecorder(stream, { mimeType: session.mimeType })
        : new MediaRecorder(stream);
      const segment: RecorderSegment = {
        id: ++this.segmentCounter,
        recorder,
        chunks: [],
        mimeType: session.mimeType || recorder.mimeType || mimeType,
        isClosed: false,
      };
      session.activeSegment = segment;
      session.recorder = recorder;
      session.audioChunks = segment.chunks;
      session.state = 'listening';
      session.hasDetectedSpeech = false;

      recorder.ondataavailable = (e) => {
        // Scoped strictly to this segment and session
        if (this.isSessionClosed(session)) return;
        if (e.data && e.data.size > 0) {
          segment.chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        segment.isClosed = true;
        if (this.isSessionClosed(session)) return;
        if (this.activeSession?.id !== session.id) return;
        if (session.activeSegment?.id !== segment.id) return;

        const recordedChunks = [...segment.chunks];
        segment.chunks = [];
        session.audioChunks = [];

        let recordedBlob: Blob | null = null;
        let recordedUrl: string | null = null;

        const cleanupStream = () => {
          if (!session.options.mediaStream && this.mediaStream) {
            try {
              this.mediaStream.getTracks().forEach((track) => track.stop());
            } catch {}
            this.mediaStream = null;
          }
        };

        if (recordedChunks.length > 0) {
          const blobType = session.mimeType || recordedChunks[0]?.type || 'audio/webm';
          const audioBlob = new Blob(recordedChunks, { type: blobType });
          recordedBlob = audioBlob;
          try {
            recordedUrl = URL.createObjectURL(audioBlob);
            session.options.onAudioRecorded?.(audioBlob, recordedUrl);
          } catch (err) {
            console.warn('createObjectURL error:', err);
          }

          if (audioBlob.size > 1000) {
            session.state = 'transcribing';
            const transcribeRes = await this.transcribeAudioBlob(audioBlob, blobType);
            if (this.isSessionClosed(session)) return;

            const text = typeof transcribeRes === 'string' ? transcribeRes : transcribeRes?.text;
            const success = typeof transcribeRes === 'string' ? Boolean(transcribeRes.trim()) : Boolean(transcribeRes?.success);

            if (success && text && text.trim()) {
              session.lastTranscript = text.trim();
              session.onResult?.(session.lastTranscript, true);
              const endCb = session.onEnd;
              session.onEnd = null;
              session.state = 'closed';
              endCb?.(session.lastTranscript, recordedBlob, recordedUrl);
              cleanupStream();
              return;
            }
          }
        }

        if (this.isSessionClosed(session)) return;
        if (session.lastTranscript && session.lastTranscript.trim()) {
          callFlightRecorder.record('STT', 'Fallback to device speech recognition', {
            text: session.lastTranscript.trim(),
          }, 'warn');
        }
        const endCb = session.onEnd;
        session.onEnd = null;
        session.state = 'closed';
        endCb?.(session.lastTranscript, recordedBlob, recordedUrl);
        cleanupStream();
      };

      recorder.start(250);
    } catch (err: any) {
      console.warn('Error starting session recorder:', err);
    }
  }

  private restartRecorderForSession(session: RecognizerSession): void {
    if (this.isSessionClosed(session) || !this.mediaStream || !this.mediaStream.active) return;
    try {
      const oldSegment = session.activeSegment;
      const oldRecorder = session.recorder;
      if (oldSegment) {
        oldSegment.isClosed = true;
      }
      if (oldRecorder && oldRecorder.state !== 'inactive') {
        // Do not discard in-flight chunks from the previous recorder:
        // they go strictly into oldSegment.chunks, NEVER leaking into the new recorder's buffer!
        // We do NOT overwrite session.preservedBlob with a trailing fragment (P1 fix).
        oldRecorder.ondataavailable = (e) => {
          if (this.isSessionClosed(session)) return;
          if (e.data && e.data.size > 0 && oldSegment) {
            oldSegment.chunks.push(e.data);
          }
        };
        oldRecorder.onstop = () => {
          if (oldSegment) {
            oldSegment.isClosed = true;
          }
        };
        try { oldRecorder.stop(); } catch {}
      }
    } catch {}
    this.startSessionRecorder(session, this.mediaStream);
  }

  private startRecognitionOnly(): void {
    if (!this.isListening) return;
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      if (this.recognition) {
        try {
          this.recognition.onresult = null;
          this.recognition.onerror = null;
          this.recognition.onend = null;
          this.recognition.abort();
        } catch {}
        this.recognition = null;
      }

      const rec = new SpeechRecognition();
      rec.lang = 'he-IL';
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onresult = (event: any) => {
        const interimChunks: string[] = [];
        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          const trans = result[0]?.transcript || '';
          if (trans) interimChunks.push(trans);
        }
        const stitched = normalizeHebrewSpeechTranscript(stitchSpeechChunks(interimChunks).trim());
        if (stitched && this.isListening) {
          this.lastTranscript = stitched;
          this.hasDetectedSpeech = true;
          this.silenceStartTime = null;
          this.onResultCb?.(stitched, false);
        }
      };

      rec.onerror = (e: any) => {
        if (e.error === 'no-speech' || e.error === 'network' || e.error === 'aborted') {
          return;
        }
        console.warn('Browser SpeechRecognition error:', e.error);
      };

      rec.onend = () => {
        this.recognition = null;
        if (this.isListening && (this.currentOptions.continuous ?? true)) {
          setTimeout(() => {
            if (this.isListening && !this.recognition) {
              this.startRecognitionOnly();
            }
          }, 150);
        }
      };

      this.recognition = rec;
      rec.start();
    } catch (e) {
      this.recognition = null;
      console.warn('SpeechRecognition start failed:', e);
    }
  }

  private setupAudioAnalyser(stream: MediaStream, providedCtx?: AudioContext | null): void {
    try {
      let ctx = providedCtx;
      if (!ctx || ctx.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) ctx = new AudioCtx();
      }
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      this.audioContext = ctx;

      if (this.mediaSourceNode) {
        try {
          this.mediaSourceNode.disconnect();
        } catch {}
        this.mediaSourceNode = null;
      }

      const source = ctx.createMediaStreamSource(stream);
      this.mediaSourceNode = source;
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.3;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const timeData = new Uint8Array(bufferLength);

      let speechFrames = 0;
      this.hasDetectedSpeech = false;
      this.silenceStartTime = null;
      this.isProcessingSilence = false;
      this.peakAvgInCurrentChunk = 0;
      this.peakRmsDbInCurrentChunk = -100;

      this.vadInterval = setInterval(async () => {
        if (!this.isListening || !this.analyser) return;

        this.analyser.getByteFrequencyData(dataArray);
        this.analyser.getByteTimeDomainData(timeData);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1, Math.max(0, (avg - 3) / 40));
        this.currentOptions.onAudioLevel?.(normalized);

        // Расчёт среднеквадратичной энергии во временной области (RMS dBFS)
        let sumSquares = 0;
        for (let i = 0; i < bufferLength; i++) {
          const norm = (timeData[i] - 128) / 128;
          sumSquares += norm * norm;
        }
        const rms = Math.sqrt(sumSquares / bufferLength);
        const rmsDb = rms > 0.0001 ? 20 * Math.log10(rms) : -100;

        const threshold = this.currentOptions.speechThreshold ?? 16;
        const energyThreshold = this.currentOptions.energyThresholdDb ?? -35;

        // Человеческая речь: частота превышает порог и фон, а RMS выше -35 dB
        const isSpeakingNow = avg > threshold && avg >= (this.ambientNoiseFloor + 5) && rmsDb > energyThreshold;

        if (isSpeakingNow) {
          if (avg > this.peakAvgInCurrentChunk) this.peakAvgInCurrentChunk = avg;
          if (rmsDb > this.peakRmsDbInCurrentChunk) this.peakRmsDbInCurrentChunk = rmsDb;
          speechFrames++;

          // Требуем минимум 4 устойчивых фрейма (~200мс) или выраженный пик громкости
          if (speechFrames >= 4 || (avg > threshold + 10 && rmsDb > (energyThreshold + 6))) {
            if (!this.hasDetectedSpeech) {
              callFlightRecorder.record('VAD', 'Speech started (VAD trigger)', {
                avg: Math.round(avg),
                rmsDb: Math.round(rmsDb),
                threshold,
                ambientFloor: Math.round(this.ambientNoiseFloor),
              }, 'info');
              if (this.activeSession && !this.isSessionClosed(this.activeSession)) {
                this.activeSession.state = 'speech_active';
                this.activeSession.options.onSpeechStart?.();
              }
            }
            this.hasDetectedSpeech = true;
            this.silenceStartTime = null;
          }
        } else {
          // Адаптивное отслеживание фонового шума комнаты во время тишины
          if (!this.hasDetectedSpeech) {
            this.ambientNoiseFloor = this.ambientNoiseFloor * 0.95 + avg * 0.05;
          }
          speechFrames = Math.max(0, speechFrames - 1);
          if (this.hasDetectedSpeech && !this.isProcessingSilence && !this.currentOptions.disableAutoSilenceStop) {
            if (!this.silenceStartTime) {
              this.silenceStartTime = Date.now();
            } else {
              const silenceDuration = this.currentOptions.silenceDurationMs ?? 1300;
              if (Date.now() - this.silenceStartTime >= silenceDuration) {
                this.isProcessingSilence = true;
                this.silenceStartTime = null;
                this.hasDetectedSpeech = false;
                speechFrames = 0;
                callFlightRecorder.record('VAD', 'Silence detected after speech', { silenceDuration }, 'info');

                await this.handleSilenceDetected();
                this.isProcessingSilence = false;
              }
            }
          }
        }
      }, 50);
    } catch (e) {
      console.warn('Audio analyser setup error:', e);
    }
  }

  private async handleSilenceDetected(): Promise<void> {
    const session = this.activeSession;
    if (!session || this.isSessionClosed(session) || !session.options.onSilenceDetected) {
      return;
    }

    // 0. ENERGY GATE: Проверяем, была ли в записанном аудиочанке реальная энергия человеческой речи
    const energyThreshold = session.options.energyThresholdDb ?? -35;
    const hasRealSpeechEnergy = this.peakAvgInCurrentChunk >= 15 && this.peakRmsDbInCurrentChunk > energyThreshold;

    if (!hasRealSpeechEnergy) {
      callFlightRecorder.record('VAD', 'Silence/noise chunk dropped by Energy Gate', {
        peakAvg: Math.round(this.peakAvgInCurrentChunk),
        peakRmsDb: Math.round(this.peakRmsDbInCurrentChunk),
        ambientFloor: Math.round(this.ambientNoiseFloor),
      }, 'warn');
      session.audioChunks = [];
      if (session.activeSegment) session.activeSegment.chunks = [];
      session.lastTranscript = '';
      session.hasDetectedSpeech = false;
      session.silenceStartTime = null;
      this.peakAvgInCurrentChunk = 0;
      this.peakRmsDbInCurrentChunk = -100;
      // При сбросе чанков перезапускаем рекордер, чтобы следующая фраза начиналась с EBML-заголовка
      this.restartRecorderForSession(session);
      return;
    }

    // Сбрасываем пиковые индикаторы для следующего чанка
    this.peakAvgInCurrentChunk = 0;
    this.peakRmsDbInCurrentChunk = -100;

    // 1. Пробуем транскрибировать накопленное аудио через Groq Whisper V3 для максимальной полноты фразы
    if (session.recorder && session.recorder.state !== 'inactive') {
      try {
        const oldRec = session.recorder;
        const oldSegment = session.activeSegment;
        let timedOut = false;
        session.state = 'finalizing';

        // Изолируем новый сегмент записи: запускаем новый рекордер немедленно,
        // чтобы последующая речь ученика не терялась и писалась в чистый буфер.
        if (this.mediaStream && this.mediaStream.active) {
          this.startSessionRecorder(session, this.mediaStream);
        } else {
          session.recorder = null;
          session.activeSegment = null;
          session.audioChunks = [];
        }

        if (!session.finalizingSegments) {
          session.finalizingSegments = [];
        }
        if (oldSegment) {
          session.finalizingSegments.push(oldSegment);
        }

        const helperUpdatePreserved = () => {
          if (this.isSessionClosed(session)) return;
          if (oldSegment && oldSegment.chunks.length > 0) {
            const blobType = oldSegment.mimeType || session.mimeType || 'audio/webm';
            const combinedBlob = new Blob([...oldSegment.chunks], { type: blobType });
            session.preservedBlob = combinedBlob;
            try {
              if (session.preservedUrl) {
                URL.revokeObjectURL(session.preservedUrl);
              }
              session.preservedUrl = URL.createObjectURL(combinedBlob);
              session.options.onAudioRecorded?.(combinedBlob, session.preservedUrl);
            } catch {}
          }
        };

        await new Promise<void>((resolve) => {
          let resolved = false;
          const finish = () => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timer);
              resolve();
            }
          };

          // Событийное ожидание: завершается немедленно при доставке dataavailable/stop.
          // Резервный таймаут 1500мс защищает от зависания при системном сбое MediaRecorder.
          const timer = setTimeout(() => {
            timedOut = true;
            finish();
          }, 1500);

          oldRec.ondataavailable = (e: any) => {
            if (this.isSessionClosed(session)) return;
            if (e.data && e.data.size > 0 && oldSegment) {
              oldSegment.chunks.push(e.data);
              // Если финализация уже завершилась по таймауту, дополняем сохранённый Blob
              // каждым пришедшим байтом, чтобы вся фраза осталась восстановимой для повтора
              if (timedOut) {
                helperUpdatePreserved();
              }
            }
          };

          oldRec.onstop = () => {
            if (oldSegment) {
              oldSegment.isClosed = true;
              if (timedOut) {
                helperUpdatePreserved();
              }
            }
            if (session.finalizingSegments && oldSegment) {
              const idx = session.finalizingSegments.indexOf(oldSegment);
              if (idx >= 0) session.finalizingSegments.splice(idx, 1);
            }
            finish();
          };

          try {
            oldRec.requestData();
          } catch {}
          try {
            oldRec.stop();
          } catch {
            finish();
          }
        });

        if (this.isSessionClosed(session)) return;

        const targetChunks = oldSegment ? oldSegment.chunks : [];
        const blobType = oldSegment?.mimeType || session.mimeType || 'audio/webm';

        // Таймаут финализации — это отдельный исход: сохраняем запись для восстановления,
        // но категорически НЕ отправляем обрезанную фразу на транскрибацию
        if (timedOut) {
          callFlightRecorder.record('VAD', 'Finalization requestData/stop timed out; aborting submission to avoid sending truncated phrase, preserving audio for recovery', {
            chunkCount: targetChunks.length,
          }, 'warn');
          helperUpdatePreserved();
          session.state = 'listening';
          session.hasDetectedSpeech = false;
          session.silenceStartTime = null;
          return;
        }

        if (targetChunks.length > 0) {
          const audioBlob = new Blob([...targetChunks], { type: blobType });
          let audioUrl: string | null = null;
          try {
            audioUrl = URL.createObjectURL(audioBlob);
            session.options.onAudioRecorded?.(audioBlob, audioUrl);
          } catch {}

          // Сохраняем полную запись и связанный URL до отправки на транскрибацию
          session.preservedBlob = audioBlob;
          session.preservedUrl = audioUrl;

          // Если записано реальное аудио (более 1500 байт ~0.3с речи), транскрибируем через Groq Whisper V3
          if (audioBlob.size >= 1500) {
            session.state = 'transcribing';

            let transcribeRes = await this.transcribeAudioBlob(audioBlob, blobType);
            if (this.isSessionClosed(session)) return;

            let text = typeof transcribeRes === 'string' ? transcribeRes : transcribeRes?.text;
            let success = typeof transcribeRes === 'string' ? Boolean(transcribeRes.trim()) : Boolean(transcribeRes?.success);

            // Ограниченный автоматический повтор при временных сетевых/серверных ошибках (500, 429, network, offline)
            if (!success && transcribeRes && typeof transcribeRes === 'object' && transcribeRes.retryable) {
              callFlightRecorder.record('STT', 'Whisper STT failed with retryable error, attempting 1 retry', {
                reason: transcribeRes.reason,
                status: transcribeRes.status,
              }, 'warn');
              await new Promise((r) => setTimeout(r, 250));
              if (!this.isSessionClosed(session)) {
                transcribeRes = await this.transcribeAudioBlob(audioBlob, blobType);
                if (this.isSessionClosed(session)) return;
                text = typeof transcribeRes === 'string' ? transcribeRes : transcribeRes?.text;
                success = typeof transcribeRes === 'string' ? Boolean(transcribeRes.trim()) : Boolean(transcribeRes?.success);
              }
            }

            if (success && text && text.trim().length >= 2 && !isWhisperSilenceHallucination(text.trim())) {
              session.lastTranscript = '';
              session.silenceStartTime = null;
              if ((session.state as RecognizerState) !== 'speech_active') {
                session.state = 'listening';
                session.hasDetectedSpeech = false;
              }
              callFlightRecorder.record('VAD', 'VAD phrase accepted for submission', { text: text.trim(), sizeBytes: audioBlob.size }, 'success');
              session.options.onSilenceDetected?.(text.trim(), audioBlob, audioUrl);
              return;
            } else {
              session.silenceStartTime = null;
              if ((session.state as RecognizerState) !== 'speech_active') {
                session.state = 'listening';
                session.hasDetectedSpeech = false;
              }
              callFlightRecorder.record('VAD', 'Transcribe returned empty/filtered text, preserving chunk for retry/fallback', { rawText: text }, 'warn');
            }
          } else {
            session.state = 'listening';
            session.hasDetectedSpeech = false;
            session.silenceStartTime = null;
            callFlightRecorder.record('VAD', 'Noise rejected: chunk too small (<1500b)', { sizeBytes: audioBlob.size }, 'warn');
          }
        }
      } catch (err) {
        console.warn('VAD transcribe fallback error:', err);
        if (!this.isSessionClosed(session)) {
          if ((session.state as RecognizerState) !== 'speech_active') {
            session.state = 'listening';
            session.hasDetectedSpeech = false;
          }
          session.silenceStartTime = null;
        }
      }
    }

    // 2. Fallback на браузерный Web Speech API (только если есть свежий осмысленный текст)
    const recognizedText = session.lastTranscript.trim();
    if (recognizedText && recognizedText.length >= 2 && !isWhisperSilenceHallucination(recognizedText)) {
      const fallbackBlob = session.preservedBlob;
      const fallbackUrl = session.preservedUrl;
      session.lastTranscript = '';
      session.hasDetectedSpeech = false;
      session.silenceStartTime = null;
      session.options.onSilenceDetected?.(recognizedText, fallbackBlob, fallbackUrl);
    }
  }

  private async transcribeAudioBlob(audioBlob: Blob, mimeType: string): Promise<TranscriptionResult | string | null> {
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        callFlightRecorder.record('STT', 'Whisper STT aborted: device offline', {}, 'warn');
        return { success: false, reason: 'offline', retryable: true, latencyMs: 0 };
      }
      const formData = new FormData();
      const ext = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('aac') ? 'aac' : 'webm';
      formData.append('file', audioBlob, `speech.${ext}`);

      let cleanPrompt = '';
      if (this.currentOptions.vocabulary && this.currentOptions.vocabulary.length > 0) {
        cleanPrompt = Array.from(
          new Set(
            this.currentOptions.vocabulary
              .map((w) => stripNikkud(w).trim())
              .filter(Boolean)
          )
        )
          .slice(0, 20)
          .join(', ')
          .slice(0, 250);
        if (cleanPrompt) {
          formData.append('prompt', cleanPrompt);
        }
      }
      if (this.currentOptions.apiKey) {
        formData.append('apiKey', this.currentOptions.apiKey);
      }

      callFlightRecorder.record('STT', 'Whisper STT request sent', {
        sizeBytes: audioBlob.size,
        mimeType,
        promptLength: cleanPrompt.length,
      }, 'info');

      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      const latencyMs = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0);

      if (res.ok) {
        const data = await res.json();
        if (data.filtered) {
          callFlightRecorder.record('STT', `Whisper silence hallucination filtered (${latencyMs}ms)`, {
            latencyMs,
            reason: data.reason,
            text: data.text,
          }, 'warn');
          return { success: false, reason: data.reason || 'silence_hallucination', retryable: false, rawText: data.text, latencyMs };
        }
        if (data.text && data.text.trim()) {
          const normalized = normalizeHebrewSpeechTranscript(data.text.trim());
          if (!isWhisperSilenceHallucination(normalized)) {
            callFlightRecorder.record('STT', `Whisper STT success (${latencyMs}ms)`, {
              latencyMs,
              rawText: data.text,
              normalized,
            }, 'success');
            return { success: true, text: normalized, engine: data.engine, latencyMs };
          } else {
            callFlightRecorder.record('STT', `Whisper silence hallucination filtered (${latencyMs}ms)`, {
              latencyMs,
              text: data.text,
            }, 'warn');
            return { success: false, reason: 'silence_hallucination', retryable: false, rawText: data.text, latencyMs };
          }
        }
        return { success: false, reason: 'empty', retryable: false, latencyMs };
      } else {
        callFlightRecorder.record('STT', `Whisper STT HTTP error (${latencyMs}ms)`, {
          latencyMs,
          status: res.status,
        }, 'error');
        return { success: false, reason: 'http_error', status: res.status, retryable: res.status === 429 || res.status >= 500, latencyMs };
      }
    } catch (e: any) {
      const latencyMs = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0);
      callFlightRecorder.record('STT', `Whisper STT exception (${latencyMs}ms)`, {
        latencyMs,
        error: String(e),
      }, 'error');
      console.warn('transcribeAudioBlob error:', e);
      return { success: false, reason: 'network_error', retryable: true, latencyMs };
    }
  }

  public cancel(): void {
    this.isListening = false;
    const session = this.activeSession;
    if (session) {
      session.state = 'closed';
      session.onResult = null;
      session.onError = null;
      session.onEnd = null;
      session.audioChunks = [];
      if (session.activeSegment) {
        session.activeSegment.chunks = [];
        session.activeSegment.isClosed = true;
      }
      session.activeSegment = null;
      if (session.finalizingSegments) {
        for (const seg of session.finalizingSegments) {
          seg.chunks = [];
          seg.isClosed = true;
          try {
            seg.recorder.ondataavailable = null;
            seg.recorder.onstop = null;
            if (seg.recorder.state !== 'inactive') {
              seg.recorder.stop();
            }
          } catch {}
        }
        session.finalizingSegments = [];
      }
      if (session.preservedUrl) {
        try { URL.revokeObjectURL(session.preservedUrl); } catch {}
      }
      session.preservedBlob = null;
      session.preservedUrl = null;
      if (session.recorder) {
        try {
          session.recorder.ondataavailable = null;
          session.recorder.onstop = null;
          if (session.recorder.state !== 'inactive') {
            session.recorder.stop();
          }
        } catch {}
        session.recorder = null;
      }
    }
    this.activeSession = null;
    this.hasDetectedSpeech = false;
    this.silenceStartTime = null;
    this.isProcessingSilence = false;

    if (this.vadInterval) {
      clearInterval(this.vadInterval);
      this.vadInterval = null;
    }

    if (this.mediaSourceNode) {
      try {
        this.mediaSourceNode.disconnect();
      } catch {}
      this.mediaSourceNode = null;
    }

    this.analyser = null;

    if (this.recognition) {
      try {
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }

    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((track) => track.stop());
      } catch {}
      this.mediaStream = null;
    }
  }

  public async commitSpeech(): Promise<void> {
    if (!this.isListening || this.isProcessingSilence) return;
    this.isProcessingSilence = true;
    try {
      await this.handleSilenceDetected();
    } finally {
      this.isProcessingSilence = false;
    }
  }

  public stop(cancelPending = false): void {
    if (cancelPending) {
      this.cancel();
      return;
    }

    const session = this.activeSession;
    if (!session || session.state === 'closed') return;

    this.isListening = false;
    this.hasDetectedSpeech = false;
    this.silenceStartTime = null;
    this.isProcessingSilence = false;

    if (this.vadInterval) {
      clearInterval(this.vadInterval);
      this.vadInterval = null;
    }

    if (this.mediaSourceNode) {
      try {
        this.mediaSourceNode.disconnect();
      } catch {}
      this.mediaSourceNode = null;
    }

    this.analyser = null;

    if (this.recognition) {
      try {
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }

    if (session.recorder && session.recorder.state !== 'inactive') {
      try {
        session.recorder.stop();
      } catch (err) {
        console.warn('Error stopping mediaRecorder:', err);
        const endCb = session.onEnd;
        session.onEnd = null;
        session.state = 'closed';
        endCb?.(session.lastTranscript, null, null);
      }
    } else {
      const endCb = session.onEnd;
      session.onEnd = null;
      session.state = 'closed';
      endCb?.(session.lastTranscript, null, null);
    }
  }
}

