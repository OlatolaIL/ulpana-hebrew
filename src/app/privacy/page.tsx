import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности • Ульпан Алеф (Privacy Policy)',
  description: 'Политика защиты персональных данных и конфиденциальности образовательной платформы «Ульпан Алеф».',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl">
        <div className="border-b border-slate-800 pb-6 mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm font-medium mb-3 inline-block">
            ← Вернуться в Ульпан Алеф
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Политика конфиденциальности сервиса «Ульпан Алеф»
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Privacy Policy • Последнее обновление: 28 сентября 2026 г. • Государство Израиль
          </p>
        </div>

        <div className="space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Введение и область применения</h2>
            <p>
              Команда образовательного веб-сервиса <strong>«Ульпан Алеф»</strong> (сайт: <code>ulpana-hebrew.vercel.app</code>) 
              с уважением относится к правам пользователей на защиту личной информации. Настоящая Политика 
              разработана с учётом положений <strong>Закона Государства Израиль о защите частной жизни (חוק הגנת הפרטיות, התשמ"א-1981)</strong> 
              и международных стандартов прозрачной обработки данных.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Какие данные мы собираем</h2>
            <p>Сервис собирает исключительно данные, необходимые для процесса обучения:</p>
            <ul className="list-disc list-inside mt-2 space-y-2 text-slate-300">
              <li>
                <strong>Данные авторизации:</strong> при входе через Google или Telegram мы получаем базовый идентификатор, 
                имя пользователя и контактный адрес электронной почты. Мы никогда не получаем доступ к вашим паролям.
              </li>
              <li>
                <strong>Образовательный прогресс:</strong> пройденные уроки, сохранённые слова, результаты тестов, 
                настройки отображения (пол для согласования форм иврита, показ огласовок, скорость речи).
              </li>
              <li>
                <strong>Голосовые данные (микрофон):</strong> во время разговорных упражнений и симулятора звонков 
                аудиозапись с микрофона передаётся исключительно для распознавания речи (Speech-to-Text) и моментальной 
                оценки правильности произношения. Мы не используем аудиозаписи пользователей для обучения публичных моделей 
                и не передаём их рекламным сетям.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Цели обработки информации</h2>
            <p>
              Все собираемые данные используются строго для:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-300">
              <li>Обеспечения работы тренажёров речи и интерактивных звонков;</li>
              <li>Синхронизации учебного прогресса между вашими устройствами;</li>
              <li>Адаптации грамматических форм иврита под ваш выбранный профиль (мужской/женский род);</li>
              <li>Предоставления технической поддержки.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Третьи стороны и безопасность</h2>
            <p>
              Мы не продаём и не передаём персональные данные пользователей третьим лицам в маркетинговых целях. 
              Для работы алгоритмов используются защищённые API проверенных провайдеров (Next.js хостинг Vercel, 
              Google AI Cloud, Whisper API), обрабатывающие запросы по зашифрованным каналам HTTPS/TLS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Права пользователя и удаление данных</h2>
            <p>
              В соответствии с израильским законодательством о защите частной жизни вы имеете право:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-300">
              <li>Запросить копию сохранённых данных о вашем аккаунте;</li>
              <li>Потребовать исправления неточных сведений;</li>
              <li>В любой момент потребовать полного удаления вашего профиля и всех связанных с ним данных.</li>
            </ul>
            <p className="mt-2">
              Для удаления данных достаточно отправить запрос на наш контактный email или в поддержку Telegram.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Контакты лица, ответственного за конфиденциальность</h2>
            <div className="mt-3 p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 text-sm">
              <p>📧 Email: <a href="mailto:privacy@ulpana.app" className="text-blue-400 hover:underline">privacy@ulpana.app</a> / <a href="mailto:azrieli.pro@gmail.com" className="text-blue-400 hover:underline">azrieli.pro@gmail.com</a></p>
              <p className="mt-1">💬 Telegram: <a href="https://t.me/ulpana_il" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">@ulpana_il</a></p>
              <p className="mt-1">🌐 Сервис: <a href="https://ulpana-hebrew.vercel.app" className="text-blue-400 hover:underline">https://ulpana-hebrew.vercel.app</a></p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
