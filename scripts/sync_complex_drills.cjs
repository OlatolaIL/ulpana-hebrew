/**
 * scripts/sync_complex_drills.cjs
 *
 * Промышленный генератор и синхронизатор слухового комплекса «Комплекс» (ComplexDrills).
 * Инварианты:
 * - R-01: pealimMasterDictionary.json — SSOT для лексических данных.
 * - R-04, R-05, R-06: Нормативный כתיב מלא с огласовками.
 * - R-09: Академическая транскрипция Pealim.
 * - R-18: Соответствие матрице ComplexDrills.
 *
 * Режимы работы:
 *   1. Подготовка заготовок (80% данных из Pealim):
 *      node scripts/sync_complex_drills.cjs --prepare-missing [--scope=all|lessons|thematic|prof] [--out=staging.json]
 *
 *   2. Валидация заготовок:
 *      node scripts/sync_complex_drills.cjs --check [staging.json]
 *
 *   3. Безопасное слияние проверенных карточек в кодовую базу (noun/adj/prep/verb):
 *      node scripts/sync_complex_drills.cjs --merge [staging.json]
 */

require('../tests/register.cjs');

const fs = require('fs');
const path = require('path');
const { hasComplexDrill } = require('../src/data/drills/index.ts');
const { DETAILED_LESSONS } = require('../src/data/lessonsData.ts');
const { THEMATIC_DECKS } = require('../src/data/thematicDecks/index.ts');
const { PROFESSIONAL_DECKS } = require('../src/data/professionalDecks/index.ts');
const { stripNikkud } = require('../src/lib/transcription.ts');

const repoRoot = path.join(__dirname, '..');
const PEALIM_PATH = path.join(repoRoot, 'src', 'data', 'pealimMasterDictionary.json');
const NOUN_DRILLS_PATH = path.join(repoRoot, 'src', 'data', 'drills', 'nounDrillsData.ts');
const ADJ_DRILLS_PATH = path.join(repoRoot, 'src', 'data', 'drills', 'adjectiveDrillsData.ts');
const PREP_DRILLS_PATH = path.join(repoRoot, 'src', 'data', 'drills', 'prepositionDrillsData.ts');
const VERB_SENTENCES_PATH = path.join(repoRoot, 'src', 'data', 'verbSentencesData.ts');
const DEFAULT_STAGING_PATH = path.join(repoRoot, 'scripts', 'output', 'drills_staging.json');

const args = process.argv.slice(2);
const isPrepare = args.includes('--prepare-missing');
const isCheck = args.includes('--check');
const isMerge = args.includes('--merge');

const scopeArg = args.find(a => a.startsWith('--scope='));
const scope = scopeArg ? scopeArg.split('=')[1] : 'all';

const outArg = args.find(a => a.startsWith('--out='));
const stagingPath = outArg ? path.resolve(process.cwd(), outArg.split('=')[1]) : DEFAULT_STAGING_PATH;

// Файловый аргумент для --check или --merge (если передан без префикса)
const fileArg = args.find(a => !a.startsWith('--') && a.endsWith('.json'));
const activeInputFile = fileArg ? path.resolve(process.cwd(), fileArg) : stagingPath;

// Загрузка Pealim SSOT
let pealimDict = {};
if (fs.existsSync(PEALIM_PATH)) {
  try {
    pealimDict = JSON.parse(fs.readFileSync(PEALIM_PATH, 'utf8'));
  } catch (err) {
    console.error('Ошибка чтения pealimMasterDictionary.json:', err.message);
  }
}

// Парсер plural из Pealim ("שְׁלוֹמוֹת шломот")
function parsePealimPlural(pluralStr) {
  if (!pluralStr || typeof pluralStr !== 'string') return null;
  const parts = pluralStr.trim().split(/\s+/);
  const hebParts = [];
  const ruParts = [];
  for (const p of parts) {
    if (/[\u0590-\u05FF]/.test(p)) {
      hebParts.push(p);
    } else {
      ruParts.push(p);
    }
  }
  return {
    pluralHe: hebParts.join(' '),
    pluralTranscription: ruParts.join(' ')
  };
}

// Поиск слова в Pealim
function findInPealim(wordRaw, wordPlain) {
  if (pealimDict[wordPlain]) return pealimDict[wordPlain];
  if (pealimDict[wordRaw]) return pealimDict[wordRaw];
  const stripped = stripNikkud(wordRaw).trim();
  if (pealimDict[stripped]) return pealimDict[stripped];
  return null;
}

// Сбор слов
function collectMissingWords(targetScope) {
  const missing = [];
  const seen = new Set();

  function processWord(w, sourceType, sourceName, lessonId) {
    const raw = (w.hebrewPlain || w.hebrew || '').trim();
    const plain = stripNikkud(raw).trim();
    if (!plain || seen.has(plain)) return;

    if (!hasComplexDrill(w)) {
      seen.add(plain);
      missing.push({
        raw,
        plain,
        hebrew: w.hebrew,
        transcription: w.transcription || '',
        translation: w.translation || '',
        partOfSpeech: w.partOfSpeech || null,
        gender: w.gender || null,
        sourceType,
        sourceName,
        lessonId: lessonId || 1,
      });
    }
  }

  if (targetScope === 'all' || targetScope === 'lessons') {
    for (let i = 1; i <= 100; i++) {
      const l = DETAILED_LESSONS[i];
      if (!l || !l.vocabulary) continue;
      for (const w of l.vocabulary) {
        processWord(w, 'lesson', 'Урок ' + i, i);
      }
    }
  }

  if (targetScope === 'all' || targetScope === 'thematic') {
    for (const deck of THEMATIC_DECKS) {
      if (!deck.words) continue;
      for (const w of deck.words) {
        processWord(w, 'thematic', 'Тема: ' + deck.title, deck.lessonId || 1);
      }
    }
  }

  if (targetScope === 'all' || targetScope === 'prof') {
    for (const deck of PROFESSIONAL_DECKS) {
      if (!deck.words) continue;
      for (const w of deck.words) {
        processWord(w, 'professional', 'Проф: ' + deck.title, deck.lessonId || 1);
      }
    }
  }

  return missing;
}

// РЕЖИМ 1: Подготовка заготовок
function handlePrepare() {
  console.log('🔍 Сбор непокрытых слов для области: ' + scope + '...');
  const missingList = collectMissingWords(scope);
  console.log('Найдено непокрытых слов: ' + missingList.length);

  const outputItems = [];

  for (const item of missingList) {
    const pealimEntry = findInPealim(item.raw, item.plain);
    const vocalized = pealimEntry?.hebrew || item.hebrew || item.plain;
    const transcription = pealimEntry?.transcription || item.transcription || '';
    const translation = pealimEntry?.translation || item.translation || '';
    const pos = item.partOfSpeech || pealimEntry?.partOfSpeech || (item.plain.startsWith('ל') && pealimEntry?.conjugation ? 'verb' : 'noun');
    const gender = pealimEntry?.gender || item.gender || 'm';

    if (pos === 'verb') {
      const conj = pealimEntry?.conjugation;
      const presMs = conj?.present?.[0]?.hebrew || vocalized;
      outputItems.push({
        id: 'v_' + item.plain,
        type: 'verb',
        infinitive: vocalized,
        infinitivePlain: item.plain,
        root: pealimEntry?.root || item.root || '',
        translationRu: translation,
        sourceLessonId: item.lessonId,
        sourceLessonTitle: item.sourceName,
        source: item.sourceType,
        sentences: [
          {
            id: 'v_' + item.plain + '_pres',
            verbInfinitive: vocalized,
            verbForm: presMs,
            tense: 'present',
            tenseRu: 'настоящее',
            prepositionPlain: '',
            prepositionVocalized: '',
            sentenceHe: '[TODO: предложение на иврите 3-4 слова]',
            sentenceTranscription: '[TODO: транскрипция фразы]',
            sentenceRu: '[TODO: русский перевод фразы]',
            drillAudioRu: '[TODO: перевод фразы] Глагол ' + translation + ', инфинитив: ' + transcription,
            minLesson: item.lessonId,
            lessonTheme: item.sourceName,
          }
        ]
      });
    } else if (pos === 'adjective') {
      outputItems.push({
        id: 'adj_' + item.plain,
        type: 'adjective',
        targetWordPlain: item.plain,
        targetWordVocalized: vocalized,
        targetWordTranscription: transcription,
        targetWordTranslation: translation,
        forms: {
          ms: { hebrew: vocalized, transcription: transcription, translation: translation + ' (м.р. ед.ч.)' },
          fs: { hebrew: vocalized + 'ה', transcription: transcription + 'а', translation: translation + ' (ж.р. ед.ч.)' },
          mp: { hebrew: vocalized + 'ים', transcription: transcription + 'им', translation: translation + ' (м.р. мн.ч.)' },
          fp: { hebrew: vocalized + 'ות', transcription: transcription + 'от', translation: translation + ' (ж.р. мн.ч.)' },
        },
        usedGenderNumber: 'ms',
        sentenceHe: '[TODO: предложение 3-4 слова на иврите]',
        sentenceTranscription: '[TODO: транскрипция фразы]',
        sentenceRu: '[TODO: русский перевод фразы]',
        minLesson: item.lessonId,
        lessonTheme: item.sourceName,
        source: item.sourceType,
      });
    } else if (pos === 'preposition') {
      outputItems.push({
        id: 'prep_' + item.plain,
        type: 'preposition',
        targetWordPlain: item.plain,
        targetWordVocalized: vocalized,
        targetWordTranscription: transcription,
        targetWordTranslation: translation,
        basePrepositionHe: vocalized,
        basePrepositionRu: translation,
        inflectedFormHe: vocalized,
        inflectedTranscription: transcription,
        personTitle: 'Базовая форма',
        inflectionsTable: [],
        sentenceHe: '[TODO: предложение 3-4 слова на иврите]',
        sentenceTranscription: '[TODO: транскрипция фразы]',
        sentenceRu: '[TODO: русский перевод фразы]',
        minLesson: item.lessonId,
        lessonTheme: item.sourceName,
        source: item.sourceType,
      });
    } else {
      // Существительные, устойчивые фразы, наречия, местоимения
      let pluralHe = '';
      let pluralTranscription = '';
      if (pealimEntry?.plural) {
        const parsedPlural = parsePealimPlural(pealimEntry.plural);
        if (parsedPlural) {
          pluralHe = parsedPlural.pluralHe;
          pluralTranscription = parsedPlural.pluralTranscription;
        }
      }

      outputItems.push({
        id: 'n_' + item.plain,
        type: 'noun',
        targetWordPlain: item.plain,
        targetWordVocalized: vocalized,
        targetWordTranscription: transcription,
        targetWordTranslation: translation,
        singularHe: vocalized,
        singularTranscription: transcription,
        pluralHe: pluralHe || undefined,
        pluralTranscription: pluralTranscription || undefined,
        gender: gender,
        sentenceHe: '[TODO: предложение 3-4 слова на иврите]',
        sentenceTranscription: '[TODO: транскрипция фразы]',
        sentenceRu: '[TODO: русский перевод фразы]',
        minLesson: item.lessonId,
        lessonTheme: item.sourceName,
        source: item.sourceType,
      });
    }
  }

  const outDir = path.dirname(stagingPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(stagingPath, JSON.stringify(outputItems, null, 2), 'utf8');
  console.log('✅ Сгенерировано ' + outputItems.length + ' заготовок карточек!');
  console.log('📁 Файл для редактирования: ' + stagingPath);
  console.log('\nСледующие шаги:');
  console.log('1. Заполните фразы sentenceHe, sentenceTranscription, sentenceRu (через ИИ или вручную)');
  console.log('2. Проверьте готовность: node scripts/sync_complex_drills.cjs --check ' + path.relative(repoRoot, stagingPath));
  console.log('3. Влейте в проект:      node scripts/sync_complex_drills.cjs --merge ' + path.relative(repoRoot, stagingPath) + '\n');
}

// РЕЖИМ 2: Валидация
function validateStaging(items) {
  const errors = [];
  let readyCount = 0;

  items.forEach((item, index) => {
    const prefix = '[' + (index + 1) + ': ' + (item.targetWordPlain || item.infinitivePlain || item.id) + ']';

    if (!item.type) {
      errors.push(prefix + " Отсутствует поле 'type'");
    }

    if (item.type === 'verb') {
      if (!item.infinitivePlain) errors.push(prefix + " Отсутствует 'infinitivePlain'");
      if (!item.sentences || item.sentences.length === 0) {
        errors.push(prefix + " Отсутствуют предложения в 'sentences'");
      } else {
        item.sentences.forEach((s, sIdx) => {
          if (!s.sentenceHe || s.sentenceHe.includes('[TODO')) errors.push(prefix + ' sentences[' + sIdx + ']: не заполнено sentenceHe');
          if (!s.sentenceTranscription || s.sentenceTranscription.includes('[TODO')) errors.push(prefix + ' sentences[' + sIdx + ']: не заполнено sentenceTranscription');
          if (!s.sentenceRu || s.sentenceRu.includes('[TODO')) errors.push(prefix + ' sentences[' + sIdx + ']: не заполнено sentenceRu');
        });
      }
    } else {
      if (!item.targetWordPlain) {
        errors.push(prefix + " Отсутствует поле 'targetWordPlain'");
      }
      if (!item.sentenceHe || item.sentenceHe.includes('[TODO')) {
        errors.push(prefix + " Не заполнено 'sentenceHe'");
      }
      if (!item.sentenceTranscription || item.sentenceTranscription.includes('[TODO')) {
        errors.push(prefix + " Не заполнено 'sentenceTranscription'");
      }
      if (!item.sentenceRu || item.sentenceRu.includes('[TODO')) {
        errors.push(prefix + " Не заполнено 'sentenceRu'");
      }

      if (item.type === 'adjective' && (!item.forms || !item.forms.ms || !item.forms.fs)) {
        errors.push(prefix + ' Прилагательное должно иметь сетку 4 форм (ms, fs, mp, fp)');
      }
    }

    if (errors.length === 0) {
      readyCount++;
    }
  });

  return { errors, readyCount, total: items.length };
}

function handleCheck() {
  if (!fs.existsSync(activeInputFile)) {
    console.error('🔴 Файл не найден: ' + activeInputFile);
    process.exit(1);
  }

  const items = JSON.parse(fs.readFileSync(activeInputFile, 'utf8'));
  console.log('🔍 Проверка ' + items.length + ' заготовок из ' + path.relative(repoRoot, activeInputFile) + '...');

  const { errors, readyCount, total } = validateStaging(items);

  if (errors.length > 0) {
    console.log('\n🟡 Обнаружено ' + errors.length + ' замечаний:');
    errors.slice(0, 15).forEach(e => console.log('   • ' + e));
    if (errors.length > 15) {
      console.log('   ... и ещё ' + (errors.length - 15) + ' ошибок');
    }
    console.log('\nГотово к вливанию: ' + readyCount + ' из ' + total);
    process.exit(1);
  } else {
    console.log('\n🟢 Все ' + total + ' карточек полностью валидны и готовы к слиянию (--merge)!');
  }
}

// РЕЖИМ 3: Слияние в TypeScript модули
function handleMerge() {
  if (!fs.existsSync(activeInputFile)) {
    console.error('🔴 Файл не найден: ' + activeInputFile);
    process.exit(1);
  }

  const items = JSON.parse(fs.readFileSync(activeInputFile, 'utf8'));
  const { errors } = validateStaging(items);

  if (errors.length > 0) {
    console.error('🔴 Слияние заблокировано: обнаружено ' + errors.length + ' незаполненных полей!');
    console.error('Сначала заполните все [TODO] маркеры или устраните ошибки (запустите --check).');
    process.exit(1);
  }

  const nouns = items.filter(i => i.type === 'noun');
  const adjectives = items.filter(i => i.type === 'adjective');
  const prepositions = items.filter(i => i.type === 'preposition');
  const verbs = items.filter(i => i.type === 'verb');

  console.log('📦 Слияние карточек: существительных: ' + nouns.length + ', прилагательных: ' + adjectives.length + ', предлогов: ' + prepositions.length + ', глаголов: ' + verbs.length + '...');

  if (nouns.length > 0) {
    mergeNouns(nouns);
  }
  if (adjectives.length > 0) {
    mergeAdjectives(adjectives);
  }
  if (prepositions.length > 0) {
    mergePrepositions(prepositions);
  }
  if (verbs.length > 0) {
    mergeVerbs(verbs);
  }

  console.log('\n🎉 Слияние успешно выполнено!');
  console.log('Запуск аудита покрытия:');
  const { execSync } = require('child_process');
  execSync('node scripts/audit_complex_drills_coverage.cjs --summary', { stdio: 'inherit', cwd: repoRoot });
}

function mergeNouns(nounsList) {
  let content = fs.readFileSync(NOUN_DRILLS_PATH, 'utf8');
  const marker = 'export function getNounDrill';
  const idx = content.lastIndexOf(marker);
  if (idx === -1) throw new Error('Не найден маркер getNounDrill в nounDrillsData.ts');

  const braceIdx = content.lastIndexOf('};', idx);
  if (braceIdx === -1) throw new Error('Не найдено окончание NOUN_DRILLS_DATA');

  const before = content.slice(0, braceIdx);
  const after = content.slice(braceIdx);

  const entries = nounsList.map(item => {
    const lines = [];
    lines.push("  '" + item.targetWordPlain + "': {");
    lines.push("    id: '" + item.id + "',");
    lines.push("    type: 'noun',");
    lines.push("    targetWordPlain: '" + item.targetWordPlain + "',");
    lines.push("    targetWordVocalized: '" + item.targetWordVocalized + "',");
    lines.push("    targetWordTranscription: '" + item.targetWordTranscription + "',");
    lines.push("    targetWordTranslation: '" + item.targetWordTranslation.replace(/'/g, "\\'") + "',");
    lines.push("    singularHe: '" + (item.singularHe || item.targetWordVocalized) + "',");
    lines.push("    singularTranscription: '" + (item.singularTranscription || item.targetWordTranscription) + "',");
    if (item.pluralHe) {
      lines.push("    pluralHe: '" + item.pluralHe + "',");
      lines.push("    pluralTranscription: '" + (item.pluralTranscription || "") + "',");
    }
    lines.push("    gender: '" + (item.gender || 'm') + "',");
    if (item.isPluralException) {
      lines.push("    isPluralException: true,");
    }
    if (item.pluralNote) {
      lines.push("    pluralNote: '" + item.pluralNote.replace(/'/g, "\\'") + "',");
    }
    lines.push("    sentenceHe: '" + item.sentenceHe + "',");
    lines.push("    sentenceTranscription: '" + item.sentenceTranscription.replace(/'/g, "\\'") + "',");
    lines.push("    sentenceRu: '" + item.sentenceRu.replace(/'/g, "\\'") + "',");
    lines.push("    minLesson: " + (item.minLesson || 1) + ",");
    if (item.lessonTheme) {
      lines.push("    lessonTheme: '" + item.lessonTheme.replace(/'/g, "\\'") + "',");
    }
    lines.push("  },");
    return lines.join('\n');
  }).join('\n');

  const newContent = before + entries + '\n' + after;
  fs.writeFileSync(NOUN_DRILLS_PATH, newContent, 'utf8');
  console.log('   ✅ ' + nounsList.length + ' существительных добавлены в nounDrillsData.ts');
}

function mergeAdjectives(adjList) {
  let content = fs.readFileSync(ADJ_DRILLS_PATH, 'utf8');
  const marker = 'export function getAdjectiveDrill';
  const idx = content.lastIndexOf(marker);
  if (idx === -1) throw new Error('Не найден маркер getAdjectiveDrill в adjectiveDrillsData.ts');

  const braceIdx = content.lastIndexOf('};', idx);
  if (braceIdx === -1) throw new Error('Не найдено окончание ADJECTIVE_DRILLS_DATA');

  const before = content.slice(0, braceIdx);
  const after = content.slice(braceIdx);

  const entries = adjList.map(item => {
    const lines = [];
    lines.push("  '" + item.targetWordPlain + "': {");
    lines.push("    id: '" + item.id + "',");
    lines.push("    type: 'adjective',");
    lines.push("    targetWordPlain: '" + item.targetWordPlain + "',");
    lines.push("    targetWordVocalized: '" + item.targetWordVocalized + "',");
    lines.push("    targetWordTranscription: '" + item.targetWordTranscription + "',");
    lines.push("    targetWordTranslation: '" + item.targetWordTranslation.replace(/'/g, "\\'") + "',");
    lines.push("    forms: {");
    for (const f of ['ms', 'fs', 'mp', 'fp']) {
      const form = item.forms?.[f] || { hebrew: item.targetWordVocalized, transcription: item.targetWordTranscription, translation: '' };
      lines.push("      " + f + ": { hebrew: '" + form.hebrew + "', transcription: '" + form.transcription + "', translation: '" + form.translation.replace(/'/g, "\\'") + "' },");
    }
    lines.push("    },");
    lines.push("    usedGenderNumber: '" + (item.usedGenderNumber || 'ms') + "',");
    lines.push("    sentenceHe: '" + item.sentenceHe + "',");
    lines.push("    sentenceTranscription: '" + item.sentenceTranscription.replace(/'/g, "\\'") + "',");
    lines.push("    sentenceRu: '" + item.sentenceRu.replace(/'/g, "\\'") + "',");
    lines.push("    minLesson: " + (item.minLesson || 1) + ",");
    if (item.lessonTheme) {
      lines.push("    lessonTheme: '" + item.lessonTheme.replace(/'/g, "\\'") + "',");
    }
    lines.push("  },");
    return lines.join('\n');
  }).join('\n');

  const newContent = before + entries + '\n' + after;
  fs.writeFileSync(ADJ_DRILLS_PATH, newContent, 'utf8');
  console.log('   ✅ ' + adjList.length + ' прилагательных добавлены в adjectiveDrillsData.ts');
}

function mergePrepositions(prepList) {
  let content = fs.readFileSync(PREP_DRILLS_PATH, 'utf8');
  const marker = 'export function getPrepositionDrill';
  const idx = content.lastIndexOf(marker);
  if (idx === -1) throw new Error('Не найден маркер getPrepositionDrill в prepositionDrillsData.ts');

  const braceIdx = content.lastIndexOf('};', idx);
  if (braceIdx === -1) throw new Error('Не найдено окончание PREPOSITION_DRILLS_DATA');

  const before = content.slice(0, braceIdx);
  const after = content.slice(braceIdx);

  const entries = prepList.map(item => {
    const lines = [];
    lines.push("  '" + item.targetWordPlain + "': {");
    lines.push("    id: '" + item.id + "',");
    lines.push("    type: 'preposition',");
    lines.push("    targetWordPlain: '" + item.targetWordPlain + "',");
    lines.push("    targetWordVocalized: '" + item.targetWordVocalized + "',");
    lines.push("    targetWordTranscription: '" + item.targetWordTranscription + "',");
    lines.push("    targetWordTranslation: '" + item.targetWordTranslation.replace(/'/g, "\\'") + "',");
    lines.push("    basePrepositionHe: '" + item.basePrepositionHe + "',");
    lines.push("    basePrepositionRu: '" + item.basePrepositionRu.replace(/'/g, "\\'") + "',");
    lines.push("    inflectedFormHe: '" + item.inflectedFormHe + "',");
    lines.push("    inflectedTranscription: '" + item.inflectedTranscription.replace(/'/g, "\\'") + "',");
    lines.push("    personTitle: '" + item.personTitle.replace(/'/g, "\\'") + "',");
    lines.push("    inflectionsTable: " + JSON.stringify(item.inflectionsTable || []) + ",");
    lines.push("    sentenceHe: '" + item.sentenceHe + "',");
    lines.push("    sentenceTranscription: '" + item.sentenceTranscription.replace(/'/g, "\\'") + "',");
    lines.push("    sentenceRu: '" + item.sentenceRu.replace(/'/g, "\\'") + "',");
    lines.push("    minLesson: " + (item.minLesson || 1) + ",");
    if (item.lessonTheme) {
      lines.push("    lessonTheme: '" + item.lessonTheme.replace(/'/g, "\\'") + "',");
    }
    lines.push("  },");
    return lines.join('\n');
  }).join('\n');

  const newContent = before + entries + '\n' + after;
  fs.writeFileSync(PREP_DRILLS_PATH, newContent, 'utf8');
  console.log('   ✅ ' + prepList.length + ' предлогов добавлены в prepositionDrillsData.ts');
}

function mergeVerbs(verbList) {
  let content = fs.readFileSync(VERB_SENTENCES_PATH, 'utf8');
  const marker = 'export function getVerbSentenceGroup';
  const idx = content.lastIndexOf(marker);
  if (idx === -1) throw new Error('Не найден маркер getVerbSentenceGroup в verbSentencesData.ts');

  const braceIdx = content.lastIndexOf('};', idx);
  if (braceIdx === -1) throw new Error('Не найдено окончание VERB_SENTENCES_DATA');

  const before = content.slice(0, braceIdx);
  const after = content.slice(braceIdx);

  const entries = verbList.map(item => {
    const lines = [];
    lines.push("  '" + item.infinitivePlain + "': {");
    lines.push("    infinitive: '" + item.infinitive + "',");
    lines.push("    infinitivePlain: '" + item.infinitivePlain + "',");
    lines.push("    root: '" + item.root + "',");
    lines.push("    translationRu: '" + item.translationRu.replace(/'/g, "\\'") + "',");
    lines.push("    sourceLessonId: " + (item.sourceLessonId || 1) + ",");
    lines.push("    sourceLessonTitle: '" + (item.sourceLessonTitle || '').replace(/'/g, "\\'") + "',");
    lines.push("    sentences: [");
    for (const s of item.sentences) {
      lines.push("      {");
      lines.push("        id: '" + s.id + "',");
      lines.push("        verbInfinitive: '" + s.verbInfinitive + "',");
      lines.push("        verbForm: '" + s.verbForm + "',");
      lines.push("        tense: '" + (s.tense || 'present') + "',");
      lines.push("        tenseRu: '" + (s.tenseRu || 'настоящее') + "',");
      lines.push("        prepositionPlain: '" + (s.prepositionPlain || '') + "',");
      lines.push("        prepositionVocalized: '" + (s.prepositionVocalized || '') + "',");
      lines.push("        sentenceHe: '" + s.sentenceHe + "',");
      lines.push("        sentenceTranscription: '" + s.sentenceTranscription.replace(/'/g, "\\'") + "',");
      lines.push("        sentenceRu: '" + s.sentenceRu.replace(/'/g, "\\'") + "',");
      lines.push("        drillAudioRu: '" + (s.drillAudioRu || s.sentenceRu).replace(/'/g, "\\'") + "',");
      lines.push("        minLesson: " + (s.minLesson || 1) + ",");
      lines.push("        lessonTheme: '" + (s.lessonTheme || '').replace(/'/g, "\\'") + "',");
      lines.push("      },");
    }
    lines.push("    ],");
    lines.push("  },");
    return lines.join('\n');
  }).join('\n');

  const newContent = before + entries + '\n' + after;
  fs.writeFileSync(VERB_SENTENCES_PATH, newContent, 'utf8');
  console.log('   ✅ ' + verbList.length + ' глаголов добавлены в verbSentencesData.ts');
}

// Главный роутер
if (isPrepare) {
  handlePrepare();
} else if (isCheck) {
  handleCheck();
} else if (isMerge) {
  handleMerge();
} else {
  console.log('\nИспользование sync_complex_drills.cjs:\n  --prepare-missing   Найти все недостающие слова и подготовить заготовку staging.json (80% данных из Pealim)\n                      Опции: --scope=all|lessons|thematic|prof  --out=path/to/staging.json\n  --check             Проверить валидность заготовки (наличие заполненных фраз, отсутствие [TODO])\n  --merge             Безопасно внедрить проверенные карточки в кодовую базу (noun/adj/prep/verb)\n');
}