import { stripNikkud } from './transcription';
import type { PhoneMemoryScope } from '@/data/phone/contracts';

export interface ClosedSlots {
  name?: string;
  wellbeing?: string;
  apartment?: string;
  coffee_sugar?: string;
  coffee_size?: string;
  coffee_milk?: string;
}

export interface SlotMemoryResult {
  slots: ClosedSlots;
  promptConstraint: string;
}

/** Conservative facts only; uncertainty must leave the slot open. */
const NON_NAMES = new Set([
  'צריך', 'צריכה', 'רוצה', 'גר', 'גרה', 'מחפש', 'מחפשת', 'עובד', 'עובדת',
  'לומד', 'לומדת', 'מדבר', 'מדברת', 'אוהב', 'אוהבת', 'מגיע', 'מגיעה',
  'בא', 'באה', 'יכול', 'יכולה', 'חושב', 'חושבת', 'מבקש', 'מבקשת',
  'מתקשר', 'מתקשרת', 'משכיר', 'משכירה', 'שוכר', 'שוכרת', 'מזמין', 'מזמינה',
  'לא', 'כן', 'פה', 'כאן', 'שם', 'בסדר', 'טוב', 'מוכן', 'מוכנה',
]);
const BEVERAGE = /(?:^|\s)(?:ה?קפה|ה?תה|אספרסו|קפוצינו)(?=\s|$)/;
const OTHER_OBJECT = /(?:^|\s)[בהל]?(?:שולחן|דירה|חדר|מיטה|ארון|מקרר|חבילה|בית)(?=\s|$)/;
const APARTMENT = /(?:^|\s)(?:בדירה|דירה)\s+(?:מספר\s+)?([0-9]{1,4}|אחת|אחד|שתיים|שתים|שניים|שנים|שלוש|ארבע|חמש|שש|שבע|שמונה|תשע|עשר)(?=\s|$)/g;
const NEGATED = /(?:^|\s)(?:לא|איני|אינני)(?=\s|$)/;
const QUESTION_START = /^(?:ו)?(?:האם|מה|מי|איפה|מתי|למה|איך|כמה|איזה|איזו|יש|אפשר)(?:\s|$)/;

export function extractClosedSlots(
  messages: Array<{ role: string; content?: string; hebrew?: string }>,
  knownStudentName?: string,
  scope?: PhoneMemoryScope
): ClosedSlots {
  const slots: ClosedSlots = {};
  let inferredCoffee = false;
  for (const message of messages) {
    if (message.role !== 'user') continue;
    const text = stripNikkud(message.content || message.hebrew || '').toLowerCase();
    // Later explicit selections replace earlier selections, even within one turn.
    const clauses = text.replace(/(?:^|\s)(?:סליחה|בעצם|אלא)(?=\s|$)/g, '. ')
      .match(/[^.!?;,]+[.!?;,]?/g) || [];
    for (const rawClause of clauses) {
      const clause = rawClause.replace(/[.!?;,]+$/, '').trim();
      if (!clause || rawClause.trim().endsWith('?') || QUESTION_START.test(clause)) continue;
      if (NEGATED.test(clause)) {
        // A rejected choice is unknown, not the opposite choice and not a stale fact.
        if (scope === 'coffee' || (scope === undefined && inferredCoffee)) {
          if (/סוכר/.test(clause)) delete slots.coffee_sugar;
          if (/גדול|קטן|קטנה|בינוני/.test(clause)) delete slots.coffee_size;
          if (/חלב/.test(clause)) delete slots.coffee_milk;
        }
        continue;
      }
      const explicit = clause.match(/(?:^|\s)(?:קוראים לי|שמי)\s+([א-ת]{2,15})(?=\s|$)/);
      // Bare "אני + word" is not a name: require the introduction's social cue.
      const introduction = clause.match(/^(?:שלום\s+)?אני\s+([א-ת]{2,15})\s+נעים מאוד(?:\s|$)/);
      const name = explicit?.[1] || introduction?.[1];
      if (name && !NON_NAMES.has(name)) slots.name = name;
      if (!slots.name && knownStudentName) {
        const profileName = stripNikkud(knownStudentName).toLowerCase();
        if (profileName.length >= 2 && (' ' + clause + ' ').includes(' ' + profileName + ' ') &&
          /(?:^|\s)(?:אני|קוראים לי|שמי)\s/.test(clause)) slots.name = knownStudentName;
      }
      if ((scope === undefined || scope === 'social') &&
        /(?:^|\s)(?:הכל טוב|הכול טוב|הכל בסדר|הכול בסדר|בסדר גמור)(?=\s|$)/.test(clause)) {
        slots.wellbeing = 'הַכֹּל טוֹב / בְּסֵדֶר';
      }
      // Rental room counts are not the student's apartment number.
      if (scope === undefined || scope === 'social' || scope === 'delivery') {
        for (const match of clause.matchAll(APARTMENT)) {
          const following = clause.slice((match.index || 0) + match[0].length);
          if (!/^\s+חדרים(?:\s|$)/.test(following)) slots.apartment = match[1];
        }
      }
      if (scope === undefined && BEVERAGE.test(clause)) inferredCoffee = true;
      if (!(scope === 'coffee' || (scope === undefined && inferredCoffee)) || OTHER_OBJECT.test(clause) || /(?:^|\s)או(?:\s|$)/.test(clause)) continue;
      for (const match of clause.matchAll(/(?:^|\s)(בלי סוכר|ללא סוכר|עם סוכר|אחד סוכר|שני סוכר|גדול|גדולה|קטן|קטנה|בינוני|בינונית|חלב סויה|חלב שיבולת שועל|שיבולת שועל|בלי חלב|ללא חלב|עם חלב)(?=\s|$)/g)) {
        const value = match[1];
        if (value.includes('סוכר')) slots.coffee_sugar = /^(בלי|ללא)/.test(value) ? 'בְּלִי סוּכָּר' : 'עִם סוּכָּר';
        else if (/^גדול/.test(value)) slots.coffee_size = 'גָּדוֹל';
        else if (/^קט/.test(value)) slots.coffee_size = 'קָטָן';
        else if (/^בינונ/.test(value)) slots.coffee_size = 'בֵּינוֹנִי';
        else if (value.includes('סויה')) slots.coffee_milk = 'חֲלַב סוֹיָה';
        else if (value.includes('שיבולת')) slots.coffee_milk = 'שִׁבּוֹלֶת שׁוּעָל';
        else slots.coffee_milk = /^(בלי|ללא)/.test(value) ? 'בְּלִי חָלָב' : 'עִם חָלָב';
      }
    }
  }
  return slots;
}

/**
 * Генерирует блок жестких системных ограничений для промпта на основе закрытых слотов.
 */
export function formatSlotMemoryPrompt(slots: ClosedSlots): string {
  const prohibitions: string[] = [];
  const knownDetails: string[] = [];

  if (slots.name) {
    knownDetails.push(`Имя собеседника: "${slots.name}"`);
    prohibitions.push(`КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО спрашивать имя («אֵיךְ קוֹרְאִים לְךָ/לָךְ?», «מָה שִׁמְךָ?», «מִי זֶה?»)! Собеседник УЖЕ назвал своё имя!`);
  }

  if (slots.wellbeing) {
    knownDetails.push(`Самочувствие/дела: "${slots.wellbeing}"`);
    prohibitions.push(`КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО переспрашивать «מָה נִשְׁמַע?», «מָה שְׁלוֹמְךָ/שְׁלוֹמֵךְ?», «הַכֹּל טוֹב?»! Собеседник УЖЕ ответил!`);
  }

  if (slots.apartment) {
    knownDetails.push(`Квартира/номер: "${slots.apartment}"`);
    prohibitions.push(`КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО спрашивать «בְּאֵיזוֹ דִּירָה אַתָּה/אַתְּ?» или номер квартиры! Собеседник УЖЕ назвал его!`);
  }

  if (slots.coffee_sugar) {
    knownDetails.push(`Сахар: "${slots.coffee_sugar}"`);
    prohibitions.push(`КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО спрашивать «עִם סוּכָּר?» или «כַּמָּה סוּכָּר?»! Слот сахара ЗАКРЫТ!`);
  }

  if (slots.coffee_size) {
    knownDetails.push(`Размер: "${slots.coffee_size}"`);
    prohibitions.push(`КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО переспрашивать размер («גָּדוֹל אוֹ קָטָן?»)! Размер УЖЕ выбран!`);
  }

  if (slots.coffee_milk) {
    knownDetails.push(`Молоко: "${slots.coffee_milk}"`);
    prohibitions.push(`КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО переспрашивать тип молока!`);
  }

  if (knownDetails.length === 0) {
    return '';
  }

  return `
🔴 ПАМЯТЬ СУЩНОСТЕЙ (ИНВАРИАНТ P-03 — SLOT MEMORY):
Собеседник УЖЕ НАЗВАЛ следующие детали:
${knownDetails.map((d) => `- ${d}`).join('\n')}

СТРОГИЕ ЗАПРЕТЫ ДЛЯ ЭТОГО РАУНДА:
${prohibitions.map((p) => `- ${p}`).join('\n')}
Учитывай эти детали. Если вопрос уместен, спрашивай только о разрешённых незакрытых деталях; при завершении не задавай новых вопросов.
`;
}

/** Detect known repeated questions without rewriting assertions or unknown phrasing. */
export function hasRepeatedSlotQuestion(hebrew: string, slots: ClosedSlots): boolean {
  const parts = stripNikkud(hebrew).match(/[^.!?]+[.!?]?/g) || [];
  return parts.some((part) => {
    const question = part.trim();
    if (slots.name && (question.endsWith('?') || /^(?:איך|מה|מי)\s/.test(question)) &&
      /(?:איך קוראים לך|מה שמך|מי זה)(?:\s|[?!.]|$)/.test(question)) return true;
    if (!question.endsWith('?')) return false;
    return Boolean(
      (slots.wellbeing && /(?:מה נשמע|מה שלומך|הכל טוב|הכול טוב)/.test(question)) ||
      (slots.apartment && /(?:באיזו דירה|באיזה דירה|מה מספר הדירה|מה מספר דירתך)/.test(question)) ||
      (slots.coffee_sugar && /(?:^|\s)(?:ועם|עם|בלי|כמה) סוכר(?=[\s?]|$)/.test(question)) ||
      (slots.coffee_size && /(?:גדול או קטן|קטן או גדול|איזה גודל)/.test(question)) ||
      (slots.coffee_milk && /(?:איזה חלב|איזה סוג חלב|עם חלב|בלי חלב)/.test(question))
    );
  });
}

type SpokenReply = { hebrew: string; transcription: string; translation: string };

/** Legacy compatibility. Runtime should reject/regenerate with hasRepeatedSlotQuestion.
 * Only remove whole questions aligned in all three languages; ambiguous alignment
 * is returned intact rather than corrupting the spoken meaning.
 */
export function filterRepeatedSlotQuestions(reply: SpokenReply, slots: ClosedSlots): SpokenReply {
  const segments = (text: string) => (text.match(/[^.!?]+[.!?]?/g) || []).map((s) => s.trim()).filter(Boolean);
  const hebrew = segments(reply.hebrew);
  const transcription = segments(reply.transcription);
  const translation = segments(reply.translation);
  if (hebrew.length !== transcription.length || hebrew.length !== translation.length) return reply;
  const keep = hebrew.map((text, index) => !(
    text.endsWith('?') && transcription[index].endsWith('?') && translation[index].endsWith('?') &&
    /^(?:איך קוראים לך|מה שמך|מי זה|ו?עם סוכר|כמה סוכר)\?$/.test(stripNikkud(text)) &&
    hasRepeatedSlotQuestion(text, { name: slots.name, coffee_sugar: slots.coffee_sugar })
  ));
  return {
    hebrew: hebrew.filter((_, i) => keep[i]).join(' '),
    transcription: transcription.filter((_, i) => keep[i]).join(' '),
    translation: translation.filter((_, i) => keep[i]).join(' '),
  };
}
