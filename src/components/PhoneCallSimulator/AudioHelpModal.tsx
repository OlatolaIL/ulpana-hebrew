import React from 'react';
import { createPortal } from 'react-dom';
import { Volume2, X, Smartphone, Headphones, Mic, MessageCircle } from 'lucide-react';
import { UserProfile } from '@/types';
import { unlockAudio } from '@/lib/audioNotifier';
import { phoneAudio } from '@/lib/phoneAudio';

interface AudioHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  audioHelpUnlocked: boolean;
  setAudioHelpUnlocked: (val: boolean) => void;
  mounted: boolean;
}

export const AudioHelpModal: React.FC<AudioHelpModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  audioHelpUnlocked,
  setAudioHelpUnlocked,
  mounted,
}) => {
  if (!mounted || !isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 font-sans"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-700/80 text-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-zinc-100 font-hebrew">
                Не слышно собеседника?
              </h3>
              <p className="text-[11px] text-zinc-400">
                Быстрая проверка звука на устройстве
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Пункты проверки */}
        <div className="p-5 space-y-3.5 text-xs text-zinc-300">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/50">
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-100 block mb-0.5">
                1. Переключатель Silent Mode (iPhone)
              </span>
              <span>
                На левой грани iPhone переведите тумблер в обычный режим (оранжевая полоска не должна быть видна). В бесшумном режиме iOS полностью глушит голос бота.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/50">
            <Volume2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-100 block mb-0.5">
                2. Громкость мультимедиа
              </span>
              <span>
                Нажмите физическую кнопку громкости «+» на корпусе устройства прямо сейчас.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/50">
            <Headphones className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-100 block mb-0.5">
                3. Наушники и Bluetooth
              </span>
              <span>
                Проверьте, не подключен ли телефон к беспроводным наушникам в чехле или колонке в другой комнате.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/50">
            <Mic className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-100 block mb-0.5">
                4. Доступ к микрофону и интернет
              </span>
              <span>
                Убедитесь, что в настройках браузера разрешён доступ к микрофону для этого сайта, а интернет-соединение стабильно. Телефонный звонок — это 100% голосовой тренажёр.
              </span>
            </div>
          </div>
        </div>

        {/* Действие: принудительная разблокировка звука в браузере */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex flex-col gap-2">
          <button
            type="button"
            onClick={async () => {
              await unlockAudio();
              await phoneAudio.playPickupSound();
              setAudioHelpUnlocked(true);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>
              {audioHelpUnlocked
                ? '✓ Звук активирован! Проверьте громкость'
                : 'Включить и проверить звук в браузере 🔊'}
            </span>
          </button>

          <a
            href="https://t.me/Osa_IL?text=%D7%A9%D7%9C%D7%95%D7%9D!%20%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%92%D0%BE%D0%B7%D0%BD%D0%B8%D0%BA%D0%BB%D0%B0%20%D0%BF%D1%80%D0%BE%D0%B1%D0%BB%D0%B5%D0%BC%D0%B0%20%D1%81%D0%BE%20%D0%B7%D0%B2%D1%83%D0%BA%D0%BE%D0%BC/%D0%BC%D0%B8%D0%BA%D1%80%D0%BE%D1%84%D0%BE%D0%BD%D0%BE%D0%BC%20%D0%B2%20%D1%82%D0%B5%D0%BB%D0%B5%D1%84%D0%BE%D0%BD%D0%BD%D0%BE%D0%BC%20%D0%B7%D0%B2%D0%BE%D0%BD%D0%BA%D0%B5%20%D0%BD%D0%B0%20%D0%BF%D0%BB%D0%B0%D1%82%D1%84%D0%BE%D1%80%D0%BC%D0%B5%20%C2%AB%D7%A3%D7%9C%D7%A4%D7%90%D7%9F%20%D7%90%D7%9C%D7%A4%C2%BB."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-xl border border-zinc-700 hover:border-blue-500/50 bg-zinc-800/50 hover:bg-zinc-800 text-xs font-semibold text-blue-400 hover:text-blue-300 transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Написать разработчику / Сообщить об ошибке</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-3 rounded-xl border border-zinc-700 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition text-center cursor-pointer"
          >
            Понятно, вернуться к звонку
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
