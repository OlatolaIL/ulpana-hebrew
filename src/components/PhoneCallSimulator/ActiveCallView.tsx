import React from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Eye,
  EyeOff,
  Sparkles,
  Send,
  Info,
} from 'lucide-react';
import { UserProfile, PhoneScenario, ChatMessage } from '@/types';
import { speakHebrew } from '@/lib/speech';

interface ActiveCallViewProps {
  scenario: PhoneScenario;
  userProfile: UserProfile;
  callDuration: number;
  formatTimer: (seconds: number) => string;
  isAiSpeaking: boolean;
  isRecording: boolean;
  audioLevel: number;
  isMuted: boolean;
  isAiHangingUp: boolean;
  loadingAi: boolean;
  latestAiMessage?: ChatMessage;
  showSubtitles: boolean;
  onToggleSubtitles: () => void;
  onOpenAudioHelp: () => void;
  liveTranscript: string;
  isEchoFromAi: (transcript: string) => boolean;
  onSendMessage: (
    textToSend?: string,
    meta?: { translation?: string; transcription?: string }
  ) => void;
  speechNotice: string | null;
  textInput: string;
  setTextInput: (val: string) => void;
  showTextInput: boolean;
  setShowTextInput: React.Dispatch<React.SetStateAction<boolean>>;
  onToggleMute: () => void;
  onEndCall: () => void;
}

export const ActiveCallView: React.FC<ActiveCallViewProps> = ({
  scenario,
  userProfile,
  callDuration,
  formatTimer,
  isAiSpeaking,
  isRecording,
  audioLevel,
  isMuted,
  isAiHangingUp,
  loadingAi,
  latestAiMessage,
  showSubtitles,
  onToggleSubtitles,
  onOpenAudioHelp,
  liveTranscript,
  isEchoFromAi,
  onSendMessage,
  speechNotice,
  textInput,
  setTextInput,
  showTextInput,
  setShowTextInput,
  onToggleMute,
  onEndCall,
}) => {
  return (
    <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col min-h-[580px]">
      {/* Верхний бар вызова */}
      <div className="p-4 bg-zinc-800/60 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-700/80 border border-zinc-600 flex items-center justify-center text-xl shadow-inner">
            {scenario.avatarEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white font-hebrew">
                {scenario.callerName}
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  scenario.callType === 'outgoing'
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60'
                    : 'bg-blue-950/70 text-blue-300 border-blue-700/60'
                }`}
              >
                {scenario.callType === 'outgoing'
                  ? '📲 Исходящий'
                  : '📞 Входящий'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {formatTimer(callDuration)}
              </span>
              {scenario.studentObjective ? (
                <span className="text-[10px] text-zinc-300 hidden sm:inline font-hebrew truncate max-w-xs">
                  • {scenario.studentObjective}
                </span>
              ) : (
                <span className="text-[10px] text-zinc-400 hidden sm:inline font-hebrew">
                  • Голосовой звонок
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Быстрые переключатели: Субтитры и Помощь по звуку */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAudioHelp}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-700/80 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white hover:border-amber-500/50 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Не слышно собеседника?"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-hebrew">
              Не слышно?
            </span>
          </button>

          <button
            onClick={onToggleSubtitles}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              showSubtitles
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/40'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
            title={
              showSubtitles
                ? 'Скрыть субтитры (на слух)'
                : 'Показать субтитры'
            }
          >
            {showSubtitles ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-hebrew">
              Субтитры
            </span>
          </button>
        </div>
      </div>

      {/* Центральная часть: Индикатор разговора и субтитры */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between items-center text-center">
        {/* Аниматор говорящего с динамическими аудио-волнами */}
        <div className="my-auto flex flex-col items-center">
          <div className="relative mb-5">
            {/* Пульсирующие волны при речи ИИ */}
            {isAiSpeaking && (
              <>
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                <div className="absolute -inset-4 rounded-full bg-blue-500/10 animate-pulse" />
              </>
            )}

            {/* Живые аудио-волны при речи пользователя (VAD) */}
            {isRecording && !isMuted && (
              <>
                <div
                  className="absolute inset-0 rounded-full bg-emerald-500/25 transition-transform duration-75 pointer-events-none"
                  style={{ transform: `scale(${1.08 + audioLevel * 0.45})` }}
                />
                <div
                  className="absolute -inset-3 rounded-full bg-emerald-500/15 transition-transform duration-100 pointer-events-none"
                  style={{ transform: `scale(${1.04 + audioLevel * 0.3})` }}
                />
              </>
            )}

            <div
              className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center text-5xl sm:text-6xl border-4 transition-all duration-200 shadow-2xl relative z-10 ${
                isAiSpeaking
                  ? 'border-blue-500 bg-blue-950/50 shadow-blue-500/30 scale-105 ring-4 ring-blue-500/20'
                  : isRecording && !isMuted
                  ? 'border-emerald-500 bg-emerald-950/40 shadow-emerald-500/30 ring-4 ring-emerald-500/25'
                  : loadingAi
                  ? 'border-purple-500 bg-purple-950/40 shadow-purple-500/30'
                  : 'border-zinc-700 bg-zinc-800/90 shadow-black'
              }`}
              style={
                isRecording && !isMuted
                  ? { transform: `scale(${1 + Math.min(0.12, audioLevel * 0.2)})` }
                  : undefined
              }
            >
              {scenario.avatarEmoji}
            </div>
          </div>

          {/* Статус речи и аудио-визуализатор */}
          <div className="h-10 flex flex-col items-center justify-center">
            {isAiHangingUp && (
              <div className="flex items-center gap-2 text-xs font-bold text-rose-300 bg-rose-950/70 px-4 py-1.5 rounded-full border border-rose-800/60 font-hebrew shadow-md animate-pulse">
                <PhoneOff className="w-3.5 h-3.5 text-rose-400" />
                <span>
                  Собеседник прощается и вешает трубку...
                </span>
              </div>
            )}

            {!isAiHangingUp && isAiSpeaking && (
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-950/60 px-3.5 py-1.5 rounded-full border border-blue-800/50 animate-pulse font-hebrew shadow-sm">
                <Volume2 className="w-3.5 h-3.5" />
                <span>
                  {`${scenario.callerNameRu} говорит...`}
                </span>
              </div>
            )}

            {!isAiHangingUp && loadingAi && (
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 bg-purple-950/60 px-3.5 py-1.5 rounded-full border border-purple-800/50 font-hebrew shadow-sm">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Собеседник думает...</span>
              </div>
            )}

            {!isAiHangingUp && isRecording && !isMuted && !isAiSpeaking && !loadingAi && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-800/50 font-hebrew shadow-sm">
                  <Mic className="w-3.5 h-3.5 animate-pulse" />
                  <span>
                    Слушаю вас... Говорите на иврите
                  </span>
                </div>

                {/* Живые полоски громкости голоса */}
                <div className="flex items-center gap-1 h-3">
                  {[0.5, 0.9, 1.3, 0.9, 0.5].map((factor, i) => {
                    const barHeight = Math.max(3, Math.min(14, audioLevel * 16 * factor + 3));
                    return (
                      <div
                        key={i}
                        className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                        style={{ height: `${barHeight}px`, opacity: audioLevel > 0.05 ? 0.9 : 0.4 }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {isMuted && !isAiSpeaking && !loadingAi && (
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-950/60 px-3.5 py-1.5 rounded-full border border-amber-800/50 font-hebrew shadow-sm">
                <MicOff className="w-3.5 h-3.5" />
                <span>Микрофон выключен</span>
              </div>
            )}
          </div>
        </div>

        {/* Текущие субтитры реплики собеседника */}
        {latestAiMessage && (
          <div
            className={`w-full max-w-lg bg-zinc-800/80 backdrop-blur rounded-2xl p-4 border border-zinc-700/80 text-center transition-all shadow-md ${
              !showSubtitles
                ? 'filter blur-sm select-none opacity-40 hover:filter-none hover:opacity-100'
                : ''
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-lg sm:text-xl font-bold font-hebrew text-white mb-1">
              <span>{latestAiMessage.hebrew}</span>
              <button
                onClick={() => speakHebrew(latestAiMessage.hebrew)}
                className="p-1 rounded-lg hover:bg-zinc-700 text-blue-400 transition cursor-pointer"
                title="Повторить фразу"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            {userProfile.showTranscription && latestAiMessage.transcription && (
              <p className="text-xs sm:text-sm text-yellow-400/90 font-mono">
                {latestAiMessage.transcription}
              </p>
            )}
            {latestAiMessage.translation && (
              <p className="text-xs text-zinc-300 mt-1">
                {latestAiMessage.translation}
              </p>
            )}
          </div>
        )}

        {/* Живая речь пользователя во время записи — автоматическая отправка при паузе или по клику */}
        {liveTranscript && (
          <div
            onClick={() => {
              if (!isEchoFromAi(liveTranscript) && !isAiSpeaking && !loadingAi) {
                onSendMessage(liveTranscript.trim());
              }
            }}
            className="w-full max-w-lg mt-3 bg-emerald-950/70 border border-emerald-700/70 hover:border-emerald-500 rounded-2xl p-3 text-xs text-emerald-200 font-hebrew shadow-md animate-fade-in cursor-pointer transition group"
            title="Нажмите, чтобы отправить сейчас"
          >
            <div className="flex items-center justify-between gap-2 mb-1 text-[11px] text-emerald-400 font-semibold">
              <div className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 animate-pulse" />
                <span>Вы говорите:</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400/80 group-hover:text-emerald-300">
                <span>
                  Отправится само (или нажмите)
                </span>
                <Send className="w-3 h-3 ml-0.5" />
              </div>
            </div>
            <div className="text-sm font-bold text-white text-right leading-relaxed font-hebrew pr-1">
              {liveTranscript}
            </div>
          </div>
        )}

        {/* Уведомление, если речь не была распознана */}
        {speechNotice && (
          <div className="w-full max-w-lg mt-2 bg-blue-950/60 border border-blue-800/60 rounded-xl p-2.5 text-xs text-blue-200 flex items-center gap-2 text-left animate-fade-in">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{speechNotice}</span>
          </div>
        )}
      </div>

      {/* Подсказки, что сказать — можно сказать вслух или нажать */}
      {latestAiMessage?.suggestedReplies &&
        latestAiMessage.suggestedReplies.length > 0 &&
        !isAiHangingUp && (
          <div className="px-4 py-2.5 bg-zinc-900/90 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-1.5 font-hebrew text-[11px]">
              <span className="font-bold text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>
                  Подсказка — скажите вслух или нажмите:
                </span>
              </span>
              <span className="text-[10px] text-zinc-500">
                Говорите в микрофон 🎙️
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {latestAiMessage.suggestedReplies.map((reply, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (!isAiSpeaking && !loadingAi && !isAiHangingUp) {
                      onSendMessage(reply.hebrew, {
                        translation: reply.translation,
                        transcription: reply.transcription,
                      });
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 active:scale-95 border border-zinc-700/70 hover:border-blue-500/60 text-xs text-zinc-200 flex flex-col transition cursor-pointer text-right group"
                  title="Скажите вслух или нажмите для быстрой отправки"
                >
                  <span className="font-bold font-hebrew text-white group-hover:text-blue-200">
                    {reply.hebrew}
                  </span>
                  {reply.translation && (
                    <span className="text-[10px] text-zinc-400">{reply.translation}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

      {/* Текстовый ввод (только как скрытый резерв для случаев без микрофона) */}
      {showTextInput && (
        <div className="px-4 py-2.5 bg-zinc-900 border-t border-zinc-800 flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Напишите ответ на иврите..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-hebrew"
          />
          <button
            onClick={() => onSendMessage()}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Нижняя панель управления звонком — как в настоящем телефоне */}
      <div className="p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-around">
        {/* Кнопка Mute (Заглушить / включить микрофон) */}
        <button
          onClick={onToggleMute}
          className={`p-3.5 rounded-full border transition cursor-pointer flex items-center justify-center ${
            isMuted
              ? 'bg-amber-600/30 border-amber-500/60 text-amber-400'
              : 'bg-zinc-800/90 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700'
          }`}
          title={
            isMuted
              ? 'Включить микрофон'
              : 'Выключить микрофон'
          }
        >
          {isMuted ? <MicOff className="w-5 h-5 text-amber-400" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Главная кнопка в звонке: КРАСНАЯ ТРУБКА (Положить трубку) */}
        <button
          onClick={onEndCall}
          disabled={isAiHangingUp}
          className={`px-8 py-3.5 rounded-full font-bold shadow-lg transition flex items-center gap-2.5 font-hebrew ${
            isAiHangingUp
              ? 'bg-rose-950/80 border border-rose-800/60 text-rose-300 opacity-90 cursor-wait animate-pulse'
              : 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-rose-600/30 cursor-pointer'
          }`}
          title="Положить трубку"
        >
          <PhoneOff className={`w-5 h-5 ${isAiHangingUp ? 'animate-bounce' : ''}`} />
          <span className="text-sm">
            {isAiHangingUp
              ? 'Завершение...'
              : 'Положить трубку'}
          </span>
        </button>

        {/* Резервная кнопка клавиатуры (если микрофон не работает) */}
        <button
          onClick={() => setShowTextInput(!showTextInput)}
          className={`p-3.5 rounded-full border transition cursor-pointer flex items-center justify-center ${
            showTextInput
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-zinc-800/90 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700'
          }`}
          title="Резервная клавиатура"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
