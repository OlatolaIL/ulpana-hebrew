import React from 'react';
import { Send, Mic, Sparkles, X, Lightbulb } from 'lucide-react';
import { ChatMessage, UserProfile } from '@/types';

interface ChatInputBarProps {
  lastAiMessage?: ChatMessage;
  isDialogueFinished: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  audioLevel: number;
  inputText: string;
  loading: boolean;
  userProfile: UserProfile;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setInputText: (text: string) => void;
  onOpenDrawer: (tab: 'words' | 'replies') => void;
  onToggleRecording: () => void;
  onSendMessage: () => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  lastAiMessage,
  isDialogueFinished,
  isRecording,
  isTranscribing,
  audioLevel,
  inputText,
  loading,
  userProfile,
  inputRef,
  setInputText,
  onOpenDrawer,
  onToggleRecording,
  onSendMessage,
}) => {
  return (
    <div className="shrink-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 sticky bottom-0 z-20 pb-[env(safe-area-inset-bottom,0px)] shadow-lg">
      {/* Если есть готовые примеры ответа — тонкая информативная плашка с кнопкой */}
      {lastAiMessage?.suggestedReplies &&
        lastAiMessage.suggestedReplies.length > 0 &&
        !isDialogueFinished && (
          <div className="px-3 py-1.5 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onOpenDrawer('replies')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-zinc-700 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs"
              title="Показать готовые варианты ответа в шторке"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Готовые варианты ответа</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {lastAiMessage.suggestedReplies.length}
              </span>
            </button>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">
              нажмите для просмотра
            </span>
          </div>
        )}

      {/* Индикатор активной записи речи с эквалайзером */}
      {isRecording && (
        <div className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
            <span className="font-bold">
              🎙️ Запись голоса (говорите на иврите):
            </span>
          </div>
          <div className="flex items-center gap-1 h-3 shrink-0">
            {[0.4, 0.8, 1.2, 0.9, 0.5].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                style={{
                  height: `${Math.max(4, Math.min(14, (audioLevel > 0.05 ? audioLevel : 0.15) * 16 * h))}px`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Индикатор обработки речи через Whisper AI */}
      {isTranscribing && (
        <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-200 dark:border-indigo-900/60 flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300 animate-in fade-in duration-150">
          <Sparkles className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
          <span className="font-bold">
            Распознавание речи через ИИ (Whisper V3)...
          </span>
        </div>
      )}

      {/* Строка ввода со встроенным микрофоном */}
      <div className="p-2.5 sm:p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={onToggleRecording}
            disabled={isTranscribing}
            className={`p-2.5 rounded-xl transition cursor-pointer shrink-0 flex items-center justify-center ${
              isTranscribing
                ? 'bg-indigo-600 text-white animate-pulse shadow-md'
                : isRecording
                ? 'bg-rose-600 text-white ring-4 ring-rose-400/50 animate-pulse shadow-md'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-blue-600 dark:text-blue-400 border border-zinc-200 dark:border-zinc-700'
            }`}
            title={isRecording ? 'Остановить запись' : 'Ответить голосом на иврите'}
          >
            {isTranscribing ? (
              <Sparkles className="w-5 h-5 animate-spin" />
            ) : (
              <Mic className={`w-5 h-5 ${isRecording ? 'animate-bounce' : ''}`} />
            )}
          </button>

          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              dir="auto"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isTranscribing
                  ? '✨ Обработка речи через ИИ...'
                  : isRecording
                  ? '🎙️ Слушаю... говорите на иврите'
                  : 'Напишите или продиктуйте ответ на иврите...'
              }
              className={`w-full py-2.5 pl-3.5 pr-8 rounded-xl border text-base sm:text-sm transition focus:outline-none ${
                isTranscribing
                  ? 'border-indigo-500 ring-2 ring-indigo-300 dark:ring-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-950 dark:text-indigo-100 font-medium'
                  : isRecording
                  ? 'border-rose-500 ring-2 ring-rose-300 dark:ring-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 font-medium'
                  : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800'
              }`}
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded transition cursor-pointer"
                title="Очистить"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || loading || isTranscribing}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-xs transition active:scale-95 shrink-0 cursor-pointer flex items-center justify-center"
            title="Отправить ответ"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
