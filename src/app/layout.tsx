import type { Metadata } from 'next';
import { Rubik, Assistant } from 'next/font/google';
import './globals.css';

const rubik = Rubik({
  variable: '--font-rubik',
  subsets: ['hebrew', 'latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
});

const assistant = Assistant({
  variable: '--font-assistant',
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Ульпана • Курс иврита (100 уроков: Алеф и Бет)',
  description:
    'Интерактивное обучение ивриту от нуля до уверенного уровня: теория, словари, карточки и живая разговорная практика с искусственным интеллектом.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ульпана',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      className={`${rubik.variable} ${assistant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
        {children}
      </body>
    </html>
  );
}
