/**
 * Скрипт партизанского лид-радара (Lead Radar Scanner)
 * 
 * Запуск:
 *   node growth/scripts/run_lead_radar.cjs --summary       # Вывод текущих лидов из базы
 *   node growth/scripts/run_lead_radar.cjs --scan          # Сканирование тестового потока сообщений
 *   node growth/scripts/run_lead_radar.cjs --msg="текст"  # Анализ одного сообщения
 */

const fs = require('fs');
const path = require('path');

// Загрузка .env.local
try {
  if (fs.existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
  }
} catch (e) {}

const DATA_DIR = path.join(__dirname, '..', 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

// Быстрое «Ситечко» (RegExp)
const TRIGGER_PATTERNS = [
  /курьер/i,
  /вольт/i,
  /wolt/i,
  /садик/i,
  /воспитател/i,
  /собес/i,
  /интервью/i,
  /ульпан/i,
  /иврит/i,
  /не понима/i,
  /ступор/i,
  /боюсь/i,
  /страх/i,
  /стыдно/i,
  /перевод/i,
  /произношен/i,
  /мисрад/i,
  /поликлиник/i,
  /макаби/i,
  /клалит/i,
];

function matchesTrigger(text) {
  return TRIGGER_PATTERNS.some((p) => p.test(text));
}

function loadLeads() {
  if (!fs.existsSync(LEADS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLeads(leads) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
}

async function analyzeWithGroqOrFallback(rawText) {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const systemPrompt = `Ты — эксперт по языковой адаптации в Израиле для проекта «Ульпан Алеф».
Проанализируй сообщение из чата Израиля.
Верни строго JSON:
{
  "isTargetLead": boolean,
  "painCategory": "courier_call" | "kindergarten" | "clinic" | "interview" | "speaking_barrier" | "other",
  "confidence": number,
  "painSummary": string,
  "targetDeepLink": string,
  "suggestedReply": string
}`;

  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Сообщение: "${rawText}"` },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return JSON.parse(content);
      }
    } catch (e) {
      console.warn('[Radar] Groq API warning, using heuristic fallback:', e.message);
    }
  }

  // Fallback
  const isCourier = /курьер|вольт|wolt/i.test(rawText);
  const isInterview = /собес|интервью/i.test(rawText);
  const isKinder = /садик|воспитател/i.test(rawText);

  return {
    isTargetLead: true,
    painCategory: isCourier ? 'courier_call' : isInterview ? 'interview' : isKinder ? 'kindergarten' : 'speaking_barrier',
    confidence: 8,
    painSummary: isCourier ? 'Звонки курьеров' : isInterview ? 'Собеседование на иврите' : 'Разговор в детском саду',
    targetDeepLink: isCourier ? '/lessons/1/call' : isInterview ? '/decks/it-interview' : '/decks/kindergarten',
    suggestedReply: `Очень вас понимаю! В Ульпане Алеф как раз есть интерактивный тренажер для этой ситуации: https://ulpana-alef.com${isCourier ? '/lessons/1/call' : '/decks/it-interview'}?promo=RADAR`,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const isSummary = args.includes('--summary') || args.length === 0;
  const isScan = args.includes('--scan');
  const msgArg = args.find((a) => a.startsWith('--msg='));

  if (msgArg) {
    const text = msgArg.split('=')[1];
    console.log(`\n🔎 Анализ входящего сообщения: "${text}"`);
    if (!matchesTrigger(text)) {
      console.log('❌ Сообщение отфильтровано (нет языковых триггеров).');
      return;
    }
    const analysis = await analyzeWithGroqOrFallback(text);
    console.log('✅ Результат анализа:', JSON.stringify(analysis, null, 2));
    return;
  }

  if (isScan) {
    console.log('\n🚀 Запуск суточного сканирования чатов...');
    const sampleIncoming = [
      { chat: 'WhatsApp: Репатрианты Хайфа', author: 'Ирина (+972 54-222-3344)', text: 'Вчера курьер позвонил, кричал в трубку "ани лемата", я от страха сбросила...' },
      { chat: 'Telegram: Чат Бат-Ям', author: '@alex_by', text: 'Продаю стиральную машинку Bosch, 500 шекелей.' },
      { chat: 'Telegram: Израиль IT', author: '@marat_dev', text: 'Как подготовиться к интервью на иврите, если уровень только алеф?' },
    ];

    const leads = loadLeads();
    let addedCount = 0;

    for (const msg of sampleIncoming) {
      if (!matchesTrigger(msg.text)) {
        console.log(`  ⚪ Пропущено: "${msg.text.slice(0, 40)}..."`);
        continue;
      }
      console.log(`  🎯 Триггер сработал: "${msg.text.slice(0, 40)}..."`);
      const analysis = await analyzeWithGroqOrFallback(msg.text);
      if (analysis.isTargetLead) {
        leads.unshift({
          id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          sourceChannel: msg.chat.toLowerCase().includes('whatsapp') ? 'whatsapp' : 'telegram',
          sourceChatName: msg.chat,
          authorName: msg.author,
          authorContact: msg.author,
          rawText: msg.text,
          aiAnalysis: analysis,
          status: 'new',
        });
        addedCount++;
      }
    }

    saveLeads(leads);
    console.log(`\n✅ Сканирование завершено. Добавлено новых лидов: ${addedCount}`);
  }

  if (isSummary) {
    const leads = loadLeads();
    console.log('\n📊 ТЕКУЩИЕ ЛИДЫ В БАЗЕ ПАРТИЗАНСКОГО РАДАРА:');
    console.log(`Всего лидов: ${leads.length} | Новых: ${leads.filter((l) => l.status === 'new').length}`);
    console.log('─'.repeat(80));
    for (const l of leads.slice(0, 5)) {
      console.log(`[${l.status.toUpperCase()}] ${l.sourceChatName} | ${l.authorName} (🔥 ${l.aiAnalysis.confidence}/10)`);
      console.log(`  Боль: ${l.aiAnalysis.painSummary}`);
      console.log(`  Экран: ${l.aiAnalysis.targetDeepLink}`);
      console.log(`  Ответ: "${l.aiAnalysis.suggestedReply.slice(0, 70)}..."`);
      console.log('─'.repeat(80));
    }
  }
}

main().catch(console.error);
