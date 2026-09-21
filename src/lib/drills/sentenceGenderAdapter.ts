import { stripNikkud } from '../transcription';
import { VERB_CONJUGATIONS_DATABASE } from '../verbConjugations/database';

export type SentenceGenderCategory =
  | 'first_person'
  | 'second_person_m'
  | 'second_person_f'
  | 'third_person_m'
  | 'third_person_f'
  | 'neutral';

export interface SentenceGenderVariant {
  sentenceHe: string;
  sentenceTranscription: string;
}

export interface SentenceGenderInfo {
  category: SentenceGenderCategory;
  isGenderSensitive: boolean; // требует ли разных версий для мужчин и женщин
  defaultVoice: 'he-IL-AvriNeural' | 'he-IL-HilaNeural';
  femaleVariant?: SentenceGenderVariant;
}

// Кэш соответствий мужских и женских форм глаголов настоящего времени из Pealim SSOT
let verbPresentMap: Map<string, { mHe: string; fHe: string; mTrans: string; fTrans: string }> | null = null;

function getVerbPresentMap() {
  if (verbPresentMap) return verbPresentMap;
  verbPresentMap = new Map();

  for (const [infinitive, conj] of Object.entries(VERB_CONJUGATIONS_DATABASE)) {
    if (conj?.present && conj.present[0] && conj.present[1]) {
      const mForm = conj.present[0].hebrew?.trim();
      const fForm = conj.present[1].hebrew?.trim();
      const mTrans = conj.present[0].transcription?.trim() || '';
      const fTrans = conj.present[1].transcription?.trim() || '';

      if (mForm && fForm) {
        const plainM = stripNikkud(mForm);
        // Сохраняем по голому тексту мужской формы
        verbPresentMap.set(plainM, {
          mHe: mForm,
          fHe: fForm,
          mTrans,
          fTrans,
        });
      }
    }
  }

  return verbPresentMap;
}

// Дополнительные регулярные пары прилагательных и местоимений для 1-го и 2-го лица
const ADJECTIVE_PAIRS: Record<string, { mHe: string; fHe: string; mTrans: string; fTrans: string }> = {
  עייף: { mHe: 'עָיֵף', fHe: 'עֲיֵפָה', mTrans: 'айе́ф', fTrans: 'айефа́' },
  שמח: { mHe: 'שָׂמֵחַ', fHe: 'שְׂמֵחָה', mTrans: 'самэ́ах', fTrans: 'смэха́' },
  מוכן: { mHe: 'מוּכָן', fHe: 'מוּכָנָה', mTrans: 'муха́н', fTrans: 'мухана́' },
  עצוב: { mHe: 'עָצוּב', fHe: 'עֲצוּבָה', mTrans: 'ацу́в', fTrans: 'ацува́' },
  רעב: { mHe: 'רָעֵב', fHe: 'רְעֵבָה', mTrans: 'раэ́в', fTrans: 'рээва́' },
  צמא: { mHe: 'צָמֵא', fHe: 'צְמֵאָה', mTrans: 'цамэ́', fTrans: 'цмэа́' },
};

function formatFeminineTranscription(trans: string, fHe?: string): string {
  if (!trans) return trans;
  if (/[́\u0301]/.test(trans)) return trans;

  // Segolate feminine verbs ending in -et or -at (penultimate stress)
  if (trans.endsWith('ет') || trans.endsWith('ат')) {
    const vowels = ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я'];
    const chars = trans.split('');
    let vowelCount = 0;
    for (let i = chars.length - 1; i >= 0; i--) {
      if (vowels.includes(chars[i].toLowerCase())) {
        vowelCount++;
        if (vowelCount === 2) {
          chars[i] = chars[i] + '\u0301';
          return chars.join('');
        }
      }
    }
  }

  // Feminine ending in -a (milra, ultimate stress)
  if (trans.endsWith('а')) {
    return trans.slice(0, -1) + 'а́';
  }

  return trans;
}

export function replaceCyrillicWord(text: string, targetWord: string, replacement: string): string {
  if (!text || !targetWord) return text;

  let patternStr = '';
  const cleanTarget = targetWord
    .replace(/[\u0300-\u036f\u0027\u02bć]/g, '')
    .toLowerCase();

  for (const ch of cleanTarget) {
    if (ch === 'а' || ch === 'a') {
      patternStr += '[аa\\u00e1АA\\u00c1][\\u0300-\\u036f́]*';
    } else if (ch === 'е' || ch === 'э' || ch === 'e') {
      patternStr += '[еэe\\u00e9ЕЭE\\u00c9][\\u0300-\\u036f́]*';
    } else if (ch === 'и' || ch === 'ӣ' || ch === 'i') {
      patternStr += '[иӣi\\u00edИӢI\\u00cd][\\u0300-\\u036f́]*';
    } else if (ch === 'о' || ch === 'o') {
      patternStr += '[оo\\u00f3ОO\\u00d3][\\u0300-\\u036f́]*';
    } else if (ch === 'у' || ch === 'u') {
      patternStr += '[уu\\u00faУU\\u00da][\\u0300-\\u036f́]*';
    } else {
      patternStr += ch + '[\\u0300-\\u036f́]*';
    }
  }

  const pattern = new RegExp(
    `(^|[\\s.,!?;:"'«»()—–])(${patternStr}[а-яёА-ЯЁa-zA-Z\\u00c0-\\u00ff\\u0300-\\u036f́]*)(?=$|[\\s.,!?;:"'«»()—–])`,
    'i'
  );

  return text.replace(pattern, (_match, prefix) => prefix + replacement);
}

/**
 * Определяет грамматический род / категорию лица предложения и возвращает женскую пару
 */
export function getSentenceGenderInfo(
  sentenceHe: string,
  sentenceTranscription: string = ''
): SentenceGenderInfo {
  const plain = stripNikkud(sentenceHe).trim();
  const vMap = getVerbPresentMap();

  // 1. ПЕРВОЕ ЛИЦО: "אני ..." (говорящий — сам ученик)
  const isFirstPerson = plain.startsWith('אני ') || plain.includes(' אני ');
  if (isFirstPerson) {
    const tokens = sentenceHe.split(' ');
    let femaleTokens = [...tokens];
    let femaleTrans = sentenceTranscription;
    let foundPair = false;

    for (let i = 0; i < tokens.length; i++) {
      const rawToken = tokens[i].replace(/[.,!?;:"'״׳]/g, '');
      const plainToken = stripNikkud(rawToken);

      // Проверяем глагол настоящего времени
      const vMatch = vMap.get(plainToken);
      if (vMatch && vMatch.mHe !== vMatch.fHe) {
        // Подставляем женскую форму с сохранением пунктуации
        const punct = tokens[i].slice(rawToken.length);
        femaleTokens[i] = vMatch.fHe + punct;

        // Обновляем транскрипцию
        if (femaleTrans) {
          const fTransAccented = formatFeminineTranscription(vMatch.fTrans, vMatch.fHe);
          femaleTrans = replaceCyrillicWord(femaleTrans, vMatch.mTrans, fTransAccented);
        }
        foundPair = true;
        break;
      }

      // Проверяем прилагательное
      const adjMatch = ADJECTIVE_PAIRS[plainToken];
      if (adjMatch) {
        const punct = tokens[i].slice(rawToken.length);
        femaleTokens[i] = adjMatch.fHe + punct;
        if (femaleTrans) {
          femaleTrans = replaceCyrillicWord(femaleTrans, adjMatch.mTrans, adjMatch.fTrans);
        }
        foundPair = true;
        break;
      }
    }

    if (foundPair) {
      return {
        category: 'first_person',
        isGenderSensitive: true,
        defaultVoice: 'he-IL-AvriNeural',
        femaleVariant: {
          sentenceHe: femaleTokens.join(' '),
          sentenceTranscription: femaleTrans,
        },
      };
    }

    return {
      category: 'first_person',
      isGenderSensitive: false, // Напр. прошедшее время "אני רציתי" (одинаково для м/ж)
      defaultVoice: 'he-IL-AvriNeural',
    };
  }

  // 2. ВТОРОЕ ЛИЦО: "אתה ..." vs "את ..." (обращение к собеседнику)
  const isSecondPersonM = plain.startsWith('אתה ') || plain.includes(' אתה ');
  if (isSecondPersonM) {
    const tokens = sentenceHe.split(' ');
    let femaleTokens = [...tokens];
    let femaleTrans = sentenceTranscription;

    for (let i = 0; i < femaleTokens.length; i++) {
      const rawToken = femaleTokens[i].replace(/[.,!?;:"'״׳]/g, '');
      const plainToken = stripNikkud(rawToken);

      if (plainToken === 'אתה') {
        const punct = femaleTokens[i].slice(rawToken.length);
        femaleTokens[i] = 'אַתְּ' + punct;
        if (femaleTrans) {
          femaleTrans = replaceCyrillicWord(femaleTrans, 'ата', 'ат');
        }
      } else {
        const vMatch = vMap.get(plainToken);
        if (vMatch) {
          const punct = femaleTokens[i].slice(rawToken.length);
          femaleTokens[i] = vMatch.fHe + punct;
          if (femaleTrans) {
            const fTransAccented = formatFeminineTranscription(vMatch.fTrans, vMatch.fHe);
            femaleTrans = replaceCyrillicWord(femaleTrans, vMatch.mTrans, fTransAccented);
          }
        }
      }
    }

    return {
      category: 'second_person_m',
      isGenderSensitive: true,
      defaultVoice: 'he-IL-AvriNeural',
      femaleVariant: {
        sentenceHe: femaleTokens.join(' '),
        sentenceTranscription: femaleTrans,
      },
    };
  }

  const isSecondPersonF = plain.startsWith('את ') || plain.includes(' את ');
  if (isSecondPersonF) {
    return {
      category: 'second_person_f',
      isGenderSensitive: false,
      defaultVoice: 'he-IL-HilaNeural',
    };
  }

  // 3. ТРЕТЬЕ ЛИЦО ЖЕНСКИЙ РОД (Она, Сара, Мама, Девочка)
  if (
    plain.startsWith('היא ') ||
    plain.startsWith('שרה ') ||
    plain.startsWith('אמא ') ||
    plain.startsWith('רחל ') ||
    plain.startsWith('הילדה ') ||
    plain.startsWith('המורה ') ||
    plain.includes(' היא ')
  ) {
    return {
      category: 'third_person_f',
      isGenderSensitive: false,
      defaultVoice: 'he-IL-HilaNeural',
    };
  }

  // 4. ТРЕТЬЕ ЛИЦО МУЖСКОЙ РОД (Он, Давид, Мальчик)
  if (
    plain.startsWith('הוא ') ||
    plain.startsWith('דוד ') ||
    plain.startsWith('יוסי ') ||
    plain.startsWith('הילד ') ||
    plain.includes(' הוא ')
  ) {
    return {
      category: 'third_person_m',
      isGenderSensitive: false,
      defaultVoice: 'he-IL-AvriNeural',
    };
  }

  // 5. НЕЙТРАЛЬНЫЕ / БЕЗЛИЧНЫЕ
  return {
    category: 'neutral',
    isGenderSensitive: false,
    defaultVoice: 'he-IL-AvriNeural',
  };
}

/**
 * Адаптирует предложение и транскрипцию под выбранный пол ученика ('male' | 'female')
 */
export function adaptSentenceForGender(
  sentenceHe: string,
  sentenceTranscription: string,
  gender: 'male' | 'female' = 'male'
): { sentenceHe: string; sentenceTranscription: string } {
  if (gender === 'male') {
    return { sentenceHe, sentenceTranscription };
  }

  const info = getSentenceGenderInfo(sentenceHe, sentenceTranscription);
  if (info.isGenderSensitive && info.femaleVariant) {
    return {
      sentenceHe: info.femaleVariant.sentenceHe,
      sentenceTranscription: info.femaleVariant.sentenceTranscription,
    };
  }

  return { sentenceHe, sentenceTranscription };
}
