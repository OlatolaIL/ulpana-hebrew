import React from 'react';
import { Phone, PhoneCall, Info, BookOpen, Smartphone } from 'lucide-react';
import { UserProfile, PhoneScenario } from '@/types';

interface IdleCallViewProps {
  scenario: PhoneScenario;
  userProfile: UserProfile;
  onStartCall: () => void;
  onOpenWordsDrawer: () => void;
}

export const IdleCallView: React.FC<IdleCallViewProps> = ({
  scenario,
  userProfile,
  onStartCall,
  onOpenWordsDrawer,
}) => {
  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
        {/* Аватар контакта */}
        <div className="relative mb-5">
          <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700/80 flex items-center justify-center text-4xl shadow-inner">
            {scenario.avatarEmoji}
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center text-white">
            <Phone className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Имя и роль */}
        <h2 className="text-2xl font-bold text-white font-hebrew tracking-wide">
          {scenario.callerName}
        </h2>
        <p className="text-sm font-semibold text-blue-400 mt-0.5">
          {scenario.callerNameRu}
        </p>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm font-hebrew">
          {scenario.callerRole}
        </p>

        {/* Контекст ситуации */}
        <div className="w-full bg-zinc-800/60 backdrop-blur border border-zinc-700/60 rounded-2xl p-4 my-4 text-left text-xs sm:text-sm text-zinc-300">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200 mb-1.5 font-hebrew">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Ситуация звонка:</span>
          </div>
          <p className="leading-relaxed font-hebrew">
            {scenario.situationSummary}
          </p>

          {/* Цели разговора */}
          <div className="mt-3 pt-3 border-t border-zinc-700/50">
            <span className="font-bold text-zinc-200 text-xs block mb-1.5 font-hebrew">
              🎯 Ваши задачи в разговоре:
            </span>
            <ul className="space-y-1 text-xs text-zinc-400 font-hebrew">
              {scenario.goals.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Кнопка вызова шторки полезных фраз и подсказок к звонку */}
        {scenario.usefulWords && scenario.usefulWords.length > 0 && (
          <button
            type="button"
            onClick={onOpenWordsDrawer}
            className="w-full bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 hover:border-blue-500/50 rounded-2xl p-3.5 mb-5 flex items-center justify-between gap-3 text-left transition group cursor-pointer font-hebrew shadow-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-blue-300 transition truncate">
                  {`Полезные фразы и подсказки (${scenario.usefulWords.length})`}
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  Нажмите, чтобы открыть шторку с переводом и озвучкой 🔊
                </div>
              </div>
            </div>

            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/40 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
              Шторка 📖 →
            </span>
          </button>
        )}

        {/* Совет по звуку для мобильных устройств */}
        <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 mb-4 text-left text-xs text-amber-200/90 flex items-start gap-2.5">
          <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="font-bold text-amber-300">
              💡 Совет перед звонком:{' '}
            </span>
            <span>
              На телефоне убедитесь, что выключен беззвучный режим (переключатель Silent сбоку на iPhone) и включена громкость.
            </span>
          </div>
        </div>

        {/* Кнопка запуска звонка */}
        <button
          onClick={onStartCall}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 active:scale-[0.98] transition font-bold text-white text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25 cursor-pointer font-hebrew"
        >
          <PhoneCall className="w-6 h-6 animate-pulse" />
          <span>Позвонить • לְהִתְקַשֵּׁר</span>
        </button>
      </div>
    </div>
  );
};
