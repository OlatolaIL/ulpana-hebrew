import { stripNikkud } from './transcription';

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

/**
 * Извлекает уже названные сущности (слоты) из истории сообщений пользователя.
 * Реализует инвариант P-03 (Slot Memory).
 */
export function extractClosedSlots(
  messages: Array<{ role: string; content?: string; hebrew?: string }>,
  knownStudentName?: string
): ClosedSlots {
  const slots: ClosedSlots = {};

  // Собираем все реплики пользователя
  const userTexts = messages
    .filter((m) => m.role === 'user')
    .map((m) => (m.content || m.hebrew || '').trim())
    .filter(Boolean);

  if (userTexts.length === 0) {
    return slots;
  }

  const combinedUserText = userTexts.join(' ');
  const stripped = stripNikkud(combinedUserText).toLowerCase();

  // 1. Имя ученика (Name slot)
  // Приоритет 1: эксплицитные паттерны "קוראים לי X" или "שמי X"
  const explicitNameMatch = stripped.match(/(?:קוראים\s+לי|שמי)\s+([א-ת]{2,15})/);
  if (explicitNameMatch && !['גר', 'גרה', 'רוצה', 'מחפש', 'מחפשת', 'בסדר', 'טוב'].includes(explicitNameMatch[1])) {
    slots.name = explicitNameMatch[1];
  } else {
    // Приоритет 2: "אני <Имя>" с фильтрацией глаголов/местоимений
    const aniMatches = [...stripped.matchAll(/אני\s+([א-ת]{2,15})/g)];
    const stopWords = ['גר', 'גרה', 'רוצה', 'מחפש', 'מחפשת', 'בסדר', 'טוב', 'פה', 'שם', 'לא', 'כן', 'כאן', 'מדבר', 'מדברת', 'אוהב', 'אוהבת', 'לומד', 'לומדת'];
    for (const match of aniMatches) {
      const candidate = match[1];
      if (!stopWords.includes(candidate)) {
        slots.name = candidate;
        break;
      }
    }
  }

  if (!slots.name && knownStudentName) {
    // Если в тексте встречается известное имя профиля
    const strippedName = stripNikkud(knownStudentName).toLowerCase();
    if (strippedName.length >= 2 && stripped.includes(strippedName)) {
      slots.name = knownStudentName;
    }
  }

  // 2. Самочувствие / Приветствие (Wellbeing slot)
  if (
    stripped.includes('הכל טוב') ||
    stripped.includes('הכל בסדר') ||
    stripped.includes('בסדר גמור') ||
    stripped.includes('מצוין') ||
    stripped.includes('מעולה') ||
    stripped.includes('יופי') ||
    stripped.includes('סבבה') ||
    stripped.includes('עכל בסדר') ||
    stripped.includes('הכול טוב')
  ) {
    slots.wellbeing = 'הַכֹּל טוֹב / בְּסֵדֶר';
  }

  // 3. Квартира / адрес / проживание (Apartment slot)
  // Паттерны: "בדירה 2", "דירה שתיים", "אני גר בדירה...", "גר בדירה שתיים"
  const aptMatch = stripped.match(/(?:בדירה|דירה)\s+([א-ת0-9]+)/);
  if (aptMatch) {
    slots.apartment = aptMatch[1];
  } else if (
    stripped.includes('גר בדירה') ||
    stripped.includes('גרה בדירה') ||
    stripped.includes('שתיים') ||
    stripped.includes('חמש') ||
    stripped.includes('ארבע') ||
    stripped.includes('שלוש')
  ) {
    const numMatch = stripped.match(/(?:גר|גרה|אני)?\s*(?:בדירה|בבית|ב)?\s*(אחת|שתיים|שלוש|ארבע|חמש|שש|שבע|שמונה|תשע|עשר|[1-9])/);
    if (numMatch && numMatch[1]) {
      slots.apartment = numMatch[1];
    }
  }

  // 4. Кофе / Сахар (Coffee / Sugar slots)
  if (stripped.includes('בלי סוכר') || stripped.includes('ללא סוכר')) {
    slots.coffee_sugar = 'בְּלִי סוּכָּר';
  } else if (stripped.includes('עם סוכר') || stripped.includes('אחד סוכר') || stripped.includes('שני סוכר')) {
    slots.coffee_sugar = 'עִם סוּכָּר';
  }

  // 5. Размер порции (Coffee / Food Size slot)
  if (stripped.includes('גדול') || stripped.includes('גדולה')) {
    slots.coffee_size = 'גָּדוֹל';
  } else if (stripped.includes('קטן') || stripped.includes('קטנה')) {
    slots.coffee_size = 'קָטָן';
  } else if (stripped.includes('בינוני')) {
    slots.coffee_size = 'בֵּינוֹנִי';
  }

  // 6. Молоко (Milk slot)
  if (stripped.includes('חלב סויה')) {
    slots.coffee_milk = 'חֲלַב סוֹיָה';
  } else if (stripped.includes('שיבולת שועל')) {
    slots.coffee_milk = 'שִׁבּוֹלֶת שׁוּעָל';
  } else if (stripped.includes('בלי חלב')) {
    slots.coffee_milk = 'בְּלִי חָלָב';
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
Подтверди услышанную деталь и задай следующий вопрос ТОЛЬКО о незакрытых пунктах ситуации!
`;
}

/**
 * Детерминированный предохранитель (Guardrail) на выходе:
 * если нейросеть всё же сгенерировала запрещенный вопрос по закрытому слоту,
 * аккуратно вырезает его из иврита, транскрипции и перевода.
 */
export function filterRepeatedSlotQuestions(
  reply: { hebrew: string; transcription: string; translation: string },
  slots: ClosedSlots
): { hebrew: string; transcription: string; translation: string } {
  let { hebrew, transcription, translation } = reply;

  if (slots.name) {
    // Вырезаем «איך קוראים לך / לך?» или «מה שמך?»
    const nameQuestionsHeb = [
      /אֵ?יךְ?\s+קוֹ?רְ?אִ?ים\s+לְ?ךָ\??/gi,
      /אֵ?יךְ?\s+קוֹ?רְ?אִ?ים\s+לָ?ךְ\??/gi,
      /מָ?ה\s+שִׁ?מְ?ךָ\??/gi,
      /מָ?ה\s+שְׁ?מֵ?ךְ\??/gi,
      /מִ?י\s+זֶ?ה\??/gi,
    ];

    for (const regex of nameQuestionsHeb) {
      hebrew = hebrew.replace(regex, '').trim();
    }

    // Вырезаем транскрипцию вопроса об имени
    transcription = transcription
      .replace(/эйх\s+кор[ъь]?ӣм\s+(?:лэхá|лах)\??/gi, '')
      .replace(/э́йх\s+кор[ъь]?ӣм\s+(?:лэха́|лах)\??/gi, '')
      .replace(/ма\s+шимхá\??/gi, '')
      .trim();

    // Вырезаем перевод вопроса об имени
    translation = translation
      .replace(/как\s+тебя\s+зовут\??/gi, '')
      .replace(/как\s+вас\s+зовут\??/gi, '')
      .replace(/кто\s+это\??/gi, '')
      .trim();
  }

  if (slots.coffee_sugar) {
    // Вырезаем вопрос о сахаре
    hebrew = hebrew
      .replace(/עִ?ם\s+סוּ?כָּ?ר\??/gi, '')
      .replace(/כַּ?מָּ?ה\s+סוּ?כָּ?ר\??/gi, '')
      .replace(/וְ?עִ?ם\s+סוּ?כָּ?ר\??/gi, '')
      .trim();

    transcription = transcription
      .replace(/(?:вэ-)?им\s+сукáр\??/gi, '')
      .replace(/кáма\s+сукáр\??/gi, '')
      .trim();

    translation = translation
      .replace(/(?:и\s+)?с\s+сахаром\??/gi, '')
      .replace(/сколько\s+сахара\??/gi, '')
      .trim();
  }

  // Убираем двойные пробелы и висячие знаки препинания после вырезания
  hebrew = hebrew.replace(/\s{2,}/g, ' ').replace(/\s+([.?!,])/g, '$1').trim();
  transcription = transcription.replace(/\s{2,}/g, ' ').replace(/\s+([.?!,])/g, '$1').trim();
  translation = translation.replace(/\s{2,}/g, ' ').replace(/\s+([.?!,])/g, '$1').trim();

  return { hebrew, transcription, translation };
}
