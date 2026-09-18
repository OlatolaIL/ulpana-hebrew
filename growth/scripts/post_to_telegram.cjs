/**
 * Скрипт публикации постов в Telegram-канал @ulpana_il или группу
 * 
 * Использование:
 *   node growth/scripts/post_to_telegram.cjs --preview           # Предпросмотр тестового поста
 *   node growth/scripts/post_to_telegram.cjs --send              # Отправка тестового поста в @ulpana_il
 *   node growth/scripts/post_to_telegram.cjs --file=post.md --send
 */

const fs = require('fs');
const path = require('path');

// Загрузка переменных окружения из .env.local
try {
  if (fs.existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
  }
} catch (e) {
  console.warn('Не удалось автоматически загрузить .env.local через loadEnvFile');
}

const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
const defaultTargetChat = '@ulpana_il';

// Разбор аргументов командной строки
const args = process.argv.slice(2);
const isSend = args.includes('--send');
const isPreview = args.includes('--preview') || !isSend;
const fileArg = args.find(a => a.startsWith('--file='));
const filePath = fileArg ? fileArg.split('=')[1] : null;
const chatArg = args.find(a => a.startsWith('--chat='));
const targetChat = chatArg ? chatArg.split('=')[1] : defaultTargetChat;

// Образец аутентичного поста «Ульпан Алеф»
const samplePost = {
  html: `🇮🇱 <b>Как не впасть в ступор, когда звонит израильский курьер</b>

Знакомый холодок по спине? Телефон звонит с неизвестного 05x, и в трубку скороговоркой:
<i>«Шалом! Ани лемата, ма а-код шел а-интерком?»</i>

В ульпане нас учили читать стихи Бялика, но не объяснили, как спасти свой заказ из Wolt.

<b>3 фразы, которые спасут вас сегодня:</b>

1️⃣ <b>Код домофона:</b>
«הַקּוֹד שֶׁל הָאִינְטֶרְקוֹם זֶה אַרְבַּע-אֶחָד-שְׁתַּיִם»
<i>hа-код шель hа-интерком зэ арба-эхад-штайм</i>
(Код домофона — 412)

2️⃣ <b>Оставить у двери (если вы заняты):</b>
«תַּשְׁאִיר לְיַד הַדֶּלֶת, תּוֹדָה!»
<i>ташъир ле-йад hа-дэлет, тода!</i>
(Оставь возле двери, спасибо!)

3️⃣ <b>Если домофон сломался:</b>
«הָאִינְטֶרְקוֹם לֹא עוֹבֵד, אֲנִי יוֹרֵד לְמַטָּה»
<i>hа-интерком ло овед, ани йорэд лемата</i>
(Домофон не работает, я спускаюсь вниз)

💡 <b>Боитесь отвечать голосом?</b>
Потренируйте этот разговор в нашем симуляторе звонков. Виртуальный курьер позвонит вам прямо в приложении — можно ошибаться сколько угодно, пока не пропадет страх!`,
  buttonText: '📞 Потренировать звонок в тренажёре',
  buttonUrl: 'https://ulpana-hebrew.vercel.app'
};

async function main() {
  let messageText = samplePost.html;
  let btnText = samplePost.buttonText;
  let btnUrl = samplePost.buttonUrl;

  if (filePath && fs.existsSync(filePath)) {
    messageText = fs.readFileSync(filePath, 'utf8');
  }

  console.log('=====================================================');
  console.log(`🎯 ЦЕЛЕВОЙ ЧАТ: ${targetChat}`);
  console.log(`🤖 РЕЖИМ: ${isSend ? '🚀 ОТПРАВКА' : '👀 ПРЕДПРОСМОТР (DRY RUN)'}`);
  console.log('=====================================================\n');
  console.log(messageText);
  console.log('\n-----------------------------------------------------');
  console.log(`Кнопка: [${btnText}] -> ${btnUrl}`);
  console.log('-----------------------------------------------------\n');

  if (!isSend) {
    console.log('💡 Для реальной отправки в канал запустите с флагом --send:');
    console.log('   node growth/scripts/post_to_telegram.cjs --send\n');
    return;
  }

  if (!botToken) {
    console.error('❌ ОШИБКА: Переменная TELEGRAM_BOT_TOKEN не найдена в .env.local!');
    process.exit(1);
  }

  console.log(`📡 Отправка сообщения через Telegram Bot API в ${targetChat}...`);

  const payload = {
    chat_id: targetChat,
    text: messageText,
    parse_mode: 'HTML',
    disable_web_page_preview: false,
    reply_markup: {
      inline_keyboard: [
        [{ text: btnText, url: btnUrl }]
      ]
    }
  };

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.ok) {
      console.log(`✅ УСПЕШНО ОПУБЛИКОВАНО! Message ID: ${data.result.message_id}`);
    } else {
      console.error('❌ Ошибка Telegram API:', data.description || data);
    }
  } catch (err) {
    console.error('❌ Сетевая ошибка при отправке:', err.message);
  }
}

main().catch(console.error);
