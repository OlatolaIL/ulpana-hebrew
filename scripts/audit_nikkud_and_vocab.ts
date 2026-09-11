import { ULPAN_OFFLINE_DICTIONARY, lookupOfflineWord } from '../src/lib/ulpanDictionary';
import { VERB_CONJUGATIONS_DATABASE } from '../src/lib/verbConjugations/database';
import { DETAILED_LESSONS } from '../src/data/lessonsData';
import { THEMATIC_DECKS } from '../src/data/thematicDecks';
import { DIALOGUES_01_10 } from '../src/data/dialogues/dialogues_01_10';
import { DIALOGUES_11_25 } from '../src/data/dialogues/dialogues_11_25';
import { stripNikkud } from '../src/lib/transcription';

console.log('🔍 ЗАПУСК ГЛУБОКОГО АУДИТА ОГЛАСОВОК, ДИАЛОГОВ И СЛОВАРНЫХ КОЛЛИЗИЙ...\n');

// 1. СОБИРАЕМ ЭТАЛОННУЮ БАЗУ СЛОВ (Master Verified Lexicon)
const verifiedWords = new Map<string, Set<string>>(); // plain -> Set of verified vocalized forms

function registerWord(vocalized: string) {
  if (!vocalized) return;
  const plain = stripNikkud(vocalized).trim();
  if (!plain) return;
  if (!verifiedWords.has(plain)) {
    verifiedWords.set(plain, new Set());
  }
  verifiedWords.get(plain)!.add(vocalized.trim());
}

// Из оффлайн словаря
for (const entry of ULPAN_OFFLINE_DICTIONARY) {
  registerWord(entry.hebrew);
}

// Из базы спряжений Pealim
for (const verb of Object.values(VERB_CONJUGATIONS_DATABASE)) {
  if (verb.infinitive?.hebrew) registerWord(verb.infinitive.hebrew);
  for (const p of verb.present || []) registerWord(p.hebrew);
  for (const p of verb.past || []) registerWord(p.hebrew);
  for (const p of verb.future || []) registerWord(p.hebrew);
  for (const p of verb.imperative || []) registerWord(p.hebrew);
}

// Из тематических колод
for (const deck of THEMATIC_DECKS) {
  for (const w of deck.words || []) {
    registerWord(w.hebrew);
  }
}

// Из словарей уроков 1-100
for (const lesson of Object.values(DETAILED_LESSONS)) {
  for (const w of lesson.vocabulary || []) {
    registerWord(w.hebrew);
  }
}

console.log(`📚 Загружено эталонных словарных единиц: ${verifiedWords.size}`);

// 2. ПРОВЕРКА ДИАЛОГОВ
interface NikkudMismatch {
  location: string;
  wordPlain: string;
  foundInDialogue: string;
  dictionaryForms: string[];
  context: string;
}

const mismatches: NikkudMismatch[] = [];
const missingFromDict: { location: string; word: string; context: string }[] = [];

function checkText(text: string, location: string, fullContext: string) {
  if (!text) return;
  // Разбиваем на слова, очищаем от знаков препинания
  const words = text
    .replace(/[.,!?:;«»"״׳()[\]{}—/]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  for (const w of words) {
    const plain = stripNikkud(w);
    // Пропускаем однобуквенные или пустые
    if (plain.length < 2) continue;

    // Если слово огласовано
    if (w !== plain) {
      if (verifiedWords.has(plain)) {
        const canonicalSet = verifiedWords.get(plain)!;
        // Проверяем, совпадает ли огласовка хотя бы с одной канонической
        if (!canonicalSet.has(w)) {
          mismatches.push({
            location,
            wordPlain: plain,
            foundInDialogue: w,
            dictionaryForms: Array.from(canonicalSet),
            context: fullContext,
          });
        }
      } else {
        missingFromDict.push({
          location,
          word: w,
          context: fullContext,
        });
      }
    }
  }
}

function auditDialogues(dialogueGroup: any, name: string) {
  for (const [id, dialogue] of Object.entries(dialogueGroup)) {
    const d: any = dialogue;
    if (!d?.turns) continue;
    for (const turn of d.turns) {
      const loc = `${name} -> Диалог ${id} (реплика ${turn.id})`;
      if (turn.phrase?.hebrew) {
        checkText(turn.phrase.hebrew, loc, turn.phrase.hebrew);
      }
      if (turn.variants) {
        for (const [vKey, variant] of Object.entries(turn.variants)) {
          const v: any = variant;
          if (v?.hebrew) {
            checkText(v.hebrew, `${loc} [${vKey}]`, v.hebrew);
          }
        }
      }
    }
  }
}

auditDialogues(DIALOGUES_01_10, 'Уроки 1-10');
auditDialogues(DIALOGUES_11_25, 'Уроки 11-25');

console.log(`\n==========================================`);
console.log(`  РЕЗУЛЬТАТЫ АУДИТА ДИАЛОГОВ`);
console.log(`==========================================`);
console.log(`Найдено расхождений в огласовках с эталонным словарем: ${mismatches.length}`);

// Группируем расхождения по уникальным словам
const uniqueMismatches = new Map<string, NikkudMismatch[]>();
for (const m of mismatches) {
  const key = `${m.wordPlain}: ${m.foundInDialogue} vs ${m.dictionaryForms.join('/')}`;
  if (!uniqueMismatches.has(key)) uniqueMismatches.set(key, []);
  uniqueMismatches.get(key)!.push(m);
}

console.log(`Уникальных огласованных аномалий: ${uniqueMismatches.size}\n`);
for (const [key, instances] of uniqueMismatches.entries()) {
  const first = instances[0];
  console.log(`❌ Ошибка в диалоге: «${first.foundInDialogue}» (${first.wordPlain})`);
  console.log(`   Эталон в словаре:  ${first.dictionaryForms.join(' ИЛИ ')}`);
  console.log(`   Пример в тексте:   ${first.context}`);
  console.log(`   Встречается раз:   ${instances.length} (например, в ${first.location})\n`);
}

// 3. ПРОВЕРКА КОЛЛИЗИЙ СЛОВАРНОГО ПОИСКА (подобных «בלי» -> «יבול»)
console.log(`==========================================`);
console.log(`  ПРОВЕРКА ЛОЖНЫХ КОЛЛИЗИЙ ОФФЛАЙН-СЛОВАРЯ`);
console.log(`==========================================`);

const testWords = [
  'בלי', 'עם', 'על', 'תחת', 'ליד', 'בין', 'מול', 'לפני', 'אחרי', 'בגלל', 'כמו',
  'מי', 'מה', 'איך', 'איפה', 'לאן', 'מאין', 'מתי', 'למה', 'כמה',
  'זה', 'זאת', 'זו', 'אלה', 'אלו',
  'כאן', 'פה', 'שם', 'עכשיו', 'היום', 'אתמול', 'מחר',
  'רק', 'גם', 'עוד', 'כבר', 'אבל', 'או', 'כי', 'אם', 'אז',
  'טוב', 'רע', 'יפה', 'גדול', 'קטן', 'הרבה', 'קצת'
];

let collisionCount = 0;
for (const q of testWords) {
  const res = lookupOfflineWord(q);
  if (res) {
    const resPlain = stripNikkud(res.hebrewPlain || res.hebrew || '').trim();
    if (resPlain !== q) {
      collisionCount++;
      console.log(`🚨 ЛОЖНАЯ КОЛЛИЗИЯ ПОИСКА:`);
      console.log(`   Запрос:        «${q}»`);
      console.log(`   Результат:     «${res.hebrew}» (${resPlain}) — перевод: ${res.translation}`);
      console.log(`   Корень в базе: ${res.root || 'нет'}\n`);
    }
  } else {
    console.log(`⚠️  Слово не найдено в оффлайн-словаре: «${q}»`);
  }
}

console.log(`\nВсего ложных коллизий из тестового набора: ${collisionCount}`);
