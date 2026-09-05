const NIKKUD_REGEX = /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/g;

export function stripNikkud(text: string): string {
  if (!text) return '';
  return text.replace(NIKKUD_REGEX, '');
}

export function isHebrewText(text: string): boolean {
  if (!text) return false;
  return /[\u0590-\u05FF]/.test(text);
}

export function cleanHebrewToken(token: string): string {
  if (!token) return '';
  return token.replace(/^[.,!?;:"'״׳()[\]{}—\-]+|[.,!?;:"'״׳()[\]{}—\-]+$/g, '');
}

export interface TextToken {
  id: string;
  text: string;
  cleanText: string;
  isHebrew: boolean;
}

export function tokenizeText(text: string): TextToken[] {
  if (!text) return [];
  const parts = text.split(/(\s+)/);
  return parts.map((part, idx) => {
    const clean = cleanHebrewToken(stripNikkud(part));
    const isHeb = isHebrewText(part) && clean.length > 0;
    return {
      id: `tok-${idx}-${clean}`,
      text: part,
      cleanText: clean,
      isHebrew: isHeb,
    };
  });
}

export function normalizeTranscription(transcription: string): string {
  if (!transcription) return '';
  let res = transcription.trim();
  // Союз «ו» в современном разговорном иврите всегда звучит как «вэ-», заменяем архаичное книжное «у-»
  res = res.replace(/(^|[\s"«(—])у-([а-яёА-ЯЁa-zA-Z])/gi, '$1вэ-$2');
  return res;
}

/**
 * Автоматическая генерация русской фонетической транскрипции из огласованного иврита (ניקוד)
 */
export function generateHebrewTranscription(text: string): string {
  if (!text) return '';
  const cleanTokens = text.trim().split(/\s+/);

  const rawTranscription = cleanTokens
    .map((w) => {
      let result = '';
      let i = 0;
      let lastVowel = '';

      while (i < w.length) {
        const char = w[i];
        let dagesh = false;
        let sinDot = false;
        let shinDot = false;
        const vowels: number[] = [];
        let nextIdx = i + 1;

        while (
          nextIdx < w.length &&
          w.charCodeAt(nextIdx) >= 0x0591 &&
          w.charCodeAt(nextIdx) <= 0x05c7
        ) {
          const code = w.charCodeAt(nextIdx);
          if (code === 0x05bc) dagesh = true;
          else if (code === 0x05c1) shinDot = true;
          else if (code === 0x05c2) sinDot = true;
          else vowels.push(code);
          nextIdx++;
        }

        // Согласные буквы
        let consonant = '';
        if (char === 'א') consonant = '';
        else if (char === 'ב') consonant = dagesh ? 'б' : 'в';
        else if (char === 'ג') consonant = 'г';
        else if (char === 'ד') consonant = 'д';
        else if (char === 'ה')
          consonant =
            (i === w.length - 1 || nextIdx === w.length) && !dagesh ? '' : 'h';
        else if (char === 'ו') {
          if (i === 0 && dagesh && nextIdx < w.length) {
            // Союз "וּ" в начале слова: в современном разговорном иврите произносится как "вэ-"
            consonant = 'вэ-';
          } else if (dagesh) consonant = 'у';
          else if (vowels.includes(0x05b9) || vowels.includes(0x05ba))
            consonant = 'о';
          else consonant = 'в';
        } else if (char === 'ז') consonant = 'з';
        else if (char === 'ח') consonant = 'х';
        else if (char === 'ט') consonant = 'т';
        else if (char === 'י') {
          if (lastVowel === 'и' && vowels.length === 0) consonant = ''; // Матер лекционис после хирика
          else consonant = 'й';
        } else if (char === 'כ' || char === 'ך') consonant = dagesh ? 'к' : 'х';
        else if (char === 'ל') consonant = 'л';
        else if (char === 'מ' || char === 'ם') consonant = 'м';
        else if (char === 'נ' || char === 'ן') consonant = 'н';
        else if (char === 'ס') consonant = 'с';
        else if (char === 'ע') consonant = '';
        else if (char === 'פ' || char === 'ף') consonant = dagesh ? 'п' : 'ф';
        else if (char === 'צ' || char === 'ץ') consonant = 'ц';
        else if (char === 'ק') consonant = 'к';
        else if (char === 'ר') consonant = 'р';
        else if (char === 'ש') consonant = sinDot ? 'с' : 'ш';
        else if (char === 'ת') consonant = 'т';
        else consonant = char;

        // Гласные огласовки
        let vowelStr = '';
        for (const v of vowels) {
          if (v === 0x05b7 || v === 0x05b8 || v === 0x05b2) vowelStr = 'а'; // Патах, Камац, Хатаф-патах
          else if (v === 0x05b5 || v === 0x05b6 || v === 0x05b1) vowelStr = 'е'; // Цере, Сеголь, Хатаф-сеголь
          else if (v === 0x05b4) vowelStr = 'и'; // Хирик
          else if (v === 0x05b9 || v === 0x05ba || v === 0x05b3) vowelStr = 'о'; // Холам, Хатаф-камац
          else if (v === 0x05bb) vowelStr = 'у'; // Кубуц
          else if (v === 0x05b0) {
            // Шва
            if (
              i === 0 &&
              (char === 'ב' ||
                char === 'ל' ||
                char === 'מ' ||
                char === 'ש' ||
                char === 'ת' ||
                char === 'ד' ||
                char === 'כ' ||
                char === 'ו')
            ) {
              vowelStr = 'е';
            } else if (
              nextIdx < w.length &&
              (w[nextIdx] === 'י' || w[nextIdx] === 'ו')
            ) {
              vowelStr = 'е';
            } else {
              vowelStr = '';
            }
          }
        }

        lastVowel = vowelStr;

        // Фонетические правила соединения
        if ((char === 'א' || char === 'ע') && vowelStr) {
          if (i === 0 && (vowelStr === 'е' || vowelStr === 'э')) result += 'э';
          else result += vowelStr;
        } else if (char === 'י' && vowelStr) {
          if (vowelStr === 'а') result += 'я';
          else if (vowelStr === 'е') result += 'е';
          else if (vowelStr === 'у') result += 'ю';
          else if (vowelStr === 'о') result += 'йо';
          else result += 'и';
        } else if (char === 'ו' && (consonant === 'у' || consonant === 'о')) {
          result += consonant;
        } else {
          result += consonant + vowelStr;
        }

        i = nextIdx;
      }
      return result;
    })
    .join(' ');

  return normalizeTranscription(rawTranscription);
}

/**
 * Получение надежной транскрипции для слова:
 * Если у слова задана транскрипция — возвращает её;
 * Если нет — автоматически транслитерирует огласованный иврит на русский язык.
 */
export function getWordTranscription(word?: {
  hebrew?: string;
  transcription?: string;
  hebrewPlain?: string;
} | null): string {
  if (!word) return '';
  if (word.transcription && word.transcription.trim()) {
    return word.transcription.trim();
  }
  if (word.hebrew) {
    return generateHebrewTranscription(word.hebrew);
  }
  return '';
}

/**
 * Фонетический ключ слова на иврите для устранения омофонических ошибок распознавания речи (ASR):
 * ע/א -> 'א', ט/ת -> 'ת', כ/ח -> 'ח', ס/שׂ -> 'ס', ב/ו -> 'ו', ק/כּ -> 'כ'
 */
export function getHebrewPhoneticSignature(text: string): string {
  if (!text) return '';
  return stripNikkud(text)
    .trim()
    .toLowerCase()
    .replace(/[\s\-_.,!?:;"'״׳()[\]{}—]+/g, '')
    .replace(/[עא]/g, 'א')
    .replace(/[טת]/g, 'ת')
    .replace(/[כךח]/g, 'ח')
    .replace(/[סש]/g, 'ס')
    .replace(/[בו]/g, 'ו')
    .replace(/[ק]/g, 'כ');
}

/**
 * Проверка, совпадают ли два слова/фразы на слух (фонетические омофоны)
 */
export function areHebrewWordsPhoneticMatch(word1: string, word2: string): boolean {
  if (!word1 || !word2) return false;
  return getHebrewPhoneticSignature(word1) === getHebrewPhoneticSignature(word2);
}

/**
 * Фонетическое выравнивание транскрипта по словарю урока:
 * Если распознанное слово/фраза фонетически совпадает с целевым словом урока,
 * но содержит омофоническую подмену (напр. טודה -> תודה, ספה -> שפה, זה את -> זה עט),
 * заменяет его на каноническое написание из урока.
 */
export function alignTranscriptToVocabulary(transcript: string, vocabulary?: string[]): string {
  if (!transcript || !vocabulary || vocabulary.length === 0) return transcript;

  // 1. Создаем карту фонетических сигнатур для целевых фраз и слов урока
  const vocabMap = new Map<string, string>();
  for (const v of vocabulary) {
    const clean = stripNikkud(v).trim();
    if (clean) {
      const sig = getHebrewPhoneticSignature(clean);
      if (!vocabMap.has(sig)) {
        vocabMap.set(sig, clean);
      }
    }
  }

  // 2. Сначала проверяем фразу целиком (для связок вроде "זה עט", "בוקר טוב")
  const wholeSig = getHebrewPhoneticSignature(transcript);
  if (vocabMap.has(wholeSig)) {
    return vocabMap.get(wholeSig)!;
  }

  // 3. Проверяем по отдельным словам
  const words = transcript.split(/\s+/);
  let changed = false;
  const alignedWords = words.map((w) => {
    const wSig = getHebrewPhoneticSignature(w);
    if (vocabMap.has(wSig)) {
      changed = true;
      return vocabMap.get(wSig)!;
    }
    return w;
  });

  return changed ? alignedWords.join(' ') : transcript;
}

