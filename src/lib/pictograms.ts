import { stripNikkud } from './transcription';

export interface PictogramDetails {
  icon: string;
  gender: 'male' | 'female' | 'both' | null;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeLabel?: string;
}

/**
 * Словарь пиктограмм для прямого визуального восприятия слов и грамматики
 * без использования языка-посредника (Методика Ульпана עברית בעברית).
 * 
 * Цветовое кодирование:
 * - ♂ Мужской род (זָכָר) -> Голубой / Sky Blue
 * - ♀ Женский род (נְקֵבָה) -> Розовый / Rose
 * - ⚥ Общий / 1-е лицо -> Индиго / Фиолетовый
 */
export const HEBREW_PICTOGRAM_MAP: Record<string, { icon: string; gender?: 'male' | 'female' | 'both' }> = {
  // ─── 1. Местоимения (Pronouns & Demonstratives) ───────────────────────────
  'אני': { icon: '🙋', gender: 'both' },
  'אתה': { icon: '👉 ♂', gender: 'male' },
  'את': { icon: '👉 ♀', gender: 'female' },
  'הוא': { icon: '👤 ♂', gender: 'male' },
  'היא': { icon: '👤 ♀', gender: 'female' },
  'אנחנו': { icon: '👥', gender: 'both' },
  'אתם': { icon: '👥 ♂', gender: 'male' },
  'אתן': { icon: '👥 ♀', gender: 'female' },
  'הם': { icon: '👥 ♂', gender: 'male' },
  'הן': { icon: '👥 ♀', gender: 'female' },
  'זה': { icon: '👉 ♂', gender: 'male' },
  'זאת': { icon: '👉 ♀', gender: 'female' },
  'זו': { icon: '👉 ♀', gender: 'female' },
  'אלה': { icon: '👉 👥', gender: 'both' },
  'אלו': { icon: '👉 👥', gender: 'both' },

  // ─── 2. Вопросительные слова (Question words) ─────────────────────────────
  'מה': { icon: '❓' },
  'מי': { icon: '👤❓' },
  'איפה': { icon: '📍❓' },
  'מאין': { icon: '🗺️❓' },
  'מאיפה': { icon: '🗺️❓' },
  'לאן': { icon: '➡️❓' },
  'מתי': { icon: '⏰❓' },
  'למה': { icon: '💡❓' },
  'כמה': { icon: '🔢❓' },
  'איך': { icon: '❓' },
  'איזה': { icon: '🔍 ♂', gender: 'male' },
  'איזו': { icon: '🔍 ♀', gender: 'female' },
  'אילו': { icon: '🔍 👥', gender: 'both' },

  // ─── 3. Фразы знакомства и диалогов (Dialogue & Situational Phrases) ─────
  'איך קוראים לך': { icon: '🪪❓' },
  'איך קוראים לה': { icon: '🪪 ♀❓', gender: 'female' },
  'איך קוראים לו': { icon: '🪪 ♂❓', gender: 'male' },
  'מה שמך': { icon: '🪪❓' },
  'קוראים לי': { icon: '🪪' },
  'שמי': { icon: '🪪' },
  'שלום קוראים לי': { icon: '👋 🪪' },
  'שלום אני': { icon: '👋 🙋' },
  'נעים מאוד': { icon: '🤝' },
  'נעים להכיר': { icon: '🤝' },
  'מה נשמע': { icon: '💬❓' },
  'מה שלומך': { icon: '💬❓' },
  'מה קורה': { icon: '💬❓' },
  'מה העניינים': { icon: '💬❓' },
  'מה חדש': { icon: '💬❓' },
  'הכל טוב': { icon: '👍' },
  'הכל בסדר': { icon: '👍' },
  'יופי': { icon: '🌟' },
  'מצוין': { icon: '💯' },
  'מעולה': { icon: '🌟' },
  'איפה אתה גר': { icon: '🏠 ♂❓', gender: 'male' },
  'איפה את גרה': { icon: '🏠 ♀❓', gender: 'female' },
  'אני גר ב': { icon: '🏠 ♂', gender: 'male' },
  'אני גרה ב': { icon: '🏠 ♀', gender: 'female' },
  'מאיפה אתה': { icon: '🗺️ ♂❓', gender: 'male' },
  'מאיפה את': { icon: '🗺️ ♀❓', gender: 'female' },
  'מאין אתה': { icon: '🗺️ ♂❓', gender: 'male' },
  'מאין את': { icon: '🗺️ ♀❓', gender: 'female' },
  'אני מ': { icon: '🗺️' },
  'אני רוצה': { icon: '💭' },
  'אני רוצה בבקשה': { icon: '💭' },
  'כמה זה עולה': { icon: '🏷️' },
  'כמה עולה': { icon: '🏷️' },
  'אפשר חשבון': { icon: '🧾' },
  'חשבון בבקשה': { icon: '🧾' },
  'מה השעה': { icon: '⏰❓' },
  'סליחה איפה': { icon: '📍❓' },
  'איך מגיעים': { icon: '🗺️➡️' },
  'ישר ואז שמאלה': { icon: '⬆️⬅️' },
  'ישר ואז ימינה': { icon: '⬆️➡️' },
  'יום הולדת שמח': { icon: '🎂🎉' },
  'שבת שלום': { icon: '🕯️🍷' },
  'חג שמח': { icon: '🎉🕊️' },
  'שנה טובה': { icon: '🍎🍯' },
  'נסיעה טובה': { icon: '✈️🛣️' },
  'רפואה שלמה': { icon: '🩺🩹' },
  'כל הכבוד': { icon: '👏' },
  'ברוך הבא': { icon: '🚪 ♂', gender: 'male' },
  'ברוכה הבאה': { icon: '🚪 ♀', gender: 'female' },
  'ברוכים הבאים': { icon: '🚪 👥 ♂', gender: 'male' },
  'ברוכות הבאות': { icon: '🚪 👥 ♀', gender: 'female' },
  'להתראות': { icon: '👋' },
  'שלום': { icon: '👋' },
  'בוקר טוב': { icon: '🌅' },
  'צהריים טובים': { icon: '☀️🍽️' },
  'ערב טוב': { icon: '🌆' },
  'לילה טוב': { icon: '🌙⭐' },
  'תודה': { icon: '🙏' },
  'תודה רבה': { icon: '🙏' },
  'בבקשה': { icon: '🤝' },
  'סליחה': { icon: '🙇' },
  'בהצלחה': { icon: '🎯' },
  'בתיאבון': { icon: '🍽️' },
  'לרוויה': { icon: '🥤' },
  'מזל טוב': { icon: '🎂' },
  'כן': { icon: '✅' },
  'לא': { icon: '❌' },
  'בסדר': { icon: '👌' },

  // ─── 4. Глаголы (Verbs) ───────────────────────────────────────────────────
  'רוצה': { icon: '💭' },
  'רוצים': { icon: '💭 👥 ♂', gender: 'male' },
  'רוצות': { icon: '💭 👥 ♀', gender: 'female' },
  'שותה': { icon: '🥤' },
  'שותים': { icon: '🥤 👥 ♂', gender: 'male' },
  'שותות': { icon: '🥤 👥 ♀', gender: 'female' },
  'אוכל': { icon: '🍽️ ♂', gender: 'male' },
  'אוכלת': { icon: '🍽️ ♀', gender: 'female' },
  'אוכלים': { icon: '🍽️ 👥 ♂', gender: 'male' },
  'אוכלות': { icon: '🍽️ 👥 ♀', gender: 'female' },
  'גר': { icon: '🏠 ♂', gender: 'male' },
  'גרה': { icon: '🏠 ♀', gender: 'female' },
  'גרים': { icon: '🏠 👥 ♂', gender: 'male' },
  'גרות': { icon: '🏠 👥 ♀', gender: 'female' },
  'מדבר': { icon: '🗣️ ♂', gender: 'male' },
  'מדברת': { icon: '🗣️ ♀', gender: 'female' },
  'מדברים': { icon: '🗣️ 👥 ♂', gender: 'male' },
  'מדברות': { icon: '🗣️ 👥 ♀', gender: 'female' },
  'לומד': { icon: '📚 ♂', gender: 'male' },
  'לומדת': { icon: '📚 ♀', gender: 'female' },
  'לומדים': { icon: '📚 👥 ♂', gender: 'male' },
  'לומדות': { icon: '📚 👥 ♀', gender: 'female' },
  'עובד': { icon: '💼 ♂', gender: 'male' },
  'עובדת': { icon: '💼 ♀', gender: 'female' },
  'עובדים': { icon: '💼 👥 ♂', gender: 'male' },
  'עובדות': { icon: '💼 👥 ♀', gender: 'female' },
  'הולך': { icon: '🚶 ♂', gender: 'male' },
  'הולכת': { icon: '🚶 ♀', gender: 'female' },
  'הולכים': { icon: '🚶 👥 ♂', gender: 'male' },
  'הולכות': { icon: '🚶 👥 ♀', gender: 'female' },
  'בא': { icon: '🏃 ♂', gender: 'male' },
  'באה': { icon: '🏃 ♀', gender: 'female' },
  'באים': { icon: '🏃 👥 ♂', gender: 'male' },
  'באות': { icon: '🏃 👥 ♀', gender: 'female' },
  'רץ': { icon: '🏃 ♂', gender: 'male' },
  'רצה': { icon: '🏃 ♀', gender: 'female' },
  'נוסע': { icon: '🚗 ♂', gender: 'male' },
  'נוסעת': { icon: '🚗 ♀', gender: 'female' },
  'נוסעים': { icon: '🚗 👥 ♂', gender: 'male' },
  'נוסעות': { icon: '🚗 👥 ♀', gender: 'female' },
  'יודע': { icon: '💡 ♂', gender: 'male' },
  'יודעת': { icon: '💡 ♀', gender: 'female' },
  'יודעים': { icon: '💡 👥 ♂', gender: 'male' },
  'יודעות': { icon: '💡 👥 ♀', gender: 'female' },
  'מבין': { icon: '🧠 ♂', gender: 'male' },
  'מבינה': { icon: '🧠 ♀', gender: 'female' },
  'מבינים': { icon: '🧠 👥 ♂', gender: 'male' },
  'מבינות': { icon: '🧠 👥 ♀', gender: 'female' },
  'אוהב': { icon: '❤️ ♂', gender: 'male' },
  'אוהבת': { icon: '❤️ ♀', gender: 'female' },
  'אוהבים': { icon: '❤️ 👥 ♂', gender: 'male' },
  'אוהבות': { icon: '❤️ 👥 ♀', gender: 'female' },
  'קורא': { icon: '📖 ♂', gender: 'male' },
  'קוראת': { icon: '📖 ♀', gender: 'female' },
  'קוראים': { icon: '📖 👥 ♂', gender: 'male' },
  'קוראות': { icon: '📖 👥 ♀', gender: 'female' },
  'כותב': { icon: '✍️ ♂', gender: 'male' },
  'כותבת': { icon: '✍️ ♀', gender: 'female' },
  'כותבים': { icon: '✍️ 👥 ♂', gender: 'male' },
  'כותבות': { icon: '✍️ 👥 ♀', gender: 'female' },
  'שומע': { icon: '👂 ♂', gender: 'male' },
  'שומעת': { icon: '👂 ♀', gender: 'female' },
  'שומעים': { icon: '👂 👥 ♂', gender: 'male' },
  'רואה': { icon: '👀' },
  'רואים': { icon: '👀 👥 ♂', gender: 'male' },
  'עושה': { icon: '⚙️' },
  'עושים': { icon: '⚙️ 👥 ♂', gender: 'male' },
  'קונה': { icon: '🛍️' },
  'קונים': { icon: '🛍️ 👥 ♂', gender: 'male' },
  'מבקש': { icon: '🙏 ♂', gender: 'male' },
  'מבקשת': { icon: '🙏 ♀', gender: 'female' },
  'צריך': { icon: '⚠️ ♂', gender: 'male' },
  'צריכה': { icon: '⚠️ ♀', gender: 'female' },
  'צריכים': { icon: '⚠️ 👥 ♂', gender: 'male' },
  'צריכות': { icon: '⚠️ 👥 ♀', gender: 'female' },
  'יכול': { icon: '💪 ♂', gender: 'male' },
  'יכולה': { icon: '💪 ♀', gender: 'female' },
  'יכולים': { icon: '💪 👥 ♂', gender: 'male' },
  'יכולות': { icon: '💪 👥 ♀', gender: 'female' },
  'ישן': { icon: '😴' },
  'שר': { icon: '🎵' },
  'מבשל': { icon: '🍳' },
  'משלם': { icon: '💳' },
  'מקבל': { icon: '🎁' },

  // ─── 5. Еда и напитки (Food & Drinks) ─────────────────────────────────────
  'קפה': { icon: '☕' },
  'תה': { icon: '🫖' },
  'מים': { icon: '💧' },
  'חלב': { icon: '🥛' },
  'סוכר': { icon: '🧂' },
  'עוגה': { icon: '🍰 ♀', gender: 'female' },
  'לחם': { icon: '🍞 ♂', gender: 'male' },
  'פיתה': { icon: '🫓 ♀', gender: 'female' },
  'סלט': { icon: '🥗 ♂', gender: 'male' },
  'סנדוויץ': { icon: '🥪 ♂', gender: 'male' },
  'כריך': { icon: '🥪 ♂', gender: 'male' },
  'פיצה': { icon: '🍕 ♀', gender: 'female' },
  'גבינה': { icon: '🧀 ♀', gender: 'female' },
  'ביצה': { icon: '🥚 ♀', gender: 'female' },
  'בשר': { icon: '🥩 ♂', gender: 'male' },
  'עוף': { icon: '🍗 ♂', gender: 'male' },
  'דג': { icon: '🐟 ♂', gender: 'male' },
  'תפוח': { icon: '🍎 ♂', gender: 'male' },
  'בננה': { icon: '🍌 ♀', gender: 'female' },
  'תפוז': { icon: '🍊 ♂', gender: 'male' },
  'מיץ': { icon: '🧃 ♂', gender: 'male' },
  'יין': { icon: '🍷 ♂', gender: 'male' },
  'בירה': { icon: '🍺 ♀', gender: 'female' },
  'מרק': { icon: '🍲 ♂', gender: 'male' },
  'חומוס': { icon: '🥣 ♂', gender: 'male' },
  'טחינה': { icon: '🫒 ♀', gender: 'female' },
  'פלאפל': { icon: '🧆 ♂', gender: 'male' },
  'שוקולד': { icon: '🍫 ♂', gender: 'male' },
  'גלידה': { icon: '🍦 ♀', gender: 'female' },
  'ארוחת בוקר': { icon: '🍳☕' },
  'ארוחת צהריים': { icon: '🍲🥗' },
  'ארוחת ערב': { icon: '🥪🍵' },
  'חשבון': { icon: '🧾 ♂', gender: 'male' },

  // ─── 6. Места и транспорт (Places & Transport) ────────────────────────────
  'בית': { icon: '🏠 ♂', gender: 'male' },
  'דירה': { icon: '🏢 ♀', gender: 'female' },
  'חדר': { icon: '🚪 ♂', gender: 'male' },
  'בית קפה': { icon: '☕ ♂', gender: 'male' },
  'מסעדה': { icon: '🍽️ ♀', gender: 'female' },
  'סופרמרקט': { icon: '🛒 ♂', gender: 'male' },
  'שוק': { icon: '🍉 ♂', gender: 'male' },
  'חנות': { icon: '🛍️ ♀', gender: 'female' },
  'קניון': { icon: '🏬 ♂', gender: 'male' },
  'רחוב': { icon: '🛣️ ♂', gender: 'male' },
  'עיר': { icon: '🏙️ ♀', gender: 'female' },
  'ארץ': { icon: '🗺️ ♀', gender: 'female' },
  'מדינה': { icon: '🗺️ ♀', gender: 'female' },
  'ישראל': { icon: '🇮🇱' },
  'ירושלים': { icon: '🏰 ♀', gender: 'female' },
  'תל אביב': { icon: '🏖️ ♀', gender: 'female' },
  'אוטובוס': { icon: '🚌 ♂', gender: 'male' },
  'מונית': { icon: '🚕 ♀', gender: 'female' },
  'רכבת': { icon: '🚆 ♀', gender: 'female' },
  'רכבת קלה': { icon: '🚋 ♀', gender: 'female' },
  'מכונית': { icon: '🚗 ♀', gender: 'female' },
  'רכב': { icon: '🚗 ♂', gender: 'male' },
  'אופניים': { icon: '🚲' },
  'תחנה': { icon: '🚏 ♀', gender: 'female' },
  'שדה תעופה': { icon: '✈️ ♂', gender: 'male' },
  'בנק': { icon: '🏦 ♂', gender: 'male' },
  'דואר': { icon: '📮 ♂', gender: 'male' },
  'ים': { icon: '🏖️ ♂', gender: 'male' },
  'חוף': { icon: '🏖️ ♂', gender: 'male' },
  'מלון': { icon: '🏨 ♂', gender: 'male' },
  'בית חולים': { icon: '🏥 ♂', gender: 'male' },
  'מרפאה': { icon: '🩺 ♀', gender: 'female' },
  'קופת חולים': { icon: '🏥 ♀', gender: 'female' },
  'בית מרקחת': { icon: '💊 ♂', gender: 'male' },
  'בית ספר': { icon: '🏫 ♂', gender: 'male' },
  'אוניברסיטה': { icon: '🎓 ♀', gender: 'female' },
  'משרד': { icon: '🏢 ♂', gender: 'male' },
  'ספריה': { icon: '📚 ♀', gender: 'female' },
  'פארק': { icon: '🌳 ♂', gender: 'male' },

  // ─── 7. Семья и люди (Family & People) ────────────────────────────────────
  'משפחה': { icon: '👨‍👩‍👧‍👦 ♀', gender: 'female' },
  'אבא': { icon: '👔 ♂', gender: 'male' },
  'אמא': { icon: '👗 ♀', gender: 'female' },
  'אח': { icon: '👦 ♂', gender: 'male' },
  'אחות': { icon: '👧 ♀', gender: 'female' },
  'אחים': { icon: '👦 👥 ♂', gender: 'male' },
  'אחיות': { icon: '👧 👥 ♀', gender: 'female' },
  'סבא': { icon: '👓 ♂', gender: 'male' },
  'סבתא': { icon: '👵 ♀', gender: 'female' },
  'בן': { icon: '👶 ♂', gender: 'male' },
  'בת': { icon: '👶 ♀', gender: 'female' },
  'בנים': { icon: '👦 👥 ♂', gender: 'male' },
  'בנות': { icon: '👧 👥 ♀', gender: 'female' },
  'ילד': { icon: '👶 ♂', gender: 'male' },
  'ילדה': { icon: '👶 ♀', gender: 'female' },
  'ילדים': { icon: '👶 👥 ♂', gender: 'male' },
  'איש': { icon: '👤 ♂', gender: 'male' },
  'אישה': { icon: '👤 ♀', gender: 'female' },
  'אנשים': { icon: '👥 ♂', gender: 'male' },
  'חבר': { icon: '🤝 ♂', gender: 'male' },
  'חברה': { icon: '🤝 ♀', gender: 'female' },
  'חברים': { icon: '🤝 👥 ♂', gender: 'male' },
  'רופא': { icon: '🩺 ♂', gender: 'male' },
  'רופאה': { icon: '🩺 ♀', gender: 'female' },
  'מורה': { icon: '🧑‍🏫' },
  'תלמיד': { icon: '🎒 ♂', gender: 'male' },
  'תלמידה': { icon: '🎒 ♀', gender: 'female' },
  'סטודנט': { icon: '🎓 ♂', gender: 'male' },
  'סטודנטית': { icon: '🎓 ♀', gender: 'female' },
  'פקיד': { icon: '👔 ♂', gender: 'male' },
  'פקידה': { icon: '👔 ♀', gender: 'female' },
  'מלצר': { icon: '🧑‍🍳 ♂', gender: 'male' },
  'מלצרית': { icon: '🧑‍🍳 ♀', gender: 'female' },
  'נהג': { icon: '🚌 ♂', gender: 'male' },
  'שכן': { icon: '🏘️ ♂', gender: 'male' },
  'שכנה': { icon: '🏘️ ♀', gender: 'female' },
  'כלב': { icon: '🐕 ♂', gender: 'male' },
  'כלבה': { icon: '🐕 ♀', gender: 'female' },
  'חתול': { icon: '🐈 ♂', gender: 'male' },
  'חתולה': { icon: '🐈 ♀', gender: 'female' },

  // ─── 8. Вещи и предметы (Objects) ─────────────────────────────────────────
  'ספר': { icon: '📚 ♂', gender: 'male' },
  'עט': { icon: '🖊️ ♂', gender: 'male' },
  'עפרון': { icon: '✏️ ♂', gender: 'male' },
  'מחברת': { icon: '📓 ♀', gender: 'female' },
  'דף': { icon: '📄 ♂', gender: 'male' },
  'טלפון': { icon: '📱 ♂', gender: 'male' },
  'מחשב': { icon: '💻 ♂', gender: 'male' },
  'טלוויזיה': { icon: '📺 ♀', gender: 'female' },
  'שולחן': { icon: '🪑 ♂', gender: 'male' },
  'כסא': { icon: '🪑 ♂', gender: 'male' },
  'מיטה': { icon: '🛏️ ♀', gender: 'female' },
  'דלת': { icon: '🚪 ♀', gender: 'female' },
  'חלון': { icon: '🪟 ♂', gender: 'male' },
  'מפתח': { icon: '🔑 ♂', gender: 'male' },
  'כסף': { icon: '💵 ♂', gender: 'male' },
  'שקל': { icon: '₪ ♂', gender: 'male' },
  'כרטיס': { icon: '💳 ♂', gender: 'male' },
  'דרכון': { icon: '🛂 ♂', gender: 'male' },
  'תעודת זהות': { icon: '🪪 ♀', gender: 'female' },
  'תיק': { icon: '🎒 ♂', gender: 'male' },
  'בגד': { icon: '👕 ♂', gender: 'male' },
  'חולצה': { icon: '👕 ♀', gender: 'female' },
  'מכנסיים': { icon: '👖' },
  'שמלה': { icon: '👗 ♀', gender: 'female' },
  'נעליים': { icon: '👟 ♀', gender: 'female' },
  'מעיל': { icon: '🧥 ♂', gender: 'male' },
  'שעון': { icon: '⌚ ♂', gender: 'male' },
  'משקפיים': { icon: '👓' },

  // ─── 9. Время и дни (Time & Days) ─────────────────────────────────────────
  'שעה': { icon: '⏰ ♀', gender: 'female' },
  'דקה': { icon: '⏱️ ♀', gender: 'female' },
  'יום': { icon: '📅 ♂', gender: 'male' },
  'שבוע': { icon: '🗓️ ♂', gender: 'male' },
  'חודש': { icon: '🌙 ♂', gender: 'male' },
  'שנה': { icon: '🎆 ♀', gender: 'female' },
  'היום': { icon: '📍📅' },
  'אתמול': { icon: '⬅️📅' },
  'מחר': { icon: '➡️📅' },
  'עכשיו': { icon: '⚡⌛' },
  'יום ראשון': { icon: '1️⃣📅' },
  'יום שני': { icon: '2️⃣📅' },
  'יום שלישי': { icon: '3️⃣📅' },
  'יום רביעי': { icon: '4️⃣📅' },
  'יום חמישי': { icon: '5️⃣📅' },
  'יום שישי': { icon: '6️⃣🕯️' },
  'שבת': { icon: '🕯️🍷 ♀', gender: 'female' },
};

/**
 * Получить строку-пиктограмму для слова или фразы на иврите.
 * Сначала ищет точное совпадение целой фразы, предотвращая ложные срабатывания по отдельным словам.
 */
export function getHebrewPictogram(hebrewText: string): string | null {
  if (!hebrewText) return null;
  // Очищаем огласовки и знаки препинания
  const clean = stripNikkud(hebrewText)
    .replace(/[.,?!:;'"«»\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return null;

  // 1. Точное совпадение слова или полной фразы
  if (HEBREW_PICTOGRAM_MAP[clean]) {
    return HEBREW_PICTOGRAM_MAP[clean].icon;
  }

  // 2. Поиск многословных фраз (по убыванию длины, чтобы фразы имели приоритет)
  const sortedKeys = Object.keys(HEBREW_PICTOGRAM_MAP)
    .filter((k) => k.includes(' '))
    .sort((a, b) => b.length - a.length);

  for (const phraseKey of sortedKeys) {
    if (clean === phraseKey || clean.startsWith(`${phraseKey} `) || clean.endsWith(` ${phraseKey}`) || clean.includes(` ${phraseKey} `)) {
      return HEBREW_PICTOGRAM_MAP[phraseKey].icon;
    }
  }

  // 3. Для коротких словосочетаний (до 2 слов) проверяем отдельные слова
  const words = clean.split(' ');
  if (words.length <= 2) {
    for (const w of words) {
      if (HEBREW_PICTOGRAM_MAP[w]) {
        return HEBREW_PICTOGRAM_MAP[w].icon;
      }
    }
  }

  // 4. Грамматические эвристики рода и числа только для одиночных слов
  if (words.length === 1) {
    if (clean.endsWith('ות')) return '👥 ♀';
    if (clean.endsWith('ים')) return '👥 ♂';
  }

  return null;
}

/**
 * Получить подробные стилизованные метаданные с цветовым кодированием
 * (Голубой для ♂, Розовый для ♀, Индиго для ⚥)
 */
export function getPictogramDetails(hebrewText: string, fallbackGender?: string): PictogramDetails {
  const clean = stripNikkud(hebrewText).trim();
  const entry = HEBREW_PICTOGRAM_MAP[clean];
  
  let gender = entry?.gender;
  if (!gender && fallbackGender) {
    const g = fallbackGender.toLowerCase();
    if (g.includes('муж') || g.includes('male') || g.includes('זכר')) gender = 'male';
    else if (g.includes('жен') || g.includes('female') || g.includes('נקבה')) gender = 'female';
    else gender = 'both';
  }

  const icon = entry?.icon || getHebrewPictogram(hebrewText) || '💬';

  if (gender === 'male') {
    return {
      icon,
      gender: 'male',
      bgClass: 'bg-sky-50 dark:bg-sky-950/50',
      textClass: 'text-sky-700 dark:text-sky-300',
      borderClass: 'border-sky-200 dark:border-sky-800/60',
      badgeLabel: 'זָכָר ♂',
    };
  }

  if (gender === 'female') {
    return {
      icon,
      gender: 'female',
      bgClass: 'bg-rose-50 dark:bg-rose-950/50',
      textClass: 'text-rose-700 dark:text-rose-300',
      borderClass: 'border-rose-200 dark:border-rose-800/60',
      badgeLabel: 'נְקֵבָה ♀',
    };
  }

  return {
    icon,
    gender: gender || 'both',
    bgClass: 'bg-indigo-50 dark:bg-indigo-950/40',
    textClass: 'text-indigo-700 dark:text-indigo-300',
    borderClass: 'border-indigo-200 dark:border-indigo-800/60',
    badgeLabel: 'כְּלָלִי ⚥',
  };
}

/**
 * Получить грамматический бейдж на иврите с голубым (♂) и розовым (♀) цветами
 */
export function getHebrewGenderLabel(gender: 'male' | 'female' | 'both' | string): {
  label: string;
  badgeClass: string;
  icon: string;
} {
  const g = gender.toLowerCase();
  if (g.includes('муж') || g.includes('male') || g.includes('זכר') || g === 'זָכָר') {
    return {
      label: 'זָכָר',
      badgeClass: 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-700',
      icon: '♂',
    };
  }
  if (g.includes('жен') || g.includes('female') || g.includes('נקבה') || g === 'נְקֵבָה') {
    return {
      label: 'נְקֵבָה',
      badgeClass: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700',
      icon: '♀',
    };
  }
  return {
    label: 'כְּלָלִי / מְשֻׁתָּף',
    badgeClass: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700',
    icon: '⚥',
  };
}
