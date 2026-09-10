import React from 'react';
import { createPortal } from 'react-dom';
import { Volume2, X, Smartphone, Headphones } from 'lucide-react';
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
                {userProfile.ulpanMode ? 'אֵין קוֹל בַּשִּׂיחָה? מַה לַּעֲשׂוֹת' : 'Не слышно собеседника?'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {userProfile.ulpanMode ? 'בְּדִיקַת שֵׁמַע וְהַגְדָּרוֹת' : 'Быстрая проверка звука на устройстве'}
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
