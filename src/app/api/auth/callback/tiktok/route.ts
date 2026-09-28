import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code') || '';
  const state = searchParams.get('state') || '';
  const error = searchParams.get('error') || '';
  const errorDescription = searchParams.get('error_description') || '';

  if (error) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <title>Ошибка авторизации TikTok</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
          .card { background: #1e293b; padding: 2rem; border-radius: 1rem; max-width: 500px; border: 1px solid #ef4444; }
          h1 { color: #ef4444; font-size: 1.5rem; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Ошибка авторизации TikTok</h1>
          <p>Код ошибки: <strong>${error}</strong></p>
          <p>${errorDescription}</p>
        </div>
      </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const localRedirectUrl = `http://localhost:8085/callback?${searchParams.toString()}`;

  const html = `<!DOCTYPE html>
  <html lang="ru">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ульпан Алеф — Авторизация TikTok</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        background: #090d16;
        color: #f8fafc;
      }
      .card {
        background: #111827;
        padding: 2.5rem;
        border-radius: 1.25rem;
        max-width: 550px;
        text-align: center;
        border: 1px solid rgba(59, 130, 246, 0.3);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      }
      .icon { font-size: 3rem; margin-bottom: 1rem; }
      h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #60a5fa; }
      p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
      .code-box {
        background: #030712;
        border: 1px solid #374151;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        font-family: monospace;
        font-size: 0.85rem;
        word-break: break-all;
        margin: 1.25rem 0;
        color: #34d399;
      }
      .btn {
        display: inline-block;
        background: #2563eb;
        color: #fff;
        text-decoration: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 0.95rem;
        border: none;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn:hover { background: #1d4ed8; }
      .status { margin-top: 1rem; font-size: 0.85rem; color: #10b981; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="icon">🎬</div>
      <h1>Успешная авторизация TikTok</h1>
      <p>TikTok подтвердил доступ к каналу «Ульпан Алеф». Перенаправляем данные в локальный скрипт публикации...</p>
      
      <div class="code-box" id="authCode">${code ? code : 'Код не передан'}</div>
      
      <a class="btn" href="${localRedirectUrl}">Перейти в консоль публикации</a>
      <div class="status" id="bridgeStatus">Связываемся с локальным терминалом...</div>
    </div>

    <script>
      const target = '${localRedirectUrl}';
      if ('${code}') {
        fetch(target, { mode: 'no-cors' })
          .then(() => {
            document.getElementById('bridgeStatus').innerText = '✅ Успешно передано в скрипт! Можно закрыть вкладку.';
          })
          .catch(() => {
            document.getElementById('bridgeStatus').innerHTML = 'Если скрипт запущен на компьютере, нажмите синюю кнопку выше или скопируйте код.';
          });
      }
    </script>
  </body>
  </html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
