import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Условия использования • Ульпан Алеф (Terms of Service)',
  description: 'Пользовательское соглашение и условия использования интерактивной платформы изучения иврита «Ульпан Алеф».',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl">
        <div className="border-b border-slate-800 pb-6 mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm font-medium mb-3 inline-block">
            ← Вернуться в Ульпан Алеф
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Условия использования сервиса «Ульпан Алеф»
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Terms of Service • Последнее обновление: 28 сентября 2026 г. • Израиль
          </p>
        </div>

        <div className="space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Общие положения</h2>
            <p>
              Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между создателями
              и администрацией интерактивного образовательного веб-приложения <strong>«Ульпан Алеф»</strong> 
              (далее — «Сервис», сайт: <code>ulpana-hebrew.vercel.app</code>) и любым физическим лицом, 
              использующим Сервис (далее — «Пользователь»).
            </p>
            <p className="mt-2">
              Используя Сервис, регистрируясь через социальные сети или выполняя упражнения, Пользователь выражает
              полное и безоговорочное согласие с условиями настоящего Соглашения. В случае несогласия с условиями 
              использование Сервиса должно быть прекращено.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Статус проекта и оператора</h2>
            <p>
              Сервис «Ульпан Алеф» является независимым программным образовательным проектом, разрабатываемым 
              авторской командой для репатриантов и изучающих современный иврит в Государстве Израиль и по всему миру. 
              Сервис находится в режиме постоянного развития и совершенствования.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Предмет услуг</h2>
            <p>
              Сервис предоставляет доступ к интерактивным обучающим материалам:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-300">
              <li>Теоретические материалы и грамматические разборы 100 уроков современного иврита;</li>
              <li>Словарные тренажёры, карточки слов и слуховые комплексы (ComplexDrills);</li>
              <li>Интерактивные диалоги и речевые тренажёры с использованием технологий синтеза (TTS) и распознавания речи (STT);</li>
              <li>AI-симулятор телефонных разговоров для отработки бытовых коммуникативных сценариев в Израиле.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Интеллектуальная собственность</h2>
            <p>
              Все методические материалы, программный код, дизайн, аудиозаписи, тексты заданий и упражнений 
              защищены законодательством об интеллектуальной собственности Государства Израиль и международными нормами.
              Запрещается несанкционированное копирование, парсинг, воспроизведение или коммерческое распространение 
              материалов Сервиса без письменного разрешения правообладателей.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Ограничение ответственности</h2>
            <p>
              Сервис предоставляется по принципу «как есть» (as is). Мы прикладываем максимальные усилия для обеспечения
              высокого академического качества и соответствия нормам современного иврита (включая стандарты Академии языка иврит 
              и материалы Pealim), однако Сервис не заменяет собой государственные экзамены и не выдаёт государственные дипломы 
              об окончании ульпана.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Применимое право</h2>
            <p>
              Настоящее Соглашение регулируется и толкуется в соответствии с законодательством Государства Израиль.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">7. Контакты и обратная связь</h2>
            <p>
              По всем вопросам, предложениям или запросам по работе Сервиса вы можете обращаться:
            </p>
            <div className="mt-3 p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 text-sm">
              <p>📧 Email: <a href="mailto:support@ulpana.app" className="text-blue-400 hover:underline">support@ulpana.app</a> / <a href="mailto:azrieli.pro@gmail.com" className="text-blue-400 hover:underline">azrieli.pro@gmail.com</a></p>
              <p className="mt-1">💬 Telegram: <a href="https://t.me/ulpana_il" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">@ulpana_il</a></p>
              <p className="mt-1">🌐 Веб-сайт: <a href="https://ulpana-hebrew.vercel.app" className="text-blue-400 hover:underline">https://ulpana-hebrew.vercel.app</a></p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
