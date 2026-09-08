import { ScriptedDialogueTurn, GenderVariant } from '@/types';

/**
 * Получение варианта реплики в зависимости от пола говорящего и слушающего:
 * speakerGender: пол того, кто произносит реплику ('male' | 'female')
 * listenerGender: пол того, к кому обращаются ('male' | 'female')
 */
export function getDialogueTurnVariant(
  turn: ScriptedDialogueTurn,
  speakerGender: 'male' | 'female',
  listenerGender: 'male' | 'female'
): GenderVariant {
  const key = `${speakerGender === 'male' ? 'm' : 'f'}${listenerGender === 'male' ? 'm' : 'f'}` as 'mm' | 'mf' | 'fm' | 'ff';
  return turn.variants[key] || turn.variants.mm;
}

/**
 * Вспомогательная функция сборки реплики с явными или вычисляемыми вариантами родов
 */
export function makeTurn(
  id: string,
  speaker: 'a' | 'b',
  intentRu: string,
  defaultVariant: GenderVariant,
  customVariants?: Partial<{
    mm: GenderVariant;
    mf: GenderVariant;
    fm: GenderVariant;
    ff: GenderVariant;
  }>,
  acceptableKeywords?: string[],
  sampleVariations?: string[]
): ScriptedDialogueTurn {
  const mm = customVariants?.mm || defaultVariant;
  const mf = customVariants?.mf || mm;
  const fm = customVariants?.fm || defaultVariant;
  const ff = customVariants?.ff || customVariants?.fm || mf;

  return {
    id,
    speaker,
    intentRu,
    acceptableKeywords: acceptableKeywords || [],
    sampleVariations: sampleVariations || [],
    variants: { mm, mf, fm, ff },
  };
}

/**
 * Автоматический синтез грамматических вариантов по родам (mm, mf, fm, ff)
 * на базе текста, суффиксов и ключевых форм глаголов
 */
export function adaptSentenceForGenders(
  hebrew: string,
  transcription: string,
  translation: string
): {
  mm: GenderVariant;
  mf: GenderVariant;
  fm: GenderVariant;
  ff: GenderVariant;
} {
  const base = { hebrew, transcription, translation };

  // Если в строке переданы варианты через слэш "מְדַבֵּר / מְדַבֶּרֶת"
  if (hebrew.includes('/')) {
    const partsHe = hebrew.split('/').map((s) => s.trim());
    const partsTr = transcription.split('/').map((s) => s.trim());
    const partsRu = translation.split('/').map((s) => s.trim());

    const mHe = partsHe[0] || hebrew;
    const fHe = partsHe[1] || partsHe[0] || hebrew;
    const mTr = partsTr[0] || transcription;
    const fTr = partsTr[1] || partsTr[0] || transcription;
    const mRu = partsRu[0] || translation;
    const fRu = partsRu[1] || partsRu[0] || translation;

    return {
      mm: { hebrew: mHe, transcription: mTr, translation: mRu },
      mf: { hebrew: mHe, transcription: mTr, translation: mRu },
      fm: { hebrew: fHe, transcription: fTr, translation: fRu },
      ff: { hebrew: fHe, transcription: fTr, translation: fRu },
    };
  }

  // Обращение ко 2-му лицу (зависит от listenerGender)
  const isSecondPerson =
    hebrew.includes('אַתָּה') ||
    hebrew.includes('אַתְּ') ||
    hebrew.includes('לְךָ') ||
    hebrew.includes('לָךְ') ||
    hebrew.includes('אִתְּךָ') ||
    hebrew.includes('אִתָּךְ') ||
    hebrew.includes('שֶׁלְּךָ') ||
    hebrew.includes('שֶׁלָּךְ') ||
    hebrew.includes('תִּרְצֶה') ||
    hebrew.includes('תִּרְצִי') ||
    hebrew.includes('תַּעֲשֶׂה') ||
    hebrew.includes('תַּעֲשִׂי') ||
    hebrew.includes('תֵּלֵךְ') ||
    hebrew.includes('תֵּלְכִי') ||
    hebrew.includes('תִּפְנֶה') ||
    hebrew.includes('תִּפְנִי');

  if (isSecondPerson) {
    const toFemaleHe = hebrew
      .replace(/לְךָ/g, 'לָךְ')
      .replace(/אַתָּה/g, 'אַתְּ')
      .replace(/אִתְּךָ/g, 'אִתָּךְ')
      .replace(/שֶׁלְּךָ/g, 'שֶׁלָּךְ')
      .replace(/תִּרְצֶה/g, 'תִּרְצִי')
      .replace(/תַּעֲשֶׂה/g, 'תַּעֲשִׂי')
      .replace(/תֵּלֵךְ/g, 'תֵּלְכִי')
      .replace(/תִּפְנֶה/g, 'תִּפְנִי');

    const toFemaleTr = transcription
      .replace(/лэхá/g, 'лах')
      .replace(/атá/g, 'ат')
      .replace(/итхá/g, 'итáх')
      .replace(/шельхá/g, 'шелáх')
      .replace(/тирцé/g, 'тирцӣ');

    const toFemaleRu = translation
      .replace(/\(к мужчине\)/g, '(к женщине)')
      .replace(/ты сам/g, 'ты сама')
      .replace(/твой/g, 'твоя');

    return {
      mm: base,
      mf: { hebrew: toFemaleHe, transcription: toFemaleTr, translation: toFemaleRu },
      fm: base,
      ff: { hebrew: toFemaleHe, transcription: toFemaleTr, translation: toFemaleRu },
    };
  }

  // 1-е лицо (зависит от speakerGender)
  const isFirstPerson =
    hebrew.includes('אֲנִי') ||
    hebrew.includes('רוֹצֶה') ||
    hebrew.includes('מְדַבֵּר') ||
    hebrew.includes('גָּר ') ||
    hebrew.includes('עוֹבֵד') ||
    hebrew.includes('לוֹמֵד') ||
    hebrew.includes('נוֹסֵעַ') ||
    hebrew.includes('מְחַפֵּשׂ') ||
    hebrew.includes('יוֹדֵעַ');

  if (isFirstPerson) {
    const femaleSpeakerHe = hebrew
      .replace(/רוֹצֶה/g, 'רוֹצָה')
      .replace(/מְדַבֵּר/g, 'מְדַבֶּרֶת')
      .replace(/גָּר /g, 'גָּרָה ')
      .replace(/עוֹבֵד/g, 'עוֹבֶדֶת')
      .replace(/לוֹמֵד/g, 'לוֹמֶדֶת')
      .replace(/נוֹסֵעַ/g, 'נוֹסַעַת')
      .replace(/מְחַפֵּשׂ/g, 'מְחַפֶּשֶׂת')
      .replace(/יוֹדֵעַ/g, 'יוֹדַעַת');

    const femaleSpeakerTr = transcription
      .replace(/роцé/g, 'роцá')
      .replace(/мэдабэ́р/g, 'мэдабэ́рэт')
      .replace(/гар /g, 'гарá ')
      .replace(/овэ́д/g, 'овэ́дэт')
      .replace(/ломэ́д/g, 'ломэ́дэт')
      .replace(/носэ́а/g, 'носáат')
      .replace(/мэхапэ́с/g, 'мэхапэ́сет')
      .replace(/йодэ́а/g, 'йодáат');

    const femaleSpeakerRu = translation
      .replace(/\(мужчина\)/g, '(женщина)')
      .replace(/я готов\b/g, 'я готова')
      .replace(/я рад\b/g, 'я рада');

    return {
      mm: base,
      mf: base,
      fm: { hebrew: femaleSpeakerHe, transcription: femaleSpeakerTr, translation: femaleSpeakerRu },
      ff: { hebrew: femaleSpeakerHe, transcription: femaleSpeakerTr, translation: femaleSpeakerRu },
    };
  }

  return { mm: base, mf: base, fm: base, ff: base };
}
