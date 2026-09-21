/**
 * Pealim Master Dictionary Fetcher & Root Family Builder
 *
 * Downloads and verifies words, verb conjugations, and root families
 * from Pealim.com into a local master dictionary (src/data/pealimMasterDictionary.json).
 *
 * Usage:
 *   node scripts/fetch_pealim_dictionary.cjs --verbs-only
 *   node scripts/fetch_pealim_dictionary.cjs --all
 *   node scripts/fetch_pealim_dictionary.cjs --limit 10
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const outputFile = path.join(repoRoot, 'src/data/pealimMasterDictionary.json');
const catalogIndexFile = path.join(repoRoot, 'src/data/pealimCatalogIndex.json');

function safeWriteJson(filepath, data, retries = 5) {
  const tmpFile = `${filepath}.tmp`;
  const str = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  for (let i = 0; i < retries; i++) {
    try {
      fs.writeFileSync(tmpFile, str, 'utf8');
      try {
        fs.renameSync(tmpFile, filepath);
      } catch (renameErr) {
        fs.copyFileSync(tmpFile, filepath);
        try { fs.unlinkSync(tmpFile); } catch {}
      }
      return;
    } catch (err) {
      if (i === retries - 1) {
        console.warn(`\n[safeWriteJson] Warning writing ${filepath}: ${err.message}. Continuing...`);
        return;
      }
      const start = Date.now();
      while (Date.now() - start < 500) {}
    }
  }
}

function cleanText(html) {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#128266;/g, '') // speaker icon
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripNikkud(text) {
  if (!text) return '';
  return text.replace(/[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/g, '');
}

// Convert Pealim Latin transcription (e.g. "lehamlíts", "hамлац<b>а</b>") to project Cyrillic standard ("леhамлӣц")
function pealimTransToCyrillic(text) {
  if (!text) return '';
  let s = text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#128266;/g, '') // speaker icon
    .trim();

  // Strip bold tags (Pealim marks stress with <b>) without inserting spaces!
  s = s.replace(/<\/?b>/gi, '');
  // Strip any remaining html tags
  s = s.replace(/<[^>]+>/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();

  // Multi-char combinations
  s = s.replace(/sh/gi, 'ш');
  s = s.replace(/kh/gi, 'х');
  s = s.replace(/ch/gi, 'х');
  s = s.replace(/tz/gi, 'ц');
  s = s.replace(/ts/gi, 'ц');
  s = s.replace(/zh/gi, 'ж');
  s = s.replace(/ee/gi, 'ӣ');
  s = s.replace(/oo/gi, 'ӯ');

  s = s.replace(/ya/gi, 'я');
  s = s.replace(/ye/gi, 'е');
  s = s.replace(/yo/gi, 'йо');
  s = s.replace(/yu/gi, 'ю');

  s = s.replace(/c(?=[eiyéíēī])/gi, (m) => (m === 'C' ? 'С' : 'с'));

  const charMap = {
    'b': 'б', 'B': 'Б', 'v': 'в', 'V': 'В', 'g': 'г', 'G': 'Г',
    'd': 'д', 'D': 'Д', 'z': 'з', 'Z': 'З', 'k': 'к', 'K': 'К',
    'l': 'л', 'L': 'Л', 'm': 'м', 'M': 'М', 'n': 'н', 'N': 'Н',
    's': 'с', 'S': 'С', 'p': 'п', 'P': 'П', 'f': 'ф', 'F': 'Ф',
    't': 'т', 'T': 'Т', 'r': 'р', 'R': 'Р', 'y': 'й', 'Y': 'Й',
    'a': 'а', 'A': 'А', 'e': 'э', 'E': 'Э', 'i': 'и', 'I': 'И',
    'o': 'о', 'O': 'О', 'u': 'у', 'U': 'У', 'w': 'в', 'W': 'В',
    'c': 'к', 'C': 'К', 'j': 'дж', 'J': 'Дж', 'q': 'к', 'Q': 'К',
    'x': 'кс', 'X': 'Кс',
    'á': 'а́', 'Á': 'А́', 'é': 'е́', 'É': 'Е́', 'í': 'ӣ', 'Í': 'Ӣ',
    'ó': 'о́', 'Ó': 'О́', 'ú': 'ӯ', 'Ú': 'Ӯ',
    'ā': 'а', 'Ā': 'А', 'ē': 'э', 'Ē': 'Э', 'ī': 'ӣ', 'Ī': 'Ӣ',
    'ō': 'о', 'Ō': 'О', 'ū': 'ӯ', 'Ū': 'Ӯ',
  };

  s = s.replace(/[a-gi-zA-GI-Z\u00C0-\u024F]/g, (ch) => charMap[ch] || ch);
  return s.replace(/\s+/g, ' ').trim();
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });
      if (res.status === 429) {
        console.warn('Rate limit hit (429). Waiting 5s...');
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

// Extract word data from Pealim page using description + tables
function parsePealimHtml(html, dictPath) {
  const metaMatch = html.match(/<meta content="([^"]+)" property="og:description">/i) ||
                    html.match(/<meta name="description" content="([^"]+)">/i);
  const metaRaw = metaMatch ? metaMatch[1] : '';
  const metaClean = cleanText(metaRaw);

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
  const titleClean = titleMatch ? cleanText(titleMatch[1]) : '';
  const titleParts = titleClean.split('–').map((s) => s.trim());
  const headword = titleParts[0] || '';
  const translation = titleParts[1] || '';

  // Parse structured description
  const parts = metaClean.split('|').map((s) => s.trim());
  const header = parts[0] || '';

  let partOfSpeech = 'other';
  let binyan = null;
  let gender = null;

  if (header.startsWith('Глагол')) {
    partOfSpeech = 'verb';
    const m = header.match(/(ПААЛЬ|ПИЭЛЬ|hИФЪИЛЬ|hИТПАЭЛЬ|НИФЪАЛЬ|ПУАЛЬ|hУФЪАЛЬ)/i);
    if (m) binyan = m[1];
  } else if (header.startsWith('Существительное')) {
    partOfSpeech = 'noun';
    if (header.includes('мужской род')) gender = 'm';
    if (header.includes('женский род')) gender = 'f';
  } else if (header.startsWith('Прилагательное')) {
    partOfSpeech = 'adjective';
  } else if (header.startsWith('Предлог')) {
    partOfSpeech = 'preposition';
  } else if (header.startsWith('Числительное')) {
    partOfSpeech = 'numeral';
  }

  let root = null;
  let pointed = null;
  let transcription = null;
  let plural = null;
  let ktivMalePlain = null;

  function parseFormAndTranscription(text) {
    let pForm = '';
    let km = '';
    let tr = '';
    const clean = text.trim();
    // Pattern 1: pointed ~ ktivMale transcription (e.g. "בֹּקֶר ~ בוקר бокер")
    const tildeMatch = clean.match(/^([^\s]+)\s*~[=\s]*([א-ת\u0590-\u05FF]+)\s+(.*)$/);
    if (tildeMatch) {
      pForm = tildeMatch[1];
      km = tildeMatch[2];
      tr = tildeMatch[3];
    } else {
      const parenMatch = clean.match(/^([^\s]+)\s*\([~=]?\s*([א-ת]+)\)\s*(.*)$/);
      if (parenMatch) {
        pForm = parenMatch[1];
        km = parenMatch[2];
        tr = parenMatch[3];
      } else {
        const simpleMatch = clean.match(/^([^\s]+)\s+(.*)$/);
        if (simpleMatch) {
          pForm = simpleMatch[1];
          tr = simpleMatch[2];
        } else {
          pForm = clean;
        }
      }
    }
    return { pointed: pForm, ktivMale: km, transcription: pealimTransToCyrillic(tr) };
  }

  for (const p of parts) {
    if (p.startsWith('Корень:')) {
      const rawRoot = p.replace('Корень:', '').trim();
      // Only keep Hebrew letters, dashes, and nikud
      const rootMatch = rawRoot.match(/^([א-ת\u0590-\u05FF\s\-]+)/);
      root = rootMatch ? rootMatch[1].trim().replace(/\s+/g, '-').replace(/-+/g, '-') : rawRoot;
    } else if (p.startsWith('Единственное число:') && !p.includes('сопряженное')) {
      const parsed = parseFormAndTranscription(p.replace('Единственное число:', ''));
      pointed = parsed.pointed;
      if (parsed.ktivMale) ktivMalePlain = parsed.ktivMale;
      transcription = parsed.transcription;
    } else if (p.startsWith('Инфинитив:')) {
      const parsed = parseFormAndTranscription(p.replace('Инфинитив:', ''));
      pointed = parsed.pointed;
      if (parsed.ktivMale) ktivMalePlain = parsed.ktivMale;
      transcription = parsed.transcription;
    } else if (p.startsWith('Множественное число:') && !p.includes('сопряженное')) {
      const parsed = parseFormAndTranscription(p.replace('Множественное число:', ''));
      plural = parsed.pointed + (parsed.transcription ? ' ' + parsed.transcription : '');
    }
  }

  if (!pointed) pointed = headword;
  if (!transcription) {
    const tMatch = html.match(/<div class="transcription">([\s\S]*?)<\/div>/i);
    if (tMatch) transcription = pealimTransToCyrillic(tMatch[1]);
  }

  const plain = ktivMalePlain || stripNikkud(pointed) || headword;

  // Root Family (Related words table: class="table table-hover dict-table-t")
  const rootFamily = [];
  const relatedRows = [...html.matchAll(/<tr[^>]*onclick="javascript:window\.document\.location=(?:&quot;|'|")([^"&']+)(?:&quot;|'|")"[\s\S]*?<\/tr>/gi)];
  for (const r of relatedRows) {
    const rowHtml = r[0];
    const lemmaMatch = rowHtml.match(/<span class="menukad">([\s\S]*?)<\/span>/i);
    const rowTransMatch = rowHtml.match(/<span class="dict-transcription">([\s\S]*?)<\/span>/i);
    const tds = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
    const lemma = lemmaMatch ? cleanText(lemmaMatch[1]) : '';
    const trans = rowTransMatch ? pealimTransToCyrillic(rowTransMatch[1]) : '';
    const posText = tds[2] ? cleanText(tds[2][1]) : '';
    const meaning = tds[3] ? cleanText(tds[3][1]) : (rowHtml.match(/<td[^>]*class="dict-meaning"[^>]*>([\s\S]*?)<\/td>/i)?.[1] || '');

    if (lemma && meaning && stripNikkud(lemma) !== plain) {
      let rPos = 'other';
      if (posText.includes('Существительное')) rPos = 'noun';
      else if (posText.includes('Прилагательное')) rPos = 'adjective';
      else if (posText.includes('Глагол')) rPos = 'verb';

      rootFamily.push({
        hebrew: lemma,
        hebrewPlain: stripNikkud(lemma),
        transcription: trans,
        translation: meaning,
        partOfSpeech: rPos,
      });
    }
  }

  // Conjugation table (for verbs)
  let conjugation = null;
  if (partOfSpeech === 'verb') {
    const pronounsMap = {
      'AP-ms': 'זָכָר יָחִיד (он / я / ты)',
      'AP-fs': 'נְקֵבָה יְחִידָה (она / я / ты)',
      'AP-mp': 'זָכָר רַבִּים (они / мы / вы)',
      'AP-fp': 'נְקֵבָה רַבּוֹת (они / мы / вы)',

      'PERF-1s': 'אֲנִי (я)',
      'PERF-2ms': 'אַתָּה (ты м.р.)',
      'PERF-2fs': 'אַתְּ (ты ж.р.)',
      'PERF-3ms': 'הוּא (он)',
      'PERF-3fs': 'הִיא (она)',
      'PERF-1p': 'אֲנַחְנוּ (мы)',
      'PERF-2mp': 'אַתֶּם (вы м.р.)',
      'PERF-2fp': 'אַתֶּן (вы ж.р.)',
      'PERF-3p': 'הֵם / הֵן (они)',

      'IMPF-1s': 'אֲנִי (я)',
      'IMPF-2ms': 'אַתָּה (ты м.р.)',
      'IMPF-2fs': 'אַתְּ (ты ж.р.)',
      'IMPF-3ms': 'הוּא (он)',
      'IMPF-3fs': 'הִיא (она)',
      'IMPF-1p': 'אֲנַחְנוּ (мы)',
      'IMPF-2mp': 'אַתֶּם (вы м.р.)',
      'IMPF-2fp': 'אַתֶּן (вы ж.р.)',
      'IMPF-3mp': 'הֵם (они м.р.)',
      'IMPF-3fp': 'הֵן (они ж.р.)',

      'IMP-2ms': 'אַתָּה (м.р.)',
      'IMP-2fs': 'אַתְּ (ж.р.)',
      'IMP-2mp': 'אַתֶּם (м.р. мн.ч.)',
      'IMP-2fp': 'אַתֶּן (ж.р. мн.ч.)',
    };

    const present = [];
    const past = [];
    const future = [];
    const imperative = [];

    for (const [id, pronoun] of Object.entries(pronounsMap)) {
      const cellRegex = new RegExp(`<div[^>]*id="${id}"[\\s\\S]*?<\\/td>`, 'i');
      const cellMatch = html.match(cellRegex);
      if (cellMatch) {
        const cellHtml = cellMatch[0];
        const hebM = cellHtml.match(/<span class="menukad">([\s\S]*?)<\/span>/i);
        const trM = cellHtml.match(/<div class="transcription">([\s\S]*?)<\/div>/i);
        if (hebM) {
          const fHeb = cleanText(hebM[1]).replace(/&rlm;/g, '').replace(/!/g, '').trim();
          const fTrans = trM ? pealimTransToCyrillic(trM[1]) : '';
          const entry = { pronoun, hebrew: fHeb, transcription: fTrans, translation: '' };

          if (id.startsWith('AP-')) present.push(entry);
          else if (id.startsWith('PERF-')) past.push(entry);
          else if (id.startsWith('IMPF-')) future.push(entry);
          else if (id.startsWith('IMP-')) imperative.push(entry);
        }
      }
    }

    conjugation = {
      infinitive: { hebrew: pointed, transcription, translation },
      binyan: binyan || 'Пааль',
      root: root || '',
      present,
      past,
      future,
      imperative,
      rootFamily,
    };
  }

  const audioMatch = html.match(/class="audio-play"[^>]*data-audio="([^"]+)"/i);
  const audio = audioMatch ? audioMatch[1] : null;

  return {
    hebrew: pointed,
    hebrewPlain: plain,
    translation,
    transcription,
    partOfSpeech,
    root,
    binyan,
    gender,
    plural,
    rootFamily: rootFamily.slice(0, 15),
    conjugation,
    pealimPath: dictPath,
    audio,
  };
}

async function searchPealimSingle(query, courseTranslation, posHint) {
  const searchUrl = `https://www.pealim.com/ru/search/?q=${encodeURIComponent(query)}`;
  const searchHtml = await fetchWithRetry(searchUrl);

  const results = [];
  const blocks = [...searchHtml.matchAll(/<div class="verb-search-result"[^>]*onclick="javascript:window\.document\.location=&quot;(\/ru\/dict\/\d+-[^\/"]+\/)&quot;"[\s\S]*?(?=<div class="verb-search-result"|$)/gi)];

  for (const b of blocks) {
    const url = b[1];
    const blockHtml = b[0];
    const lemmaMatch = blockHtml.match(/<div class="verb-search-lemma">[\s\S]*?<span class="menukad">([\s\S]*?)<\/span>/i);
    const lemma = lemmaMatch ? cleanText(lemmaMatch[1]) : '';
    const meaningMatch = blockHtml.match(/<div class="verb-search-meaning">([\s\S]*?)<\/div>/i);
    const meaning = meaningMatch ? cleanText(meaningMatch[1]) : '';
    const posMatch = blockHtml.match(/<div class="badge[^"]*">([\s\S]*?)<\/div>/i);
    const pos = posMatch ? cleanText(posMatch[1]) : '';

    results.push({ url, lemma, plainLemma: stripNikkud(lemma), meaning, pos });
  }

  if (results.length === 0) {
    const fallbackMatch = searchHtml.match(/\/ru\/dict\/(\d+-[^\/"]+)\//i);
    if (fallbackMatch) return `/ru/dict/${fallbackMatch[1]}/`;
    return null;
  }

  // Score candidates
  const scored = results.map((r) => {
    let score = 0;
    const candLemma = r.plainLemma;
    const candMeaning = (r.meaning || '').toLowerCase();
    const trans = (courseTranslation || '').toLowerCase();

    // 1. Lemma match
    if (candLemma === query) score += 100;
    else if (candLemma.startsWith(query) || query.startsWith(candLemma)) score += 30;

    // 2. Meaning / translation overlap
    const transWords = trans.split(/[\s,;().-]+/).filter((w) => w.length >= 3);
    for (const tw of transWords) {
      if (candMeaning.includes(tw)) score += 40;
    }

    // 3. Part of speech alignment
    if (posHint && r.pos) {
      if (posHint === 'verb' && r.pos.includes('Глагол')) score += 50;
      if (posHint === 'noun' && r.pos.includes('Существительное')) score += 50;
      if (posHint === 'adjective' && r.pos.includes('Прилагательное')) score += 50;
    }

    return { ...r, score };
  });

  scored.sort((a, b) => b.score - a.score);

  if (scored.length > 0 && scored[0].score > 0) {
    return scored[0].url;
  }

  return results[0].url;
}

async function searchPealim(cleanWord, courseTranslation, posHint) {
  let url = await searchPealimSingle(cleanWord, courseTranslation, posHint);
  if (!url && cleanWord.includes(' ')) {
    const firstWord = cleanWord.split(/\s+/)[0];
    url = await searchPealimSingle(firstWord, courseTranslation, posHint);
  }
  return url;
}

function collectAllCourseWords() {
  const wordsMap = new Map();

  // Lessons 1-100
  const lessonsDir = path.join(repoRoot, 'src/data/lessons');
  const files = fs.readdirSync(lessonsDir).filter((f) => f.endsWith('.ts'));
  for (const f of files) {
    const content = fs.readFileSync(path.join(lessonsDir, f), 'utf8');
    const matches = content.matchAll(/"hebrew":\s*"([^"]+)",\s*"hebrewPlain":\s*"([^"]+)",\s*"transcription":\s*"([^"]+)",\s*"translation":\s*"([^"]+)"(?:,\s*"partOfSpeech":\s*"([^"]+)")?/g);
    for (const m of matches) {
      const pointed = m[1].trim();
      const plain = m[2].trim();
      const trans = m[3].trim();
      const transl = m[4].trim();
      const pos = m[5] ? m[5].trim() : 'other';
      if (plain && !wordsMap.has(plain)) {
        wordsMap.set(plain, { hebrew: pointed, hebrewPlain: plain, transcription: trans, translation: transl, partOfSpeech: pos });
      }
    }
  }

  // Decks
  const deckDirs = [
    path.join(repoRoot, 'src/data/thematicDecks'),
    path.join(repoRoot, 'src/data/professionalDecks'),
  ];
  for (const dDir of deckDirs) {
    if (!fs.existsSync(dDir)) continue;
    const dFiles = fs.readdirSync(dDir).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
    for (const df of dFiles) {
      const content = fs.readFileSync(path.join(dDir, df), 'utf8');
      const matches = content.matchAll(/hebrew:\s*'([^']+)',\s*hebrewPlain:\s*'([^']+)',\s*transcription:\s*'([^']+)',\s*translation:\s*'([^']+)'(?:,\s*partOfSpeech:\s*'([^']+)')?/g);
      for (const m of matches) {
        const pointed = m[1].trim();
        const plain = m[2].trim();
        const trans = m[3].trim();
        const transl = m[4].trim();
        const pos = m[5] ? m[5].trim() : 'other';
        if (plain && !wordsMap.has(plain)) {
          wordsMap.set(plain, { hebrew: pointed, hebrewPlain: plain, transcription: trans, translation: transl, partOfSpeech: pos });
        }
      }
    }
  }

  return Array.from(wordsMap.values());
}

const MULTI_WORD_TRANSCRIPTION_FIXES = {
  'ארוחת בוקר': 'арухат бокер',
  'ארוחת ערב': 'арухат эрев',
  'בית ספר': 'бейт сефер',
  'בית גידול': 'бейт гидуль',
  'בית זיקוק': 'бейт зикук',
  'בית כנסת': 'бейт кнесет',
  'חדר אוכל': 'хедер охель',
  'חדר אמבטיה': 'хедер амбатъя',
  'חדר כושר': 'хадар кошер',
  'חדר שינה': 'хадар шена',
  'ארוחת צוהריים': 'арухат цоhорайим',
  'ארוחת צהריים': 'арухат цоhорайим',
  'בשר בקר': 'бсар бакар',
  'משקפי שמש': 'мишкефей шемеш',
  'ראשי תיבות': 'рашей тевот',
  'על פני': 'аль пней',
  'רב עוצמה': 'рав оцма',
  'אומנות לחימה': 'оманут лехима',
  'אמנות לחימה': 'оманут лехима',
  'כן ציור': 'кан циюр',
  'נטילת ידיים': 'нетилат ядайим',
  'על יד': 'аль яд',
  'על ידי': 'аль йедей',
  'על גב': 'аль гав',
  'על גבי': 'аль габей',
  'חסר רסן': 'хасар ресен',
  'חסר תועלת': 'хасар тоэлет',
  'קוצר ראייה': 'коцер реия',
  'קוצר ראיה': 'коцер реия'
};

function cleanTranscriptionArtifacts(hebrew, transcription) {
  if (!hebrew || !transcription) return transcription;
  const cleanHeb = stripNikkud(hebrew).trim();
  if (MULTI_WORD_TRANSCRIPTION_FIXES[cleanHeb]) {
    return MULTI_WORD_TRANSCRIPTION_FIXES[cleanHeb];
  }
  // If single word without spaces, slashes, or hyphens, remove internal artifact spaces
  if (!cleanHeb.includes(' ') && !cleanHeb.includes('/') && !cleanHeb.includes('-')) {
    if (transcription.includes(' ')) {
      return transcription.replace(/\s+/g, '');
    }
  }
  return transcription;
}

function normalizeTranscriptionSpaces(save = true) {
  if (!fs.existsSync(outputFile)) {
    console.error(`Файл ${outputFile} не найден!`);
    return 0;
  }
  console.log(`Нормализация транскрипций в ${outputFile}...`);
  const masterDict = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  let fixedCount = 0;

  for (const [k, v] of Object.entries(masterDict)) {
    const fixedRootTr = cleanTranscriptionArtifacts(v.hebrew, v.transcription);
    if (fixedRootTr !== v.transcription) {
      v.transcription = fixedRootTr;
      fixedCount++;
    }
    if (Array.isArray(v.rootFamily)) {
      for (const rf of v.rootFamily) {
        const fixedRfTr = cleanTranscriptionArtifacts(rf.hebrew, rf.transcription);
        if (fixedRfTr !== rf.transcription) {
          rf.transcription = fixedRfTr;
          fixedCount++;
        }
      }
    }
    if (v.conjugation) {
      for (const tense of ['present', 'past', 'future', 'imperative']) {
        if (Array.isArray(v.conjugation[tense])) {
          for (const item of v.conjugation[tense]) {
            const fixedConjTr = cleanTranscriptionArtifacts(item.hebrew, item.transcription);
            if (fixedConjTr !== item.transcription) {
              item.transcription = fixedConjTr;
              fixedCount++;
            }
          }
        }
      }
    }
  }

  if (save && fixedCount > 0) {
    fs.writeFileSync(outputFile, JSON.stringify(masterDict, null, 2), 'utf8');
    console.log(`[normalize] Успешно исправлено ${fixedCount} транскрипций в ${outputFile}`);
  } else {
    console.log(`[normalize] Все транскрипции уже в норме (${fixedCount} изменений).`);
  }
  return fixedCount;
}

function syncVerbDatabase() {
  normalizeTranscriptionSpaces(true);
  const dbPath = path.join(repoRoot, 'src/lib/verbConjugations/database.ts');
  const masterDict = JSON.parse(fs.readFileSync(outputFile, 'utf8'));

  const verbsMap = new Map();
  for (const [k, v] of Object.entries(masterDict)) {
    if (v.conjugation && v.conjugation.present && v.conjugation.present.length > 0) {
      const conj = {
        infinitive: v.conjugation.infinitive || {
          hebrew: v.hebrew,
          transcription: v.transcription,
          translation: v.translation,
        },
        binyan: v.conjugation.binyan || v.binyan || '',
        root: v.conjugation.root || v.root || '',
        present: v.conjugation.present || [],
        past: v.conjugation.past || [],
        future: v.conjugation.future || [],
        imperative: v.conjugation.imperative || [],
        rootFamily: (v.rootFamily && v.rootFamily.length > 0) ? v.rootFamily : (v.conjugation.rootFamily || []),
      };

      // Always index by clean infinitive
      if (conj.infinitive && conj.infinitive.hebrew) {
        const infPlain = stripNikkud(conj.infinitive.hebrew);
        if (infPlain) verbsMap.set(infPlain, conj);
      }

      // Also index by single-word key if it's a verb infinitive starting with 'ל'
      if (!k.includes(' ') && k.startsWith('ל')) {
        verbsMap.set(k, conj);
      }
    }
  }

  let out = `/**
 * AUTO-GENERATED FILE FROM src/data/pealimMasterDictionary.json
 * DO NOT EDIT MANUALLY! Any manual edits will be lost.
 * Run: node scripts/fetch_pealim_dictionary.cjs --sync-db
 */

import { VerbConjugation } from '@/types';

export const VERB_CONJUGATIONS_DATABASE: Record<string, VerbConjugation> = {\n`;

  function formatList(arr) {
    if (!arr || arr.length === 0) return '[]';
    const items = arr.map((item) => '      ' + JSON.stringify(item)).join(',\n');
    return `[\n${items}\n    ]`;
  }

  for (const [k, conj] of verbsMap.entries()) {
    out += `  ${JSON.stringify(k)}: {\n`;
    out += `    infinitive: ${JSON.stringify(conj.infinitive)},\n`;
    out += `    binyan: ${JSON.stringify(conj.binyan)},\n`;
    out += `    root: ${JSON.stringify(conj.root)},\n`;
    out += `    present: ${formatList(conj.present)},\n`;
    out += `    past: ${formatList(conj.past)},\n`;
    out += `    future: ${formatList(conj.future)},\n`;
    out += `    imperative: ${formatList(conj.imperative)},\n`;
    out += `    rootFamily: ${formatList(conj.rootFamily)}\n`;
    out += `  },\n`;
  }
  out += `};\n`;

  fs.writeFileSync(dbPath, out, 'utf8');
  console.log(`[sync-db] Успешно сгенерирован ${dbPath} (${verbsMap.size} глаголов).`);
  syncMasterLexicon();
}

function syncMasterLexicon() {
  const masterDict = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  const lexiconPath = path.join(repoRoot, 'src/data/pealimMasterLexicon.json');
  const rootsPath = path.join(repoRoot, 'src/data/pealimRootsIndex.json');

  const lexicon = {};
  const rootIndex = {};

  for (const [key, entry] of Object.entries(masterDict)) {
    const plain = entry.hebrewPlain || stripNikkud(entry.hebrew || key).trim();
    const cleanKey = stripNikkud(key).trim();

    const item = {
      hebrew: entry.hebrew || key,
      hebrewPlain: plain,
      transcription: entry.transcription || '',
      translation: entry.courseTranslation || entry.translation || '',
      partOfSpeech: entry.partOfSpeech || 'other',
      root: entry.root || null,
      binyan: entry.binyan || null,
      gender: entry.gender || null,
      ...(entry.plural ? { plural: entry.plural } : {}),
      ...(entry.audio ? { audio: entry.audio } : {}),
    };

    if (plain) lexicon[plain] = item;
    if (cleanKey) lexicon[cleanKey] = item;
    if (entry.hebrew) {
      lexicon[entry.hebrew] = item;
      lexicon[entry.hebrew.normalize('NFC')] = item;
    }
    if (key) {
      lexicon[key] = item;
      lexicon[key.normalize('NFC')] = item;
    }

    if (entry.root) {
      const cleanRoot = entry.root.replace(/[^א-ת]/g, '');
      if (cleanRoot) {
        if (!rootIndex[cleanRoot]) rootIndex[cleanRoot] = [];
        if (!rootIndex[cleanRoot].includes(plain)) {
          rootIndex[cleanRoot].push(plain);
        }
      }
    }
  }

  safeWriteJson(lexiconPath, JSON.stringify(lexicon));
  safeWriteJson(rootsPath, JSON.stringify(rootIndex));
  console.log(`[sync-lexicon] Успешно сгенерирован ${lexiconPath} (${Object.keys(lexicon).length} ключей) и ${rootsPath} (${Object.keys(rootIndex).length} корней).`);
}

async function fetchCatalogPage(pageNum) {
  const url = `https://www.pealim.com/ru/dict/?page=${pageNum}`;
  const text = await fetchWithRetry(url);
  const rowRegex = /<tr onclick=[\s\S]*?location=(?:&quot;|['\x22])(\/ru\/dict\/(\d+-[^\/]+)\/)(?:&quot;|['\x22])[\s\S]*?<\/tr>/gi;
  let match;
  const items = [];
  while ((match = rowRegex.exec(text)) !== null) {
    const rowHtml = match[0];
    const fullPath = match[1];
    const slug = match[2];
    const id = parseInt(slug.split('-')[0], 10);
    const audioMatch = rowHtml.match(/data-audio=[\x22']([^'\x22]+)[\x22']/);
    const lemmaMatch = rowHtml.match(/<span class=[\x22']menukad[\x22']>([\s\S]*?)<\/span>/);
    const transMatch = rowHtml.match(/<span class=[\x22']dict-transcription[\x22']>([\s\S]*?)<\/span>/);
    const rootMatch = rowHtml.match(/<a href=[\x22']\/ru\/dict\/\?num-radicals=[^>]+>([\s\S]*?)<\/a>/);
    const meaningMatch = rowHtml.match(/<td class=[\x22']dict-meaning[\x22']>([\s\S]*?)<\/td>/);
    const posMatch = rowHtml.match(/<\/td><td>([\s\S]*?)<\/td><td class=[\x22']dict-meaning[\x22']/);

    let rawPos = posMatch ? cleanText(posMatch[1]) : '';
    let partOfSpeech = 'other';
    let binyan = null;
    let gender = null;

    if (/Глагол/i.test(rawPos)) {
      partOfSpeech = 'verb';
      const bm = rawPos.match(/(пааль|пиэль|hифъиль|hитпаэль|нифъаль|пуаль|hуфъаль|hуф'аль)/i);
      if (bm) binyan = bm[1];
    } else if (/Существительное/i.test(rawPos)) {
      partOfSpeech = 'noun';
      if (/мужской/i.test(rawPos)) gender = 'm';
      if (/женский/i.test(rawPos)) gender = 'f';
    } else if (/Прилагательное/i.test(rawPos)) {
      partOfSpeech = 'adjective';
    } else if (/Предлог/i.test(rawPos)) {
      partOfSpeech = 'preposition';
    } else if (/Числительное/i.test(rawPos)) {
      partOfSpeech = 'numeral';
    }

    const pointed = lemmaMatch ? cleanText(lemmaMatch[1]) : '';
    let transcription = '';
    if (transMatch) {
      transcription = transMatch[1]
        .replace(/<b>([^<]+)<\/b>/gi, '$1\u0301')
        .replace(/<[^>]+>/g, '')
        .trim();
    }
    const root = rootMatch ? cleanText(rootMatch[1]).replace(/\s+/g, ' ').trim().replace(/\s*-\s*/g, '-') : null;
    const meaning = meaningMatch ? cleanText(meaningMatch[1]) : '';

    items.push({
      id,
      slug,
      path: fullPath,
      hebrew: pointed,
      hebrewPlain: stripNikkud(pointed),
      transcription,
      audio: audioMatch ? audioMatch[1] : null,
      partOfSpeech,
      binyan,
      gender,
      root,
      meaning,
    });
  }
  return items;
}

async function crawlCatalog(options = {}) {
  const startPage = options.startPage || 1;
  const endPage = options.endPage || 622;
  const concurrency = options.concurrency || 4;
  const delayMs = options.delayMs || 120;
  const force = options.force || false;

  console.log(`\n=== Индексация каталога Pealim (страницы ${startPage}..${endPage}) ===`);

  let catalogMap = new Map();

  if (!force && fs.existsSync(catalogIndexFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(catalogIndexFile, 'utf8'));
      for (const item of existing) {
        catalogMap.set(item.slug, item);
      }
      console.log(`Найден существующий индекс каталога: ${catalogMap.size} слов.`);
      if (catalogMap.size >= 9300 && !options.startPage) {
        console.log(`Каталог уже полностью проиндексирован (${catalogMap.size} слов). Для перезапуска используйте --force.`);
        return Array.from(catalogMap.values()).sort((a, b) => a.id - b.id);
      }
    } catch (e) {
      catalogMap = new Map();
    }
  }

  const pagesToFetch = [];
  for (let p = startPage; p <= endPage; p++) {
    pagesToFetch.push(p);
  }

  let completedPages = 0;
  for (let i = 0; i < pagesToFetch.length; i += concurrency) {
    const batch = pagesToFetch.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (pageNum) => {
        try {
          const items = await fetchCatalogPage(pageNum);
          return { pageNum, items, error: null };
        } catch (err) {
          return { pageNum, items: [], error: err.message };
        }
      })
    );

    for (const res of batchResults) {
      completedPages++;
      if (res.error) {
        console.warn(`\n[Каталог] Стр. ${res.pageNum} ошибка: ${res.error}`);
      } else {
        for (const it of res.items) {
          catalogMap.set(it.slug, it);
        }
      }
    }

    process.stdout.write(`\r[Каталог] Обработано страниц: ${completedPages}/${pagesToFetch.length} | Уникальных слов в индексе: ${catalogMap.size}   `);

    if (completedPages % 20 === 0 || completedPages === pagesToFetch.length) {
      const arr = Array.from(catalogMap.values()).sort((a, b) => a.id - b.id);
      fs.writeFileSync(catalogIndexFile, JSON.stringify(arr, null, 2), 'utf8');
    }

    await new Promise((r) => setTimeout(r, delayMs));
  }

  const finalCatalog = Array.from(catalogMap.values()).sort((a, b) => a.id - b.id);
  fs.writeFileSync(catalogIndexFile, JSON.stringify(finalCatalog, null, 2), 'utf8');

  const verbsCount = finalCatalog.filter((w) => w.partOfSpeech === 'verb').length;
  const nounsCount = finalCatalog.filter((w) => w.partOfSpeech === 'noun').length;
  const adjCount = finalCatalog.filter((w) => w.partOfSpeech === 'adjective').length;
  const rootsCount = new Set(finalCatalog.map((w) => w.root).filter(Boolean)).size;

  console.log(`\n\n=== Индексация каталога завершена! ===`);
  console.log(`Всего слов сохранено: ${finalCatalog.length}`);
  console.log(`Глаголов: ${verbsCount} | Существительных: ${nounsCount} | Прилагательных: ${adjCount}`);
  console.log(`Уникальных корней: ${rootsCount}`);
  console.log(`Файл индекса: ${catalogIndexFile}`);

  return finalCatalog;
}

async function scrapeAllWords(options = {}) {
  const verbsOnly = options.verbsOnly || false;
  const concurrency = options.concurrency || 3;
  const delayMs = options.delayMs || 250;
  const limit = options.limit || Infinity;
  const syncDb = options.syncDb !== false;

  console.log('=== Полная выгрузка базы Pealim ===');

  let catalog = [];
  if (fs.existsSync(catalogIndexFile)) {
    try {
      catalog = JSON.parse(fs.readFileSync(catalogIndexFile, 'utf8'));
    } catch (e) {
      catalog = [];
    }
  }
  if (!catalog || catalog.length < 9000) {
    catalog = await crawlCatalog({ concurrency: 4, delayMs: 120 });
  }

  let masterDict = {};
  if (fs.existsSync(outputFile)) {
    try {
      masterDict = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      console.log(`Загружен существующий мастер-словарь: ${Object.keys(masterDict).length} записей.`);
    } catch (e) {
      masterDict = {};
    }
  }

  // Prepopulate master dictionary with catalog entries if missing
  let initialNew = 0;
  for (const item of catalog) {
    const key = item.hebrewPlain;
    if (!masterDict[key]) {
      masterDict[key] = {
        hebrew: item.hebrew,
        hebrewPlain: item.hebrewPlain,
        transcription: item.transcription,
        translation: item.meaning,
        partOfSpeech: item.partOfSpeech,
        binyan: item.binyan || null,
        gender: item.gender || null,
        root: item.root || null,
        audio: item.audio || null,
        slug: item.slug,
        pealimPath: item.path,
        rootFamily: [],
        conjugation: null,
        source: 'pealim_catalog',
      };
      initialNew++;
    } else {
      if (!masterDict[key].audio && item.audio) masterDict[key].audio = item.audio;
      if (!masterDict[key].pealimPath && item.path) masterDict[key].pealimPath = item.path;
      if (!masterDict[key].root && item.root) masterDict[key].root = item.root;
      if (!masterDict[key].binyan && item.binyan) masterDict[key].binyan = item.binyan;

      // Если в каталоге встретился омограф с иными огласовками/значением (например, אַתְּ vs אֶת),
      // сохраняем его под точным огласованным ключом, чтобы омографы не терялись
      if (item.hebrew && item.hebrew !== masterDict[key].hebrew) {
        const vocalizedKey = item.hebrew.normalize('NFC');
        if (!masterDict[vocalizedKey]) {
          masterDict[vocalizedKey] = {
            hebrew: item.hebrew,
            hebrewPlain: item.hebrewPlain,
            transcription: item.transcription,
            translation: item.meaning,
            partOfSpeech: item.partOfSpeech,
            binyan: item.binyan || null,
            gender: item.gender || null,
            root: item.root || null,
            audio: item.audio || null,
            slug: item.slug,
            pealimPath: item.path,
            rootFamily: [],
            conjugation: null,
            source: 'pealim_catalog',
          };
          initialNew++;
        }
      }
    }
  }
  if (initialNew > 0) {
    safeWriteJson(outputFile, masterDict);
    console.log(`Базовый индекс синхронизирован: добавлено ${initialNew} новых словарных записей.`);
  }

  let wordsToFetch = catalog;
  if (verbsOnly) {
    wordsToFetch = catalog.filter((w) => w.partOfSpeech === 'verb');
  }

  const pendingItems = wordsToFetch.filter((item) => {
    const entry = masterDict[item.hebrewPlain];
    if (!entry) return true;
    if (item.partOfSpeech === 'verb' && !entry.conjugation) return true;
    if (entry.source === 'pealim_catalog' && item.partOfSpeech === 'verb') return true;
    return false;
  });

  console.log(`\nОчередь на подробную выгрузку карточек: ${pendingItems.length} (ограничение: ${limit === Infinity ? 'нет' : limit})`);

  let processed = 0;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < pendingItems.length && processed < limit; i += concurrency) {
    const batch = pendingItems.slice(i, Math.min(i + concurrency, pendingItems.length));
    const batchPromises = batch.map(async (item) => {
      if (processed >= limit) return null;
      processed++;
      const wordKey = item.hebrewPlain;
      const dictPath = item.path.startsWith('/ru/') ? item.path : `/ru${item.path}`;

      try {
        const pageHtml = await fetchWithRetry('https://www.pealim.com' + dictPath);
        const parsed = parsePealimHtml(pageHtml, dictPath);

        masterDict[wordKey] = {
          ...masterDict[wordKey],
          ...parsed,
          audio: item.audio || parsed.audio || masterDict[wordKey]?.audio,
          source: 'pealim',
        };
        successCount++;
        return { item, parsed, error: null };
      } catch (err) {
        errorCount++;
        return { item, parsed: null, error: err.message };
      }
    });

    const results = await Promise.all(batchPromises);
    for (const r of results) {
      if (!r) continue;
      if (r.error) {
        console.log(`\n❌ [${processed}/${pendingItems.length}] ${r.item.hebrewPlain}: ${r.error}`);
      } else {
        const rootStr = r.parsed.root ? `[${r.parsed.root}]` : '';
        const rfStr = r.parsed.rootFamily.length > 0 ? `[семья: ${r.parsed.rootFamily.length}]` : '';
        const conjStr = r.parsed.conjugation ? `[спряжения: да]` : '';
        process.stdout.write(`\r[${processed}/${pendingItems.length}] ${r.parsed.hebrew} (${r.parsed.transcription}) ${rootStr} ${rfStr} ${conjStr}        `);
      }
    }

    if (processed % 50 === 0 || processed >= pendingItems.length) {
      safeWriteJson(outputFile, masterDict);
      console.log(`\n[Checkpoint] Сохранено в ${outputFile} (обработано: ${processed})`);
    }

    await new Promise((r) => setTimeout(r, delayMs));
  }

  safeWriteJson(outputFile, masterDict);
  console.log(`\n=== Подробная выгрузка завершена! ===`);
  console.log(`Успешно обработано: ${successCount}`);
  console.log(`Ошибок: ${errorCount}`);
  console.log(`Всего слов в словаре: ${Object.keys(masterDict).length}`);

  if (syncDb) {
    console.log(`Синхронизация verbConjugations/database.ts...`);
    syncVerbDatabase();
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--fix-spaces')) {
    normalizeTranscriptionSpaces(true);
    syncVerbDatabase();
    return;
  }
  if (args.includes('--sync-db')) {
    syncVerbDatabase();
    return;
  }

  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : Infinity;

  const concurrencyIndex = args.indexOf('--concurrency');
  const concurrency = concurrencyIndex !== -1 ? parseInt(args[concurrencyIndex + 1], 10) : 4;

  const startPageIndex = args.indexOf('--start-page');
  const startPage = startPageIndex !== -1 ? parseInt(args[startPageIndex + 1], 10) : 1;

  const endPageIndex = args.indexOf('--end-page');
  const endPage = endPageIndex !== -1 ? parseInt(args[endPageIndex + 1], 10) : 622;

  const force = args.includes('--force');
  const verbsOnly = args.includes('--verbs-only');

  if (args.includes('--crawl-catalog')) {
    await crawlCatalog({ startPage, endPage, concurrency, force });
    return;
  }

  if (args.includes('--scrape-all')) {
    await scrapeAllWords({ verbsOnly, concurrency, limit, syncDb: true });
    return;
  }

  console.log('=== Ульпан Алеф: Загрузчик базы слов и спряжений Pealim ===');

  let masterDict = {};
  if (fs.existsSync(outputFile)) {
    try {
      masterDict = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      console.log(`Загружен существующий мастер-словарь: ${Object.keys(masterDict).length} слов.`);
    } catch (e) {
      masterDict = {};
    }
  }

  const allCourseWords = collectAllCourseWords();
  console.log(`Всего слов найдено в курсе и колодах: ${allCourseWords.length}`);

  let wordsToProcess = allCourseWords;
  if (verbsOnly) {
    wordsToProcess = allCourseWords.filter(
      (w) => w.partOfSpeech === 'verb' || (w.hebrewPlain.startsWith('ל') && w.hebrewPlain.length >= 3)
    );
    console.log(`Режим --verbs-only: выбрано ${wordsToProcess.length} глаголов.`);
  }

  const pendingWords = wordsToProcess.filter((w) => !masterDict[w.hebrewPlain]);
  console.log(`Осталось обработать новых слов: ${pendingWords.length} (ограничение: ${limit === Infinity ? 'нет' : limit})`);

  let processedCount = 0;
  let successCount = 0;
  let notFoundCount = 0;

  for (const item of pendingWords) {
    if (processedCount >= limit) break;
    processedCount++;

    const word = item.hebrewPlain;
    process.stdout.write(`[${processedCount}/${Math.min(pendingWords.length, limit)}] Ищу "${word}" (${item.translation})... `);

    try {
      const dictPath = await searchPealim(word, item.translation, item.partOfSpeech);
      if (!dictPath) {
        console.log('❌ Не найдено на Pealim');
        notFoundCount++;
        masterDict[word] = {
          hebrew: item.hebrew,
          hebrewPlain: word,
          transcription: item.transcription,
          translation: item.translation,
          partOfSpeech: item.partOfSpeech,
          source: 'course_fallback',
        };
      } else {
        const pageHtml = await fetchWithRetry('https://www.pealim.com' + dictPath);
        const parsed = parsePealimHtml(pageHtml, dictPath);

        masterDict[word] = {
          ...parsed,
          source: 'pealim',
          courseTranslation: item.translation,
        };

        const rootStr = parsed.root ? `[корень: ${parsed.root}]` : '';
        const rfStr = parsed.rootFamily.length > 0 ? `[семья: ${parsed.rootFamily.length} слов]` : '';
        const conjStr = parsed.conjugation ? `[спряжения: да]` : '';
        console.log(`✅ ${parsed.hebrew} (${parsed.transcription}) ${rootStr} ${rfStr} ${conjStr}`);
        successCount++;
      }
    } catch (err) {
      console.log(`⚠️ Ошибка: ${err.message}`);
    }

    if (processedCount % 5 === 0) {
      fs.writeFileSync(outputFile, JSON.stringify(masterDict, null, 2), 'utf8');
    }

    await new Promise((r) => setTimeout(r, 1200));
  }

  fs.writeFileSync(outputFile, JSON.stringify(masterDict, null, 2), 'utf8');
  console.log('\n=== ИТОГИ ВЫГРУЗКИ ===');
  console.log(`Всего сохранено в ${outputFile}: ${Object.keys(masterDict).length} записей.`);
  console.log(`Успешно обработано: ${successCount}`);
  console.log(`Не найдено на Pealim: ${notFoundCount}`);
  console.log('Готово!');
}

main().catch(console.error);
