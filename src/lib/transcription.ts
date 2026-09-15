// Регулярное выражение для всех знаков огласовок (никуд) и диакритики
const NIKKUD_REGEX = /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/g;

/**
 * Снятие огласовок с ивритского текста с соблюдением стандарта כתיב מלא (R-04, R-05).
 * В современном иврите любой звук [u] (кубуц \u05BB) при снятии огласовок
 * обязательно обозначается буквой вав (ו), если вав не стоит следом.
 * Это защищает от превращения слов в архаичный ктив хасер и ложные омонимы
 * (например: «מְעֻלֶּה» -> «מעולה», а не «מעלה» [ма́ла/вверх]; «סֻכָּר» -> «סוכר», а не «סכר»).
 */
export function stripNikkud(text: string): string {
  if (!text) return '';
  // Согласная буква (кроме вав) с огласовкой кубуц без последующей вав -> добавляем вав
  const withModernVav = text.replace(
    /([א-הז-ת][\u05BC\u05C1\u05C2]*)\u05BB(?![ְֱֲֳִֵֶַָֹֺֻּֽֿׁׂׅׄ]*ו)/g,
    (_match, letter) => letter + 'ו'
  );
  return withModernVav.replace(NIKKUD_REGEX, '');
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

  // 1. Нормативное произношение союза «ו» как «у-» (перед буквами בומ״פ и перед שווא)
  // сохраняется в соответствии со стандартом Академии языка иврит и не подменяется на «вэ-».

  // 2. «בַּבֹּקֶר» (бабóкер): предлог בְּ + артикль הַ дает сильный дагеш во второй ב ([б], а не [в])
  res = res.replace(/(^|[\s"«(—\[])(?:б[аá]вокер|б[аá]-вокер|б[эеé]вокер|б[эеé]-вокер)(?=$|[\s.,!?;:"»)—\]])/gi, '$1бабóкер');

  // 3. «בְּבַקָּשָׁה» (бэвакашá): ударение строго на последний слог
  res = res.replace(/(^|[\s"«(—\[])бэвакаша(?=$|[\s.,!?;:"»)—\]])/gi, '$1бэвакашá');

  // 4. «תּוֹדָה רַבָּה» (тодá рабá): ударение на последний слог рабá (не рáба)
  res = res.replace(/(^|[\s"«(—\[])(?:тод[аá]\s+)?рáба(?=$|[\s.,!?;:"»)—\]])/gi, (match) => {
    return match.replace(/рáба/i, 'рабá');
  });

  // 5. Защита от частых фонетических галлюцинаций LLM при транскрипции
  // «בַּדִּירָה» -> «ба-дирá» (нейросеть часто генерирует искажённое «бадара»)
  res = res.replace(/(^|[\s"«(—\[])(?:бад[аá]ра|ба-д[аá]ра)(?=$|[\s.,!?;:"»)—\]])/gi, '$1ба-дирá');
  // «עֶזְרָה» -> «эзрá» (нейросеть часто подставляет ашкеназское «эзрэ»)
  res = res.replace(/(^|[\s"«(—\[])эзр[эеé](?=$|[\s.,!?;:"»)—\]])/gi, '$1эзрá');
  // «מְאוֹד» -> «мэóд» (нейросеть ошибочно читает шва как «а»: «маод»)
  res = res.replace(/(^|[\s"«(—\[])м[аá]од(?=$|[\s.,!?;:"»)—\]])/gi, '$1мэóд');
  // «הַכֹּל» -> «hакóль» (нейросеть пишет «хакол» без 'h' и без мягкого знака)
  res = res.replace(/(^|[\s"«(—\[])х[аá]-?к[оо́]л(?=$|[\s.,!?;:"»)—\]])/gi, '$1hакóль');
  // «בְּמַשֶּׁהוּ» -> «бэ-мáшеhу»
  res = res.replace(/(^|[\s"«(—\[])(?:б[эе]м[аá]шеу|б[эе]-м[аá]шеу)(?=$|[\s.,!?;:"»)—\]])/gi, '$1бэ-мáшеhу');
  // «צָרִיךְ» -> «царӣх»
  res = res.replace(/(^|[\s"«(—\[])цар[ии́]х(?=$|[\s.,!?;:"»)—\]])/gi, '$1царӣх');

  return res;
}

/**
 * Автоматическая генерация русской фонетической транскрипции из огласованного иврита (ניקוד)
 */
export function generateHebrewTranscription(text: string): string {
  if (!text) return '';
  // Проверяем: есть ли в тексте знаки огласовок (ניקוד).
  // Без никуда фонетическую транскрипцию построить невозможно:
  // отсутствие гласных приведёт к бессмысленной консонантной каше (ב -> в, ו -> в, ת -> т => «ввкр твв»).
  if (!/[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/.test(text)) {
    return '';
  }

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
        else if (char === 'ה') {
          const isRemainingOnlyPunctuation = !/[\u0590-\u05FF]/.test(w.slice(nextIdx));
          consonant =
            (i === w.length - 1 || nextIdx === w.length || isRemainingOnlyPunctuation) && !dagesh ? '' : 'h';
        }
        else if (char === 'ו') {
          if (i === 0 && dagesh && nextIdx < w.length) {
            // Союз «וּ» (шурук) в начале слова перед שווא и согласными בומ״פ: нормативное произношение «у-»
            consonant = 'у-';
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

/**
 * Преобразование латинской транслитерации иврита (например, "shalom boker tov")
 * в каноническую русскоязычную транскрипцию по стандарту ульпана (буква 'h' для ה).
 */
export function convertLatinHebrewTranscriptionToCyrillic(text: string): string {
  if (!text) return '';

  let s = text;

  // Многобуквенные сочетания
  s = s.replace(/sh/gi, 'ш');
  s = s.replace(/kh/gi, 'х');
  s = s.replace(/ch/gi, 'х');
  s = s.replace(/tz/gi, 'ц');
  s = s.replace(/ts/gi, 'ц');
  s = s.replace(/zh/gi, 'ж');
  s = s.replace(/ee/gi, 'и');
  s = s.replace(/oo/gi, 'у');

  // Гласные и дифтонги с y
  s = s.replace(/ya/gi, 'я');
  s = s.replace(/ye/gi, 'е');
  s = s.replace(/yo/gi, 'йо');
  s = s.replace(/yu/gi, 'ю');

  // Мягкое 'c' перед e, i, y и их акцентированными формами
  s = s.replace(/c(?=[eiyéíēī])/gi, (m) => (m === 'C' ? 'С' : 'с'));

  // Отдельные буквы и акцентированные латинские гласные
  const singleCharMap: Record<string, string> = {
    'b': 'б', 'B': 'Б',
    'v': 'в', 'V': 'В',
    'g': 'г', 'G': 'Г',
    'd': 'д', 'D': 'Д',
    'z': 'з', 'Z': 'З',
    'k': 'к', 'K': 'К',
    'l': 'л', 'L': 'Л',
    'm': 'м', 'M': 'М',
    'n': 'н', 'N': 'Н',
    's': 'с', 'S': 'С',
    'p': 'п', 'P': 'П',
    'f': 'ф', 'F': 'Ф',
    't': 'т', 'T': 'Т',
    'r': 'р', 'R': 'Р',
    'y': 'й', 'Y': 'Й',
    'a': 'а', 'A': 'А',
    'e': 'э', 'E': 'Э',
    'i': 'и', 'I': 'И',
    'o': 'о', 'O': 'О',
    'u': 'у', 'U': 'У',
    'w': 'в', 'W': 'В',
    'c': 'к', 'C': 'К',
    'j': 'дж', 'J': 'Дж',
    'q': 'к', 'Q': 'К',
    'x': 'кс', 'X': 'Кс',
    'á': 'а́', 'Á': 'А́',
    'é': 'е́', 'É': 'Е́',
    'í': 'ӣ', 'Í': 'Ӣ',
    'ó': 'о́', 'Ó': 'О́',
    'ú': 'ӯ', 'Ú': 'Ӯ',
    'ā': 'а', 'Ā': 'А',
    'ē': 'э', 'Ē': 'Э',
    'ī': 'ӣ', 'Ī': 'Ӣ',
    'ō': 'о', 'Ō': 'О',
    'ū': 'ӯ', 'Ū': 'Ӯ',
  };

  // Букву 'h' сохраняем как 'h' по стандарту ульпана (легкий выдох)
  s = s.replace(/[a-gi-zA-GI-Z]/g, (ch) => singleCharMap[ch] || ch);

  return normalizeTranscription(s);
}

/**
 * Канонические кириллические транскрипции ключевых слов и корней для верификации вывода LLM
 */
const CANONICAL_WORDS: Record<string, string> = {
  'דירה': 'дирá',
  'בדירה': 'ба-дирá',
  'מדירה': 'ми-дирá',
  'לדירה': 'ла-дирá',
  'עזרה': 'эзрá',
  'בעזרה': 'бэ-эзрá',
  'מאוד': 'мэóд',
  'הכל': 'hакóль',
  'בסדר': 'бэсэ́дер',
  'שלום': 'шалóм',
  'בוקר': 'бóкер',
  'ערב': 'э́рев',
  'טוב': 'тов',
  'תודה': 'тодá',
  'רבה': 'рабá',
  'בבקשה': 'бэвакашá',
  'נעים': 'наӣм',
  'יופי': 'йóфи',
  'סליחה': 'слихá',
  'להתראות': 'лэhитраóт',
  'ביי': 'бай',
  'איך': 'эйх',
  'קוראים': 'коръӣм',
  'לך': 'лэхá',
  'לי': 'ли',
  'שם': 'шем',
  'צריך': 'царӣх',
  'צריכה': 'црихá',
  'משהו': 'мáшеhу',
  'במשהו': 'бэ-мáшеhу',
  'רוצה': 'роцэ́',
  'ארבע': 'арбá',
  'חמש': 'хамéш',
  'שלוש': 'шалóш',
  'שתיים': 'штáим',
  'אחת': 'ахáт',
  'גר': 'гар',
  'גרה': 'гарá',
  'איפה': 'э́йфо',
  'באיזו': 'бэ-э́зо',
  'איזו': 'э́зо',
};

/**
 * Валидация и защита от галлюцинаций транскрипции от LLM (например, «бадара» вместо «ба-дира», «эзрэ» вместо «эзра»).
 * Сопоставляет транскрипцию с огласованным текстом на иврите и исправляет искаженные токены.
 */
export function validateAndCorrectHebrewTranscription(
  transcription: string,
  hebrewText?: string
): string {
  if (!transcription) {
    return hebrewText ? generateHebrewTranscription(hebrewText) : '';
  }

  const normalized = normalizeTranscription(transcription);
  if (!hebrewText || !/[\u0590-\u05FF]/.test(hebrewText)) {
    return normalized;
  }

  const hWords = hebrewText.trim().split(/\s+/);
  const tWords = normalized.trim().split(/\s+/);

  if (hWords.length === tWords.length) {
    const corrected = tWords.map((tWord, idx) => {
      const hWord = hWords[idx];
      const cleanH = stripNikkud(hWord).replace(/^[.,!?;:"'״׳()[\]{}—\-]+|[.,!?;:"'״׳()[\]{}—\-]+$/g, '');
      const leadMatch = tWord.match(/^[.,!?;:"'״׳()[\]{}—\-]+/);
      const trailMatch = tWord.match(/[.,!?;:"'״׳()[\]{}—\-]+$/);
      const lead = leadMatch ? leadMatch[0] : '';
      const trail = trailMatch ? trailMatch[0] : '';

      const plainKey = cleanH.toLowerCase();
      if (CANONICAL_WORDS[plainKey]) {
        return `${lead}${CANONICAL_WORDS[plainKey]}${trail}`;
      }

      // Если в огласованном слове есть хирик (ִ), а модель в транскрипции потеряла звук [и/i] (напр. «бадара» вместо «дира»)
      const cleanT = tWord.replace(/[.,!?;:"'״׳()[\]{}—\-]+/g, '').toLowerCase().replace(/[\u0300-\u036f]/g, '');
      if (/[\u05b4]/.test(hWord) && !/[иӣií]/i.test(cleanT)) {
        const generated = generateHebrewTranscription(hWord);
        if (generated) return `${lead}${generated}${trail}`;
      }

      return tWord;
    });

    return corrected.join(' ');
  }

  return normalized;
}

/**
 * Гарантирует, что транскрипция написана на русской кириллице (с 'h' для ה),
 * защищена от галлюцинаций LLM и согласована со стандартом ульпана.
 */
export function ensureCyrillicHebrewTranscription(
  transcription: string,
  hebrewText?: string
): string {
  if (!transcription && !hebrewText) return '';

  // Если транскрипции нет, генерируем из огласованного иврита
  if (!transcription && hebrewText) {
    return validateAndCorrectHebrewTranscription(generateHebrewTranscription(hebrewText), hebrewText);
  }

  // Проверяем наличие латинских букв (кроме допустимой буквы 'h'/'H' для ה)
  const hasLatinLetters = /[a-gi-zA-GI-Z]/.test(transcription);

  let cyrillic = transcription;
  if (hasLatinLetters) {
    if (hebrewText && /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/.test(hebrewText)) {
      const generated = generateHebrewTranscription(hebrewText);
      if (generated && generated.length >= 3) {
        return validateAndCorrectHebrewTranscription(generated, hebrewText);
      }
    }
    cyrillic = convertLatinHebrewTranscriptionToCyrillic(transcription);
  }

  return validateAndCorrectHebrewTranscription(cyrillic, hebrewText);
}

