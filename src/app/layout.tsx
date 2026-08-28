import type { Metadata, Viewport } from 'next';
import { Rubik, Assistant } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';

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

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Ульпана • Курс иврита (100 уроков: Алеф и Бет)',
  description:
    'Интерактивное обучение ивриту от нуля до уверенного уровня: теория, словари, карточки и живая разговорная практика с искусственным интеллектом.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ульпана',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
      className={`${rubik.variable} ${assistant.variable} antialiased`}
    >
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 selection:bg-blue-500 selection:text-white">
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
