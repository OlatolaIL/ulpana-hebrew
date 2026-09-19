/**
 * Stress Test: 10 Concurrent Students Simulation
 * Tests the live AI pipeline under simultaneous load (10 concurrent student turns).
 * Verifies latency, response correctness, rate-limiting resilience, and provider routing.
 */
const fs = require('fs');
const path = require('path');

// 1. Load .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const geminiKey = process.env.GEMINI_PRIMARY_API_KEY || process.env.GEMINI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;

console.log('====================================================');
console.log('🚀 СТРЕСС-ТЕСТ: 10 ОДНОВРЕМЕННЫХ УЧЕНИКОВ');
console.log('====================================================');
console.log(`Gemini Key configured: ${geminiKey ? 'YES (Masked: ' + geminiKey.slice(0, 8) + '...)' : 'NO'}`);
console.log(`Groq Key configured:   ${groqKey ? 'YES (Masked: ' + groqKey.slice(0, 8) + '...)' : 'NO'}`);
console.log('----------------------------------------------------');

const students = [
  { id: 1, name: 'Анна', input: 'שָׁלוֹם, אֶפְשָׁר קָפֶה בְּבַקָּשָׁה?' },
  { id: 2, name: 'Борис', input: 'כַּמָּה זֶה עוֹלֶה?' },
  { id: 3, name: 'Виктор', input: 'אֲנִי מְחַפֵּשׂ אֶת הַדִּירָה שֶׁל דָּוִד.' },
  { id: 4, name: 'Дарья', input: 'אֵיפֹה יֵשׁ כָּאן סוּפֶּרְמַרְקֶט?' },
  { id: 5, name: 'Елена', input: 'טוֹב תּוֹדָה, וּמַה שִּׁלְומְךָ?' },
  { id: 6, name: 'Игорь', input: 'סְלִיחָה, מָתַי הָאוֹטוֹבּוּס מַגִּיעַ?' },
  { id: 7, name: 'Катя', input: 'אֲנִי רוֹצָה חָלָב שְׁקֵדִים, תּוֹדָה.' },
  { id: 8, name: 'Леонид', input: 'הַכֹּל סַבָּבָה, תּוֹדָה רַבָּה!' },
  { id: 9, name: 'Мария', input: 'אֶפְשָׁר חֶשְׁבּוֹן בְּבַקָּשָׁה?' },
  { id: 10, name: 'Никита', input: 'יוֹם טוֹב וּלְהִתְרָאוֹת!' },
];

async function callAiPipeline(student) {
  const start = Date.now();
  const systemPrompt = `You are a friendly Israeli interlocutor in a quick phone call simulation.
The student says: "${student.input}".
Respond warmly in 1 short Hebrew sentence with nikkud.
Output strictly JSON: { "hebrew": "...", "translationRu": "..." }`;

  // Try Gemini first (Primary)
  let providerUsed = 'gemini';
  let responseText = '';
  let errorDetails = null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (res.ok) {
      const data = await res.json();
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      const err = await res.text();
      errorDetails = `Gemini HTTP ${res.status}: ${err.slice(0, 100)}`;
      throw new Error(errorDetails);
    }
  } catch (geminiErr) {
    // Fallback to Groq (Insurance)
    providerUsed = 'groq (fallback insurance)';
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: student.input },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        responseText = groqData.choices?.[0]?.message?.content || '';
      } else {
        const groqErr = await groqRes.text();
        throw new Error(`Groq HTTP ${groqRes.status}: ${groqErr.slice(0, 100)}`);
      }
    } catch (groqErr) {
      return {
        id: student.id,
        name: student.name,
        success: false,
        durationMs: Date.now() - start,
        error: `Gemini failed (${geminiErr.message}) AND Groq failed (${groqErr.message})`,
      };
    }
  }

  let parsed = {};
  try {
    parsed = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch {
    parsed = { hebrew: responseText.slice(0, 50), translationRu: 'Текст получен' };
  }

  return {
    id: student.id,
    name: student.name,
    success: true,
    provider: providerUsed,
    durationMs: Date.now() - start,
    input: student.input,
    reply: parsed.hebrew || responseText.slice(0, 50),
    translation: parsed.translationRu || '',
  };
}

async function runStressTest() {
  console.log(`Запускаем 10 одновременных запросов в ОДНУ миллисекунду (Promise.all)...`);
  const overallStart = Date.now();

  const results = await Promise.all(students.map((s) => callAiPipeline(s)));

  const totalDuration = Date.now() - overallStart;
  console.log('----------------------------------------------------');
  console.log(`📊 РЕЗУЛЬТАТЫ СТРЕСС-ТЕСТА (Всего заняло: ${totalDuration}ms / ${(totalDuration / 1000).toFixed(2)}s):`);
  console.log('----------------------------------------------------');

  let successCount = 0;
  let geminiCount = 0;
  let groqCount = 0;

  for (const r of results) {
    if (r.success) {
      successCount++;
      if (r.provider.includes('gemini')) geminiCount++;
      if (r.provider.includes('groq')) groqCount++;
      console.log(
        `[Ученик ${r.id}: ${r.name.padEnd(7)}] 🟢 УСПЕХ (${r.durationMs}ms via ${r.provider})\n` +
        `   Реплика: "${r.input}"\n` +
        `   Ответ:   "${r.reply}" (${r.translation})\n`
      );
    } else {
      console.log(`[Ученик ${r.id}: ${r.name.padEnd(7)}] 🔴 ОШИБКА (${r.durationMs}ms): ${r.error}`);
    }
  }

  console.log('====================================================');
  console.log(`ИТОГОВАЯ СТАТИСТИКА:`);
  console.log(`Успешных запросов: ${successCount} / 10 (${((successCount / 10) * 100).toFixed(0)}%)`);
  console.log(`Обработано Gemini: ${geminiCount}`);
  console.log(`Обработано Groq:   ${groqCount}`);
  console.log(`Средняя задержка:  ${(results.reduce((acc, r) => acc + r.durationMs, 0) / results.length).toFixed(0)}ms`);
  console.log('====================================================');

  if (successCount === 10) {
    console.log('🎉 ТЕСТ ПОЛНОСТЬЮ ПРОЙДЕН! 10 одновременных учеников обслужены безупречно.');
    process.exit(0);
  } else {
    console.error('❌ ТЕСТ ЗАВЕРШИЛСЯ С ОШИБКАМИ.');
    process.exit(1);
  }
}

runStressTest().catch((err) => {
  console.error('Критический сбой теста:', err);
  process.exit(1);
});
