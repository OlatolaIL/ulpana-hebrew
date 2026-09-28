/**
 * gemini_carousel.cjs
 * Единый модуль управления пулом API-ключей Gemini и каруселью слотов TTS.
 * Соответствует инвариантам:
 * - R-16: Безопасность секретов (ключи никогда не выводятся полностью в логи)
 * - R-27: Zero-Waste Quota Policy (защита квот, 4-уровневый фильтр)
 * - R-28: Однородность модели диалога (поддержка выбора единой модели на урок)
 */

const fs = require('fs');
const path = require('path');

const GEMINI_TTS_MODELS = [
  'gemini-3.8-flash-tts',
  'gemini-3.8-flash-lite-tts',
  'gemini-3.1-flash-tts-preview'
];

function maskKey(key) {
  if (!key || typeof key !== 'string') return 'none';
  if (key.length <= 12) return '***';
  return key.slice(0, 8) + '...' + key.slice(-4);
}

function getGeminiApiKeys(customEnvPath = null) {
  const envPath = customEnvPath || path.resolve(__dirname, '..', '.env.local');
  const keyMap = new Map();

  const addKey = (name, val) => {
    if (!val || typeof val !== 'string') return;
    const clean = val.trim().replace(/^['"]|['"]$/g, '');
    if (clean && clean.length > 20 && !clean.includes('your_') && !clean.includes('placeholder')) {
      if (!keyMap.has(clean)) {
        keyMap.set(clean, name);
      }
    }
  };

  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq > 0) {
        const k = trimmed.slice(0, eq).trim();
        const v = trimmed.slice(eq + 1).trim();
        if (/^GEMINI.*KEY/i.test(k)) {
          addKey(k, v);
        }
      }
    }
  }

  for (const [k, v] of Object.entries(process.env)) {
    if (/^GEMINI.*KEY/i.test(k)) {
      addKey(k, v);
    }
  }

  const entries = Array.from(keyMap.entries());
  entries.sort((a, b) => {
    const getWeight = (name) => {
      if (name === 'GEMINI_TTS_API_KEY') return 10;
      if (/^GEMINI_TTS_KEY_\d+/i.test(name)) {
        const num = parseInt(name.replace(/\D/g, ''), 10) || 0;
        return 20 + num;
      }
      if (name === 'GEMINI_PRIMARY_API_KEY') return 100;
      if (name === 'GEMINI_SECONDARY_API_KEY') return 200;
      if (name === 'GEMINI_API_KEY') return 300;
      return 500;
    };
    return getWeight(a[1]) - getWeight(b[1]);
  });

  return entries.map(([key, name], idx) => ({
    key,
    name,
    keyIndex: idx + 1,
    masked: maskKey(key)
  }));
}

class GeminiCarousel {
  constructor(keys, models = GEMINI_TTS_MODELS) {
    this.keys = keys || [];
    this.models = models;
    this.exhaustedSlots = new Set();
    this.exhaustedKeys = new Set();
    this.currentSlotIdx = 0;

    this.slots = [];
    this.keys.forEach((kObj) => {
      this.models.forEach((model) => {
        this.slots.push({
          key: kObj.key,
          name: kObj.name,
          keyIndex: kObj.keyIndex,
          masked: kObj.masked,
          model,
          fails: 0
        });
      });
    });
  }

  getNextAvailableSlot(requiredModel = null) {
    if (!this.slots.length) return null;
    let scanned = 0;
    while (scanned < this.slots.length) {
      const slot = this.slots[this.currentSlotIdx % this.slots.length];
      const slotKey = `${slot.keyIndex}_${slot.model}`;
      const matchesModel = !requiredModel || slot.model === requiredModel;
      if (matchesModel && !this.exhaustedKeys.has(slot.keyIndex) && !this.exhaustedSlots.has(slotKey)) {
        return slot;
      }
      this.currentSlotIdx++;
      scanned++;
    }
    return null;
  }

  getBestAvailableModel(targetModel = null) {
    if (targetModel) return targetModel;
    for (const model of this.models) {
      const hasSlot = this.slots.some(slot =>
        slot.model === model &&
        !this.exhaustedKeys.has(slot.keyIndex) &&
        !this.exhaustedSlots.has(`${slot.keyIndex}_${slot.model}`)
      );
      if (hasSlot) return model;
    }
    return this.models[0];
  }

  advance() {
    this.currentSlotIdx++;
  }

  mark402(slot) {
    console.warn(`  ⚠️ [402 Payment Required] на ключе #${slot.keyIndex} (${slot.name}). Ключ исключён из карусели.`);
    this.exhaustedKeys.add(slot.keyIndex);
    this.advance();
  }

  markDailyExhausted(slot) {
    const slotKey = `${slot.keyIndex}_${slot.model}`;
    console.warn(`  🛑 [${slot.model}] суточный лимит 100 запросов на ключе #${slot.keyIndex} (${slot.name}). Ротация слота...`);
    this.exhaustedSlots.add(slotKey);
    this.advance();
  }

  handleRateLimit(slot, errorMsg) {
    const slotKey = `${slot.keyIndex}_${slot.model}`;
    const isDaily = /per_model_per_day|per_day|per day|requests per model|exceeded your current quota|Resource has been exhausted/i.test(errorMsg);
    if (isDaily) {
      this.markDailyExhausted(slot);
      return { daily: true };
    }
    slot.fails = (slot.fails || 0) + 1;
    if (slot.fails >= 4) {
      console.warn(`  🛑 [${slot.model}] превышен лимит попыток RPM на ключе #${slot.keyIndex} (${slot.name}). Ротация слота...`);
      this.exhaustedSlots.add(slotKey);
      this.advance();
      return { daily: false, retry: false };
    }
    console.warn(`  ⏳ [429 RPM (${slot.fails}/3)] Модель ${slot.model} на ключе #${slot.keyIndex} (${slot.name}). Пауза 3с и переход к следующему слоту...`);
    this.advance();
    return { daily: false, retry: true, delayMs: 3000 };
  }

  hasAvailableSlots(requiredModel = null) {
    return this.getNextAvailableSlot(requiredModel) !== null;
  }
}

function createGeminiCarousel(keys, models = GEMINI_TTS_MODELS) {
  return new GeminiCarousel(keys, models);
}

module.exports = {
  GEMINI_TTS_MODELS,
  maskKey,
  getGeminiApiKeys,
  createGeminiCarousel,
  GeminiCarousel
};

if (require.main === module) {
  const keys = getGeminiApiKeys();
  console.log(`[Gemini Carousel Self-Test] Найдено ключей: ${keys.length}`);
  keys.forEach((k) => {
    console.log(`  Ключ #${k.keyIndex}: ${k.name} [${k.masked}]`);
  });
  const carousel = createGeminiCarousel(keys);
  console.log(`Всего слотов в карусели: ${carousel.slots.length}`);
  console.log(`Рекомендуемая начальная модель: ${carousel.getBestAvailableModel()}`);
}
