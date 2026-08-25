/**
 * Ulpan Visual System
 * Maps Hebrew (plain, no nikud) → visual configuration
 *
 * Two visual strategies:
 *  - openmojiHex: loads a crisp SVG from openmoji.org CDN (nouns/objects)
 *  - verbAnim: CSS animation applied to the emoji (verbs/actions)
 *  - dirArrow: animated SVG directional arrow
 */

export type VerbAnimType =
  | 'bounce'       // movement verbs: go, run, come
  | 'pulse'        // state/modal verbs: know, can, need, want
  | 'heartbeat'    // emotion: love, like
  | 'tilt'         // eat/drink
  | 'speak'        // communication: talk, hear, read aloud
  | 'spin';        // mechanical: do, work

export interface WordVisualConfig {
  /** OpenMoji hex code → https://openmoji.org/data/color/svg/{hex}.svg */
  openmojiHex?: string;
  /** Emoji char used as animated visual (verbs) or as fallback */
  emoji?: string;
  /** CSS animation class suffix (animate-ulpan-{verbAnim}) */
  verbAnim?: VerbAnimType;
  /** Render an animated directional arrow instead */
  dirArrow?: 'left' | 'right' | 'up' | 'down';
}

export const WORD_VISUAL_MAP: Record<string, WordVisualConfig> = {

  // ─── VERBS ────────────────────────────────────────────────────────────────

  // רצה — want / wish
  'רוצה':  { emoji: '💭', verbAnim: 'pulse' },
  'רוצים': { emoji: '💭', verbAnim: 'pulse' },
  'רוצות': { emoji: '💭', verbAnim: 'pulse' },
  'תרצה':  { emoji: '💭', verbAnim: 'pulse' },
  'תרצי':  { emoji: '💭', verbAnim: 'pulse' },
  'תרצו':  { emoji: '💭', verbAnim: 'pulse' },
  'לרצות': { emoji: '💭', verbAnim: 'pulse' },

  // שתה — drink
  'שותה':  { emoji: '🥤', verbAnim: 'tilt' },
  'שותים': { emoji: '🥤', verbAnim: 'tilt' },
  'שותות': { emoji: '🥤', verbAnim: 'tilt' },
  'לשתות': { emoji: '🥤', verbAnim: 'tilt' },

  // אכל — eat
  'אוכל':   { emoji: '🍽️', verbAnim: 'tilt' },
  'אוכלת':  { emoji: '🍽️', verbAnim: 'tilt' },
  'אוכלים': { emoji: '🍽️', verbAnim: 'tilt' },
  'אוכלות': { emoji: '🍽️', verbAnim: 'tilt' },
  'לאכול':  { emoji: '🍽️', verbAnim: 'tilt' },

  // גור — live / reside
  'גר':    { emoji: '🏠', verbAnim: 'pulse' },
  'גרה':   { emoji: '🏠', verbAnim: 'pulse' },
  'גרים':  { emoji: '🏠', verbAnim: 'pulse' },
  'גרות':  { emoji: '🏠', verbAnim: 'pulse' },
  'לגור':  { emoji: '🏠', verbAnim: 'pulse' },

  // דיבר — speak / talk
  'מדבר':   { emoji: '🗣️', verbAnim: 'speak' },
  'מדברת':  { emoji: '🗣️', verbAnim: 'speak' },
  'מדברים': { emoji: '🗣️', verbAnim: 'speak' },
  'מדברות': { emoji: '🗣️', verbAnim: 'speak' },
  'לדבר':   { emoji: '🗣️', verbAnim: 'speak' },

  // למד — learn / study
  'לומד':   { emoji: '📚', verbAnim: 'bounce' },
  'לומדת':  { emoji: '📚', verbAnim: 'bounce' },
  'לומדים': { emoji: '📚', verbAnim: 'bounce' },
  'לומדות': { emoji: '📚', verbAnim: 'bounce' },
  'ללמוד':  { emoji: '📚', verbAnim: 'bounce' },

  // עבד — work
  'עובד':   { emoji: '💼', verbAnim: 'pulse' },
  'עובדת':  { emoji: '💼', verbAnim: 'pulse' },
  'עובדים': { emoji: '💼', verbAnim: 'pulse' },
  'עובדות': { emoji: '💼', verbAnim: 'pulse' },
  'לעבוד':  { emoji: '💼', verbAnim: 'pulse' },

  // הלך — walk / go
  'הולך':   { emoji: '🚶', verbAnim: 'bounce' },
  'הולכת':  { emoji: '🚶', verbAnim: 'bounce' },
  'הולכים': { emoji: '🚶', verbAnim: 'bounce' },
  'הולכות': { emoji: '🚶', verbAnim: 'bounce' },
  'ללכת':   { emoji: '🚶', verbAnim: 'bounce' },

  // בוא — come / arrive
  'בא':    { emoji: '🏃', verbAnim: 'bounce' },
  'באה':   { emoji: '🏃', verbAnim: 'bounce' },
  'באים':  { emoji: '🏃', verbAnim: 'bounce' },
  'באות':  { emoji: '🏃', verbAnim: 'bounce' },
  'לבוא':  { emoji: '🏃', verbAnim: 'bounce' },

  // רץ — run
  'רץ':    { emoji: '🏃', verbAnim: 'bounce' },
  'רצה':   { emoji: '🏃', verbAnim: 'bounce' },
  'רצים':  { emoji: '🏃', verbAnim: 'bounce' },
  'רצות':  { emoji: '🏃', verbAnim: 'bounce' },
  'לרוץ':  { emoji: '🏃', verbAnim: 'bounce' },

  // נסע — travel / drive
  'נוסע':   { emoji: '🚗', verbAnim: 'bounce' },
  'נוסעת':  { emoji: '🚗', verbAnim: 'bounce' },
  'נוסעים': { emoji: '🚗', verbAnim: 'bounce' },
  'נוסעות': { emoji: '🚗', verbAnim: 'bounce' },
  'לנסוע':  { emoji: '🚗', verbAnim: 'bounce' },

  // ידע — know
  'יודע':   { emoji: '💡', verbAnim: 'pulse' },
  'יודעת':  { emoji: '💡', verbAnim: 'pulse' },
  'יודעים': { emoji: '💡', verbAnim: 'pulse' },
  'יודעות': { emoji: '💡', verbAnim: 'pulse' },
  'לדעת':   { emoji: '💡', verbAnim: 'pulse' },

  // הבין — understand
  'מבין':   { emoji: '🧠', verbAnim: 'pulse' },
  'מבינה':  { emoji: '🧠', verbAnim: 'pulse' },
  'מבינים': { emoji: '🧠', verbAnim: 'pulse' },
  'מבינות': { emoji: '🧠', verbAnim: 'pulse' },
  'להבין':  { emoji: '🧠', verbAnim: 'pulse' },

  // אהב — love / like
  'אוהב':   { emoji: '❤️', verbAnim: 'heartbeat' },
  'אוהבת':  { emoji: '❤️', verbAnim: 'heartbeat' },
  'אוהבים': { emoji: '❤️', verbAnim: 'heartbeat' },
  'אוהבות': { emoji: '❤️', verbAnim: 'heartbeat' },
  'לאהוב':  { emoji: '❤️', verbAnim: 'heartbeat' },

  // קרא — read
  'קורא':   { emoji: '📖', verbAnim: 'bounce' },
  'קוראת':  { emoji: '📖', verbAnim: 'bounce' },
  'קוראים': { emoji: '📖', verbAnim: 'bounce' },
  'קוראות': { emoji: '📖', verbAnim: 'bounce' },
  'לקרוא':  { emoji: '📖', verbAnim: 'bounce' },

  // כתב — write
  'כותב':   { emoji: '✍️', verbAnim: 'bounce' },
  'כותבת':  { emoji: '✍️', verbAnim: 'bounce' },
  'כותבים': { emoji: '✍️', verbAnim: 'bounce' },
  'כותבות': { emoji: '✍️', verbAnim: 'bounce' },
  'לכתוב':  { emoji: '✍️', verbAnim: 'bounce' },

  // שמע — hear / listen
  'שומע':   { emoji: '👂', verbAnim: 'speak' },
  'שומעת':  { emoji: '👂', verbAnim: 'speak' },
  'שומעים': { emoji: '👂', verbAnim: 'speak' },
  'שומעות': { emoji: '👂', verbAnim: 'speak' },
  'לשמוע':  { emoji: '👂', verbAnim: 'speak' },

  // ראה — see
  'רואה':  { emoji: '👀', verbAnim: 'pulse' },
  'רואים': { emoji: '👀', verbAnim: 'pulse' },
  'לראות': { emoji: '👀', verbAnim: 'pulse' },

  // עשה — do / make
  'עושה':  { emoji: '⚙️', verbAnim: 'spin' },
  'עושים': { emoji: '⚙️', verbAnim: 'spin' },
  'לעשות': { emoji: '⚙️', verbAnim: 'spin' },

  // קנה — buy
  'קונה':  { emoji: '🛍️', verbAnim: 'bounce' },
  'קונים': { emoji: '🛍️', verbAnim: 'bounce' },
  'לקנות': { emoji: '🛍️', verbAnim: 'bounce' },

  // בקש — request
  'מבקש':  { emoji: '🙏', verbAnim: 'pulse' },
  'מבקשת': { emoji: '🙏', verbAnim: 'pulse' },
  'לבקש':  { emoji: '🙏', verbAnim: 'pulse' },

  // צריך — need
  'צריך':  { emoji: '⚠️', verbAnim: 'pulse' },
  'צריכה': { emoji: '⚠️', verbAnim: 'pulse' },
  'צריכים':{ emoji: '⚠️', verbAnim: 'pulse' },
  'צריכות':{ emoji: '⚠️', verbAnim: 'pulse' },

  // יכול — can / be able
  'יכול':  { emoji: '💪', verbAnim: 'pulse' },
  'יכולה': { emoji: '💪', verbAnim: 'pulse' },
  'יכולים':{ emoji: '💪', verbAnim: 'pulse' },
  'יכולות':{ emoji: '💪', verbAnim: 'pulse' },
  'להיות': { emoji: '✨', verbAnim: 'pulse' },

  // קבל — receive / get
  'מקבל':  { emoji: '🎁', verbAnim: 'bounce' },
  'מקבלת': { emoji: '🎁', verbAnim: 'bounce' },
  'לקבל':  { emoji: '🎁', verbAnim: 'bounce' },

  // שלם — pay
  'משלם':  { emoji: '💳', verbAnim: 'bounce' },
  'משלמת': { emoji: '💳', verbAnim: 'bounce' },
  'לשלם':  { emoji: '💳', verbAnim: 'bounce' },

  // ישן — sleep
  'ישן':   { emoji: '😴', verbAnim: 'pulse' },
  'ישנה':  { emoji: '😴', verbAnim: 'pulse' },
  'לישון': { emoji: '😴', verbAnim: 'pulse' },

  // שר — sing
  'שר':    { emoji: '🎵', verbAnim: 'speak' },
  'שרה':   { emoji: '🎵', verbAnim: 'speak' },
  'לשיר':  { emoji: '🎵', verbAnim: 'speak' },

  // בישל — cook
  'מבשל':  { emoji: '🍳', verbAnim: 'tilt' },
  'מבשלת': { emoji: '🍳', verbAnim: 'tilt' },
  'לבשל':  { emoji: '🍳', verbAnim: 'tilt' },

  // ─── DIRECTIONAL WORDS ────────────────────────────────────────────────────

  'שמאלה': { dirArrow: 'left' },
  'שמאל':  { dirArrow: 'left' },
  'לשמאל': { dirArrow: 'left' },
  'ימינה': { dirArrow: 'right' },
  'ימין':  { dirArrow: 'right' },
  'לימין': { dirArrow: 'right' },
  'קדימה': { dirArrow: 'up' },
  'ישר':   { dirArrow: 'up' },
  'אחורה': { dirArrow: 'down' },
  'אחורי': { dirArrow: 'down' },

  // ─── NOUNS / OBJECTS (OpenMoji SVG) ───────────────────────────────────────

  // Food & Drinks
  'מים':     { openmojiHex: '1F4A7', emoji: '💧' },
  'קפה':     { openmojiHex: '2615',  emoji: '☕' },
  'תה':      { openmojiHex: '1FAD6', emoji: '🫖' },
  'חלב':     { openmojiHex: '1F95B', emoji: '🥛' },
  'סוכר':    { openmojiHex: '1F9C2', emoji: '🧂' },
  'עוגה':    { openmojiHex: '1F370', emoji: '🍰' },
  'קרואסון': { openmojiHex: '1F950', emoji: '🥐' },
  'לחם':     { openmojiHex: '1F35E', emoji: '🍞' },
  'פיתה':    { openmojiHex: '1FAD3', emoji: '🫓' },
  'סלט':     { openmojiHex: '1F957', emoji: '🥗' },
  'סנדוויץ': { openmojiHex: '1F96A', emoji: '🥪' },
  'כריך':    { openmojiHex: '1F96A', emoji: '🥪' },
  'פיצה':    { openmojiHex: '1F355', emoji: '🍕' },
  'גבינה':   { openmojiHex: '1F9C0', emoji: '🧀' },
  'ביצה':    { openmojiHex: '1F95A', emoji: '🥚' },
  'בשר':     { openmojiHex: '1F969', emoji: '🥩' },
  'עוף':     { openmojiHex: '1F357', emoji: '🍗' },
  'דג':      { openmojiHex: '1F41F', emoji: '🐟' },
  'תפוח':    { openmojiHex: '1F34E', emoji: '🍎' },
  'בננה':    { openmojiHex: '1F34C', emoji: '🍌' },
  'תפוז':    { openmojiHex: '1F34A', emoji: '🍊' },
  'מיץ':     { openmojiHex: '1F9C3', emoji: '🧃' },
  'יין':     { openmojiHex: '1F377', emoji: '🍷' },
  'בירה':    { openmojiHex: '1F37A', emoji: '🍺' },
  'מרק':     { openmojiHex: '1F372', emoji: '🍲' },
  'חומוס':   { openmojiHex: '1F963', emoji: '🥣' },
  'טחינה':   { openmojiHex: '1FAD2', emoji: '🫒' },
  'פלאפל':   { openmojiHex: '1F9C6', emoji: '🧆' },
  'שוקולד':  { openmojiHex: '1F36B', emoji: '🍫' },
  'גלידה':   { openmojiHex: '1F366', emoji: '🍦' },
  'חשבון':   { openmojiHex: '1F9FE', emoji: '🧾' },

  // Places & Transport
  'בית':       { openmojiHex: '1F3E0', emoji: '🏠' },
  'דירה':      { openmojiHex: '1F3E2', emoji: '🏢' },
  'חדר':       { openmojiHex: '1F6AA', emoji: '🚪' },
  'בית קפה':   { openmojiHex: '2615',  emoji: '☕' },
  'מסעדה':     { openmojiHex: '1F37D', emoji: '🍽️' },
  'סופרמרקט':  { openmojiHex: '1F6D2', emoji: '🛒' },
  'שוק':       { openmojiHex: '1F349', emoji: '🍉' },
  'חנות':      { openmojiHex: '1F6CD', emoji: '🛍️' },
  'קניון':     { openmojiHex: '1F3EC', emoji: '🏬' },
  'רחוב':      { openmojiHex: '1F6E3', emoji: '🛣️' },
  'עיר':       { openmojiHex: '1F3D9', emoji: '🏙️' },
  'ארץ':       { openmojiHex: '1F5FA', emoji: '🗺️' },
  'מדינה':     { openmojiHex: '1F5FA', emoji: '🗺️' },
  'ישראל':     { openmojiHex: '1F1EE-1F1F1', emoji: '🇮🇱' },
  'ירושלים':   { openmojiHex: '1F3F0', emoji: '🏰' },
  'ים':        { openmojiHex: '1F3D6', emoji: '🏖️' },
  'חוף':       { openmojiHex: '1F3D6', emoji: '🏖️' },
  'מלון':      { openmojiHex: '1F3E8', emoji: '🏨' },
  'בית חולים': { openmojiHex: '1F3E5', emoji: '🏥' },
  'מרפאה':     { openmojiHex: '1FA7A', emoji: '🩺' },
  'קופת חולים':{ openmojiHex: '1F3E5', emoji: '🏥' },
  'בית מרקחת': { openmojiHex: '1F48A', emoji: '💊' },
  'בית ספר':   { openmojiHex: '1F3EB', emoji: '🏫' },
  'אוניברסיטה':{ openmojiHex: '1F393', emoji: '🎓' },
  'משרד':      { openmojiHex: '1F3E2', emoji: '🏢' },
  'ספריה':     { openmojiHex: '1F4DA', emoji: '📚' },
  'פארק':      { openmojiHex: '1F333', emoji: '🌳' },
  'בנק':       { openmojiHex: '1F3E6', emoji: '🏦' },
  'דואר':      { openmojiHex: '1F4EE', emoji: '📮' },
  'אוטובוס':   { openmojiHex: '1F68C', emoji: '🚌' },
  'מונית':     { openmojiHex: '1F695', emoji: '🚕' },
  'רכבת':      { openmojiHex: '1F686', emoji: '🚆' },
  'רכבת קלה':  { openmojiHex: '1F68B', emoji: '🚋' },
  'מכונית':    { openmojiHex: '1F697', emoji: '🚗' },
  'רכב':       { openmojiHex: '1F697', emoji: '🚗' },
  'אופניים':   { openmojiHex: '1F6B2', emoji: '🚲' },
  'תחנה':      { openmojiHex: '1F68F', emoji: '🚏' },
  'שדה תעופה': { openmojiHex: '2708',  emoji: '✈️' },

  // Family & People
  'אבא':     { openmojiHex: '1F454', emoji: '👔' },
  'אמא':     { openmojiHex: '1F457', emoji: '👗' },
  'אח':      { openmojiHex: '1F466', emoji: '👦' },
  'אחות':    { openmojiHex: '1F467', emoji: '👧' },
  'סבא':     { openmojiHex: '1F453', emoji: '👓' },
  'סבתא':    { openmojiHex: '1F475', emoji: '👵' },
  'בן':      { openmojiHex: '1F476', emoji: '👶' },
  'בת':      { openmojiHex: '1F476', emoji: '👶' },
  'ילד':     { openmojiHex: '1F476', emoji: '👶' },
  'ילדה':    { openmojiHex: '1F476', emoji: '👶' },
  'רופא':    { openmojiHex: '1FA7A', emoji: '🩺' },
  'רופאה':   { openmojiHex: '1FA7A', emoji: '🩺' },
  'תלמיד':   { openmojiHex: '1F392', emoji: '🎒' },
  'תלמידה':  { openmojiHex: '1F392', emoji: '🎒' },
  'סטודנט':  { openmojiHex: '1F393', emoji: '🎓' },
  'סטודנטית':{ openmojiHex: '1F393', emoji: '🎓' },
  'כלב':     { openmojiHex: '1F415', emoji: '🐕' },
  'כלבה':    { openmojiHex: '1F415', emoji: '🐕' },
  'חתול':    { openmojiHex: '1F408', emoji: '🐈' },
  'חתולה':   { openmojiHex: '1F408', emoji: '🐈' },

  // Objects & Tools
  'ספר':      { openmojiHex: '1F4DA', emoji: '📚' },
  'עט':       { openmojiHex: '1F58A', emoji: '🖊️' },
  'עפרון':    { openmojiHex: '270F',  emoji: '✏️' },
  'מחברת':    { openmojiHex: '1F4D3', emoji: '📓' },
  'דף':       { openmojiHex: '1F4C4', emoji: '📄' },
  'טלפון':    { openmojiHex: '1F4F1', emoji: '📱' },
  'מחשב':     { openmojiHex: '1F4BB', emoji: '💻' },
  'טלוויזיה': { openmojiHex: '1F4FA', emoji: '📺' },
  'שולחן':    { openmojiHex: '1FA91', emoji: '🪑' },
  'כסא':      { openmojiHex: '1FA91', emoji: '🪑' },
  'מיטה':     { openmojiHex: '1F6CF', emoji: '🛏️' },
  'דלת':      { openmojiHex: '1F6AA', emoji: '🚪' },
  'חלון':     { openmojiHex: '1FA9F', emoji: '🪟' },
  'מפתח':     { openmojiHex: '1F511', emoji: '🔑' },
  'כסף':      { openmojiHex: '1F4B5', emoji: '💵' },
  'שקל':      { openmojiHex: '1F4B3', emoji: '💳' },
  'כרטיס':    { openmojiHex: '1F4B3', emoji: '💳' },
  'דרכון':    { openmojiHex: '1F6C2', emoji: '🛂' },
  'תיק':      { openmojiHex: '1F392', emoji: '🎒' },
  'חולצה':    { openmojiHex: '1F455', emoji: '👕' },
  'מכנסיים':  { openmojiHex: '1F456', emoji: '👖' },
  'שמלה':     { openmojiHex: '1F457', emoji: '👗' },
  'נעליים':   { openmojiHex: '1F45F', emoji: '👟' },
  'מעיל':     { openmojiHex: '1F9E5', emoji: '🧥' },
  'שעון':     { openmojiHex: '231A',  emoji: '⌚' },
  'משקפיים':  { openmojiHex: '1F453', emoji: '👓' },

  // Time
  'שעה':  { openmojiHex: '23F0',  emoji: '⏰' },
  'דקה':  { openmojiHex: '23F1',  emoji: '⏱️' },
  'יום':  { openmojiHex: '1F4C5', emoji: '📅' },
  'שבוע': { openmojiHex: '1F5D3', emoji: '🗓️' },
  'חודש': { openmojiHex: '1F319', emoji: '🌙' },
  'שנה':  { openmojiHex: '1F386', emoji: '🎆' },
  'בוקר': { openmojiHex: '1F305', emoji: '🌅' },

  // Greetings / Expressions (use OpenMoji for expressiveness)
  'שלום':     { openmojiHex: '1F44B', emoji: '👋' },
  'בוקר טוב': { openmojiHex: '1F305', emoji: '🌅' },
  'ערב טוב':  { openmojiHex: '1F306', emoji: '🌆' },
  'לילה טוב': { openmojiHex: '1F319', emoji: '🌙' },
  'תודה':     { openmojiHex: '1F64F', emoji: '🙏' },
  'תודה רבה': { openmojiHex: '1F64F', emoji: '🙏' },
  'בבקשה':    { openmojiHex: '1F91D', emoji: '🤝' },
  'כן':       { openmojiHex: '2705',  emoji: '✅' },
  'לא':       { openmojiHex: '274C',  emoji: '❌' },
  'בסדר':     { openmojiHex: '1F44C', emoji: '👌' },
  'יופי':     { openmojiHex: '1F31F', emoji: '🌟' },
  'מצוין':    { openmojiHex: '1F4AF', emoji: '💯' },
  'סליחה':    { openmojiHex: '1F647', emoji: '🙇' },
  'להתראות':  { openmojiHex: '1F44B', emoji: '👋' },
  'בהצלחה':   { openmojiHex: '1F3AF', emoji: '🎯' },
  'מזל טוב':  { openmojiHex: '1F382', emoji: '🎂' },
  'שיעור':    { openmojiHex: '1F4DA', emoji: '📚' },
};

/**
 * Look up visual config for a Hebrew word.
 * Tries exact match, then strips trailing gender suffixes for partial matches.
 */
export function getWordVisualConfig(hebrewPlain: string): WordVisualConfig | null {
  if (!hebrewPlain) return null;
  const clean = hebrewPlain.trim();

  // Exact match
  if (WORD_VISUAL_MAP[clean]) return WORD_VISUAL_MAP[clean];

  // Multi-word phrase: try full phrase match
  const trimmed = clean.replace(/\s+/g, ' ');
  if (WORD_VISUAL_MAP[trimmed]) return WORD_VISUAL_MAP[trimmed];

  return null;
}
