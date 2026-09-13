'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Loader2, ExternalLink, LogIn, Sparkles } from 'lucide-react';
import { UserSession } from '@/types';

const GoogleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export interface AuthModalReason {
  lessonId?: number;
  title?: string;
  description?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession, gender?: 'male' | 'female', fontStyle?: 'print' | 'cursive') => void;
  botUsername?: string;
  reason?: AuthModalReason | null;
}

type DirectLoginPayload =
  | { initData: string }
  | {
      id?: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
      auth_date?: number;
      hash?: string;
    }
  | Record<string, unknown>;

interface TelegramWebApp {
  initData?: string;
  close?: () => void;
}

interface TelegramUserAuth {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
}

interface GoogleNonOAuthError {
  type?: string;
  message?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

interface GoogleAccountsOAuth2 {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: GoogleTokenResponse) => void;
    error_callback?: (error: GoogleNonOAuthError) => void;
  }) => GoogleTokenClient;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    auto_select?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: string;
      theme?: string;
      size?: string;
      text?: string;
      shape?: string;
      logo_alignment?: string;
      width?: number;
    }
  ) => void;
  prompt: () => void;
}

interface GoogleAccountsNamespace {
  oauth2?: GoogleAccountsOAuth2;
  id?: GoogleAccountsId;
}

interface CustomWindow {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
  onTelegramAuth?: (user: TelegramUserAuth) => void;
  google?: {
    accounts?: GoogleAccountsNamespace;
  };
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'Ulpinebot',
  reason = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);
  const [pollToken, setPollToken] = useState<string | null>(null);
  const [botUrl, setBotUrl] = useState<string | null>(null);
  const [pollStartedAt, setPollStartedAt] = useState(0);
  const [isGoogleButtonRendered, setIsGoogleButtonRendered] = useState(false);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    setIsWaitingForBot(false);
    setPollToken(null);
    setError(null);
    setIsGoogleButtonRendered(false);
  }
  const containerRef = useRef<HTMLDivElement>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const executeLogin = useCallback(
    async (payload: DirectLoginPayload) => {
      try {
        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          onLoginSuccess(data.user, data.gender, data.fontStyle);
          onClose();
        } else {
          setError(data.error || 'Ошибка авторизации');
        }
      } catch {
        setError('Не удалось связаться с сервером авторизации');
      } finally {
        setLoading(false);
      }
    },
    [onClose, onLoginSuccess]
  );

  const handleDirectLogin = useCallback(
    async (payload: DirectLoginPayload) => {
      setLoading(true);
      setError(null);
      await executeLogin(payload);
    },
    [executeLogin]
  );

  const handleGoogleResponse = useCallback(
    async (response: { credential?: string }) => {
      if (!response || !response.credential) {
        setError('Не удалось получить данные от Google');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          onLoginSuccess(data.user, data.gender, data.fontStyle);
          onClose();
        } else {
          setError(data.error || 'Ошибка входа через Google');
        }
      } catch {
        setError('Не удалось связаться с сервером для входа через Google');
      } finally {
        setLoading(false);
      }
    },
    [onClose, onLoginSuccess]
  );

  const handleGoogleAccessToken = useCallback(
    async (accessToken: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          onLoginSuccess(data.user, data.gender, data.fontStyle);
          onClose();
        } else {
          setError(data.error || 'Ошибка входа через Google');
        }
      } catch {
        setError('Не удалось связаться с сервером для входа через Google');
      } finally {
        setLoading(false);
      }
    },
    [onClose, onLoginSuccess]
  );

  const handleGoogleButtonClick = useCallback(() => {
    if (!googleClientId) {
      setError('Вход через Google временно недоступен. Попробуйте Telegram.');
      return;
    }
    const customWindow = window as unknown as CustomWindow;
    const google = customWindow.google;
    if (!google) {
      setError('Библиотека Google еще загружается, пожалуйста подождите секунду...');
      return;
    }

    // Способ 1: Прямой запуск OAuth2 Popup через initTokenClient (не зависит от One Tap)
    if (google.accounts?.oauth2) {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: (tokenResponse: GoogleTokenResponse) => {
            if (tokenResponse?.access_token) {
              handleGoogleAccessToken(tokenResponse.access_token);
            } else if (tokenResponse?.error && tokenResponse.error !== 'popup_closed_by_user') {
              console.warn('[Google OAuth2] error:', tokenResponse.error);
              setError(`Ошибка авторизации Google: ${tokenResponse.error}`);
            }
          },
          error_callback: (nonOAuthError: GoogleNonOAuthError) => {
            console.warn('[Google OAuth2] nonOAuthError:', nonOAuthError);
            if (nonOAuthError?.type !== 'popup_closed') {
              setError('Не удалось открыть окно авторизации Google. Разрешите всплывающие окна в браузере.');
            }
          },
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('[Google OAuth2] init error, fallback to prompt:', err);
      }
    }

    // Способ 2: Fallback на Google One Tap
    if (google.accounts?.id) {
      google.accounts.id.prompt();
    }
  }, [googleClientId, handleGoogleAccessToken]);

  // Запуск входа в 1 клик через Telegram-бота
  const handleStartBotLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/telegram/token', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setPollToken(data.token);
        setPollStartedAt(Date.now());
        setBotUrl(data.botUrl);
        setIsWaitingForBot(true);
        window.open(data.botUrl, '_blank');
      } else {
        setError('Не удалось создать сессию входа');
      }
    } catch {
      setError('Ошибка связи с сервером');
    } finally {
      setLoading(false);
    }
  };

  // 1. Автоматический вход, если приложение открыто внутри Telegram (Mini App / WebApp)
  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;

    try {
      const customWindow = window as unknown as CustomWindow;
      const tg = customWindow.Telegram?.WebApp;
      if (tg && tg.initData) {
        const autoLogin = async (initData: string) => {
          try {
            const res = await fetch('/api/auth/telegram', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData }),
            });
            const data = await res.json();
            if (!ignore) {
              if (res.ok && data.success) {
                onLoginSuccess(data.user, data.gender, data.fontStyle);
                onClose();
              } else {
                setError(data.error || 'Ошибка авторизации');
              }
            }
          } catch {
            if (!ignore) {
              setError('Не удалось связаться с сервером авторизации');
            }
          }
        };

        void autoLogin(tg.initData);
        return () => {
          ignore = true;
        };
      }
    } catch {}

    // Глобальная функция, которую вызывает официальный скрипт Telegram Login Widget
    const customWindow = window as unknown as CustomWindow;
    customWindow.onTelegramAuth = async (user: TelegramUserAuth) => {
      handleDirectLogin(user);
    };

    // Вставляем официальный скрипт Telegram в контейнер
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', botUsername);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '14');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;
      containerRef.current.appendChild(script);
    }

    return () => {
      ignore = true;
      delete (window as unknown as CustomWindow).onTelegramAuth;
    };
  }, [isOpen, botUsername, handleDirectLogin, onClose, onLoginSuccess]);

  // 2. Поллинг статуса подтверждения через Telegram-бота
  useEffect(() => {
    if (!isOpen || !isWaitingForBot || !pollToken) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    const poll = async () => {
      if (cancelled) return;
      if (Date.now() - pollStartedAt >= 10 * 60 * 1000) {
        setIsWaitingForBot(false);
        setError('Время ожидания истекло. Нажмите «Войти через Telegram» ещё раз.');
        return;
      }
      try {
        const res = await fetch(`/api/auth/telegram/token?token=${encodeURIComponent(pollToken)}`, {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
          cache: 'no-store',
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.completed && data.user) {
          setIsWaitingForBot(false);
          onLoginSuccess(data.user, data.gender, data.fontStyle);
          onClose();
          return;
        }
        if (data.status === 'expired' || data.status === 'invalid' || res.status === 400) {
          setIsWaitingForBot(false);
          setError('Ссылка для входа устарела. Начните вход ещё раз.');
          return;
        }
        if (!res.ok) {
          setError('Связь со службой входа временно недоступна. Повторяем проверку…');
        } else {
          setError(null);
        }
      } catch {
        if (cancelled) return;
        setError('Не удалось проверить вход. Проверьте соединение; повторяем попытку…');
      }
      if (!cancelled) timer = setTimeout(poll, 1500);
    };
    timer = setTimeout(poll, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, isWaitingForBot, pollToken, pollStartedAt, onLoginSuccess, onClose]);

  // 3. Инициализация Google Identity Services
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const initGoogle = () => {
      if (!isMounted) return;
      const customWindow = window as unknown as CustomWindow;
      const google = customWindow.google;
      if (!google?.accounts) return;

      if (!googleClientId) return;

      try {
        if (google.accounts.id) {
          google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleResponse,
            auto_select: false,
          });

          if (googleButtonRef.current) {
            googleButtonRef.current.innerHTML = '';
            google.accounts.id.renderButton(googleButtonRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'pill',
              logo_alignment: 'left',
              width: 320,
            });

            // Проверяем, отрисовала ли Google iframe
            setTimeout(() => {
              if (isMounted && googleButtonRef.current && googleButtonRef.current.children.length > 0) {
                setIsGoogleButtonRendered(true);
              }
            }, 100);
          }
        }
      } catch (e) {
        console.warn('[Google Identity] init error:', e);
      }
    };

    const customWindow = window as unknown as CustomWindow;
    if (customWindow.google?.accounts) {
      initGoogle();
    } else {
      const existingScript = document.getElementById('google-jssdk') as HTMLScriptElement | null;
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-jssdk';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => initGoogle();
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener('load', () => initGoogle());
        const timer = setTimeout(() => {
          if ((window as unknown as CustomWindow).google?.accounts) {
            initGoogle();
          }
        }, 400);
        return () => {
          isMounted = false;
          clearTimeout(timer);
        };
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, googleClientId, handleGoogleResponse]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div role="dialog" aria-modal="true" aria-label="Вход и регистрация" className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[90dvh] overflow-y-auto border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          aria-label="Закрыть окно входа"
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Заголовок */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
            <LogIn className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>100% БЕСПЛАТНАЯ РЕГИСТРАЦИЯ</span>
          </div>

          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {reason?.title || 'Вход и регистрация'}
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {reason?.description ||
              'Уроки 1 и 2 открыты всем гостям. Чтобы продолжить обучение с 3-го урока, сохранять свой прогресс и личный словарь — войдите бесплатно в 1 клик без пароля.'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Кнопка 1-клика через Telegram бота */}
        <div className="space-y-3 pt-1">
          {isWaitingForBot ? (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Ожидание подтверждения в боте...</span>
              </div>
              <p className="text-xs text-zinc-500">
                Нажмите кнопку «Старт» в открывшемся диалоге Telegram
              </p>
              {botUrl && (
                <a
                  href={botUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  <span>Не открылось окно? Нажмите здесь</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleStartBotLogin}
                disabled={loading}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#229ED9] hover:bg-[#1E8CC0] active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                <span>Войти через Telegram в 1 клик</span>
              </button>
              <p className="text-[11px] text-center text-zinc-400">
                Бот мгновенно авторизует вас и вернет на сайт
              </p>
            </>
          )}
        </div>

        {/* Разделитель */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
          <span className="flex-shrink mx-3 text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
            или через Google
          </span>
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
        </div>

        {/* Google Sign In */}
        <div className="w-full space-y-2">
          {/* Контейнер для официальной кнопки Google */}
          <div
            ref={googleButtonRef}
            className={`w-full flex justify-center ${!isGoogleButtonRendered ? 'h-0 overflow-hidden' : 'min-h-[44px]'}`}
          />

          {/* Запасная кнопка с гарантированным OAuth2 Popup */}
          {!isGoogleButtonRendered && (
            <button
              type="button"
              onClick={handleGoogleButtonClick}
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 active:scale-98 font-semibold text-sm flex items-center justify-center gap-3 text-zinc-700 dark:text-zinc-200 shadow-sm transition disabled:opacity-50"
            >
              <GoogleIcon className="w-5 h-5" />
              <span>{loading ? 'Авторизация...' : 'Продолжить с Google'}</span>
            </button>
          )}

          <p className="text-[11px] text-center text-zinc-400">
            Вход через аккаунт Google без пароля
          </p>
        </div>

        {/* Преимущества авторизации */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-3 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>100% бесплатно — без банковских карт и скрытых оплат</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Авто-синхронизация прогресса на ПК и телефоне</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Сохранение личного словаря и карточек SRS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
