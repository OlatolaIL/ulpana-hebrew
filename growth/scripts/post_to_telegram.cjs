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
const videoArg = args.find(a => a.startsWith('--video='));
const videoPath = videoArg ? videoArg.split('=')[1] : null;
const photoArg = args.find(a => a.startsWith('--photo='));
const photoPath = photoArg ? photoArg.split('=')[1] : null;
const audioArg = args.find(a => a.startsWith('--audio='));
const audioPath = audioArg ? audioArg.split('=')[1] : null;
const audioTitleArg = args.find(a => a.startsWith('--audio-title='));
const audioTitle = audioTitleArg ? audioTitleArg.split('=')[1] : 'Памятка: 4 фразы на иврите';
const audioCaptionArg = args.find(a => a.startsWith('--audio-caption='));
const audioCaption = audioCaptionArg ? audioCaptionArg.split('=')[1] : '🎧 Озвучка фраз: слушайте и повторяйте с правильным произношением!';
const btnTextArg = args.find(a => a.startsWith('--btn-text='));
const customBtnText = btnTextArg ? btnTextArg.split('=')[1] : null;
const btnUrlArg = args.find(a => a.startsWith('--btn-url='));
const customBtnUrl = btnUrlArg ? btnUrlArg.slice(btnUrlArg.indexOf('=') + 1) : null;

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
  let btnText = customBtnText || samplePost.buttonText;
  let btnUrl = customBtnUrl || samplePost.buttonUrl;

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

  if (videoPath && fs.existsSync(videoPath)) {
    console.log(`📡 Загрузка и отправка видео через sendVideo в ${targetChat}...`);
    console.log(`📁 Видео: ${videoPath} (${(fs.statSync(videoPath).size / 1024 / 1024).toFixed(2)} MB)`);

    const formData = new FormData();
    formData.append('chat_id', targetChat);
    const videoBuffer = fs.readFileSync(videoPath);
    formData.append('video', new Blob([videoBuffer], { type: 'video/mp4' }), path.basename(videoPath));
    formData.append('caption', messageText);
    formData.append('parse_mode', 'HTML');
    formData.append('supports_streaming', 'true');
    if (btnText && btnUrl) {
      formData.append('reply_markup', JSON.stringify({
        inline_keyboard: [[{ text: btnText, url: btnUrl }]]
      }));
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendVideo`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.ok) {
        console.log(`🎉 ВИДЕО УСПЕШНО ОПУБЛИКОВАНО В ТЕЛЕГРАМ! Message ID: ${data.result.message_id}`);
      } else {
        console.error('❌ Ошибка Telegram API:', data.description || data);
      }
    } catch (err) {
      console.error('❌ Сетевая ошибка при отправке видео:', err.message);
    }
    return;
  }

  // Обработка отправки фотографии
  if (photoPath && fs.existsSync(photoPath)) {
    console.log(`📡 Загрузка и отправка фото через sendPhoto в ${targetChat}...`);
    console.log(`📁 Фото: ${photoPath} (${(fs.statSync(photoPath).size / 1024).toFixed(1)} KB)`);

    const photoBuffer = fs.readFileSync(photoPath);
    const mimeType = photoPath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    if (messageText.length <= 1024) {
      // Весь текст помещается в caption к фото
      const formData = new FormData();
      formData.append('chat_id', targetChat);
      formData.append('photo', new Blob([photoBuffer], { type: mimeType }), path.basename(photoPath));
      formData.append('caption', messageText);
      formData.append('parse_mode', 'HTML');
      if (btnText && btnUrl) {
        formData.append('reply_markup', JSON.stringify({
          inline_keyboard: [[{ text: btnText, url: btnUrl }]]
        }));
      }

      try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.ok) {
          console.log(`🎉 ФОТО-ПОСТ УСПЕШНО ОПУБЛИКОВАН! Message ID: ${data.result.message_id}`);
        } else {
          console.error('❌ Ошибка Telegram API sendPhoto:', data.description || data);
        }
      } catch (err) {
        console.error('❌ Сетевая ошибка при отправке фото:', err.message);
      }
    } else {
      // Текст длинный (>1024 символов): сначала фото-обложка, затем полный текст с кнопкой
      const formData = new FormData();
      formData.append('chat_id', targetChat);
      formData.append('photo', new Blob([photoBuffer], { type: mimeType }), path.basename(photoPath));
      formData.append('caption', '🧸 <b>«Бокер тов, гоненет»: готовые сообщения для детского сада на иврите ⬇️</b>');
      formData.append('parse_mode', 'HTML');

      try {
        const resPhoto = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          body: formData
        });
        const photoData = await resPhoto.json();
        if (photoData.ok) {
          console.log(`🎉 ФОТО-ОБЛОЖКА ОПУБЛИКОВАНА! Message ID: ${photoData.result.message_id}`);
        }
      } catch (err) {
        console.error('❌ Ошибка отправки фото-обложки:', err.message);
      }

      // Публикация основного текста следом
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
          console.log(`✅ ТЕКСТ ПОСТА ОПУБЛИКОВАН! Message ID: ${data.result.message_id}`);
        } else {
          console.error('❌ Ошибка Telegram API sendMessage:', data.description || data);
        }
      } catch (err) {
        console.error('❌ Сетевая ошибка при отправке текста:', err.message);
      }
    }
  } else {
    // Чистый текстовый пост без фото
    console.log(`📡 Отправка текстового сообщения через Telegram Bot API в ${targetChat}...`);

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

  // Обработка отправки аудиофайла (озвучки)
  if (audioPath && fs.existsSync(audioPath)) {
    console.log(`📡 Отправка аудио-шпаргалки через sendAudio в ${targetChat}...`);
    console.log(`📁 Аудио: ${audioPath} (${(fs.statSync(audioPath).size / 1024).toFixed(1)} KB)`);

    const audioBuffer = fs.readFileSync(audioPath);
    const audioForm = new FormData();
    audioForm.append('chat_id', targetChat);
    audioForm.append('audio', new Blob([audioBuffer], { type: 'audio/mpeg' }), path.basename(audioPath));
    audioForm.append('title', audioTitle);
    audioForm.append('performer', 'Ульпан Алеф');
    audioForm.append('caption', audioCaption);
    audioForm.append('parse_mode', 'HTML');

    try {
      const resAudio = await fetch(`https://api.telegram.org/bot${botToken}/sendAudio`, {
        method: 'POST',
        body: audioForm
      });
      const audioData = await resAudio.json();
      if (audioData.ok) {
        console.log(`🎧 АУДИО УСПЕШНО ОПУБЛИКОВАНО В ТЕЛЕГРАМ! Message ID: ${audioData.result.message_id}`);
      } else {
        console.error('❌ Ошибка Telegram API sendAudio:', audioData.description || audioData);
      }
    } catch (err) {
      console.error('❌ Сетевая ошибка при отправке аудио:', err.message);
    }
  }
}

main().catch(console.error);
