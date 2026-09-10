import React from 'react';
import {
  Volume2,
  Play,
  Pause,
  Mic,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lightbulb,
  BookOpen,
  Square,
  Download,
} from 'lucide-react';
import {
  Lesson,
  ScriptedDialogue,
  ScriptedDialogueTurn,
  GenderVariant,
  DialogueParticipant,
  DialogueEvaluationResult,
} from '@/types';
import { stripNikkud, tokenizeText, TextToken } from '@/lib/transcription';
import { speakHebrew } from '@/lib/speech';

interface PracticeViewProps {
  lesson: Lesson;
  dialogue: ScriptedDialogue;
  userRoleSide: 'a' | 'b';
  characterA: DialogueParticipant;
  characterB: DialogueParticipant;
  practiceTurnIndex: number;
  practiceScrollRef: React.RefObject<HTMLDivElement | null>;
  bottomConsoleRef: React.RefObject<HTMLDivElement | null>;
  evaluationRef: React.RefObject<HTMLDivElement | null>;
  getTurnText: (turn: ScriptedDialogueTurn) => GenderVariant;
  handlePlayTurn: (turn: ScriptedDialogueTurn) => void;
  turnHistory: Record<number, DialogueEvaluationResult>;
  userAudioUrl: string | null;
  playingAudioUrl: string | null;
  handleToggleUserAudio: (audioUrlToPlay?: string) => void;
  showNikkud: boolean;
  showTranscription: boolean;
  totalAvailableWordsCount: number;
  onWordClick?: (token: TextToken, fullSentence: string) => void;
  onOpenWordsDrawer: () => void;
  showHint: boolean;
  setShowHint: React.Dispatch<React.SetStateAction<boolean>>;
  isEvaluating: boolean;
  evaluatingPhase: 'idle' | 'transcribing' | 'evaluating';
  spokenText: string;
  lastEvaluation: DialogueEvaluationResult | null;
  speechRate: number;
  userAudioPlayerRef: React.RefObject<HTMLAudioElement | null>;
  isFinalTurn: boolean;
  isLastUserTurn: boolean;
  handleProceedToNextTurn: () => void;
  startVoiceRecording: () => void;
  isRecording: boolean;
  isOpponentSpeaking: boolean;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  lesson,
  dialogue,
  userRoleSide,
  characterA,
  characterB,
  practiceTurnIndex,
  practiceScrollRef,
  bottomConsoleRef,
  evaluationRef,
  getTurnText,
  handlePlayTurn,
  turnHistory,
  userAudioUrl,
  playingAudioUrl,
  handleToggleUserAudio,
  showNikkud,
  showTranscription,
  totalAvailableWordsCount,
  onOpenWordsDrawer,
  showHint,
  setShowHint,
  isEvaluating,
  evaluatingPhase,
  spokenText,
  lastEvaluation,
  speechRate,
  userAudioPlayerRef,
  isFinalTurn,
  isLastUserTurn,
  handleProceedToNextTurn,
  startVoiceRecording,
  isRecording,
  isOpponentSpeaking,
  onWordClick,
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Прогресс-бар ходов диалога */}
      <div className="px-3 py-2 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
            Реплика {practiceTurnIndex + 1} из {dialogue.turns.length}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-medium">
            Вы: {userRoleSide === 'a' ? characterA.nameRu : characterB.nameRu}
          </span>
        </div>

        <div className="w-24 sm:w-32 bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${((practiceTurnIndex + 1) / dialogue.turns.length) * 100}%` }}
          />
        </div>
      </div>

      {/* История реплик до текущего момента */}
      <div
        ref={practiceScrollRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3"
      >
        {dialogue.turns.slice(0, practiceTurnIndex + 1).map((turn, idx) => {
          const isSpeakerUser = turn.speaker === userRoleSide;
          const variant = getTurnText(turn);
          const character = turn.speaker === 'a' ? characterA : characterB;

          return (
            <div
              key={turn.id}
              className={`flex gap-2.5 sm:gap-3 transition-all ${
                isSpeakerUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-2xs ${
                  isSpeakerUser
                    ? 'bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900'
                    : 'bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900'
                }`}
              >
                {character.avatarEmoji}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 sm:p-3.5 shadow-xs ${
                  isSpeakerUser
                    ? 'bg-purple-50/80 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {character.nameRu} {isSpeakerUser && ' (Вы)'}
                  </span>
                  {!isSpeakerUser ? (
                    <button
                      type="button"
                      onClick={() => handlePlayTurn(turn)}
                      className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-blue-600 transition cursor-pointer"
                      title="Озвучить реплику"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  ) : turnHistory[idx]?.userAudioUrl || (idx === practiceTurnIndex && userAudioUrl) ? (
                    (() => {
                      const thisAudioUrl = turnHistory[idx]?.userAudioUrl || userAudioUrl || undefined;
                      const isThisPlaying = Boolean(playingAudioUrl && thisAudioUrl && playingAudioUrl === thisAudioUrl);
                      return (
                        <button
                          type="button"
                          onClick={() => handleToggleUserAudio(thisAudioUrl)}
                          className={`px-2 py-0.5 rounded-lg border font-bold text-[10px] flex items-center gap-1 transition cursor-pointer shadow-2xs ${
                            isThisPlaying
                              ? 'bg-blue-600 text-white border-blue-500 ring-1 ring-blue-400'
                              : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-200'
                          }`}
                          title={isThisPlaying ? 'Поставить на паузу' : 'Прослушать свою запись этой реплики'}
                        >
                          {isThisPlaying ? (
                            <Pause className="w-2.5 h-2.5" />
                          ) : (
                            <Play className="w-2.5 h-2.5 fill-current" />
                          )}
                          <span>{isThisPlaying ? 'Пауза' : 'Запись'}</span>
                        </button>
                      );
                    })()
                  ) : null}
                </div>

                {/* Если говорит собеседник или реплика ученика уже пройдена */}
                {!isSpeakerUser || idx < practiceTurnIndex || lastEvaluation?.isCorrect ? (
                  <>
                    <div
                      dir="rtl"
                      className="text-base sm:text-lg font-bold font-hebrew text-zinc-900 dark:text-zinc-50 leading-relaxed mb-0.5"
                    >
                      {tokenizeText(variant.hebrew).map((token) => {
                        const displayWord = showNikkud ? token.text : stripNikkud(token.text);
                        if (token.isHebrew && onWordClick) {
                          return (
                            <span
                              key={token.id}
                              onClick={() => onWordClick(token, variant.hebrew)}
                              className="inline-block px-0.5 py-0.5 rounded-md hover:text-blue-600 dark:hover:text-blue-400 hover:underline hover:bg-blue-100/70 dark:hover:bg-blue-900/50 cursor-pointer transition select-text active:scale-95"
                              title="Нажмите для перевода и словарика"
                            >
                              {displayWord}
                            </span>
                          );
                        }
                        return <span key={token.id}>{token.text}</span>;
                      })}
                    </div>
                    {showTranscription && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                        {variant.transcription}
                      </div>
                    )}
                    <div className="text-xs text-zinc-600 dark:text-zinc-300">
                      {variant.translation}
                    </div>
                  </>
                ) : (
                  // Текущий ход ученика в ожидании озвучки
                  <div className="space-y-1.5 py-1">
                    <div className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <span>Ваша очередь:</span>
                      <span className="font-normal text-zinc-600 dark:text-zinc-300">{turn.intentRu}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Интерактивная нижняя консоль для ответа ученика ГОЛОСОМ */}
      {dialogue.turns[practiceTurnIndex] && dialogue.turns[practiceTurnIndex].speaker === userRoleSide && (
        <div
          ref={bottomConsoleRef}
          className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5 max-h-[50vh] sm:max-h-[55vh] overflow-y-auto shrink-0 shadow-lg"
        >
          {/* Коммуникативная подсказка */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span className="truncate sm:whitespace-normal">
                Ваша задача: <strong>{dialogue.turns[practiceTurnIndex].intentRu}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {totalAvailableWordsCount > 0 && (
                <button
                  type="button"
                  onClick={onOpenWordsDrawer}
                  className="text-xs text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 font-medium flex items-center gap-1 cursor-pointer transition"
                  title="Открыть шторку со всеми словами к диалогу"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Слова ({totalAvailableWordsCount})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint ? 'Скрыть подсказку' : 'Подсказка'}</span>
              </button>
            </div>
          </div>

          {/* Карточка подсказки (если открыта) */}
          {showHint && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold">Пример фразы:</span>
                <button
                  type="button"
                  onClick={() => handlePlayTurn(dialogue.turns[practiceTurnIndex])}
                  className="p-1 text-amber-700 dark:text-amber-300 hover:bg-amber-100 rounded cursor-pointer"
                  title="Прослушать подсказку"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div dir="rtl" className="text-sm font-bold font-hebrew text-zinc-900 dark:text-zinc-100">
                {tokenizeText(getTurnText(dialogue.turns[practiceTurnIndex]).hebrew).map((token) => {
                  const displayWord = showNikkud ? token.text : stripNikkud(token.text);
                  if (token.isHebrew && onWordClick) {
                    return (
                      <span
                        key={token.id}
                        onClick={() => onWordClick(token, getTurnText(dialogue.turns[practiceTurnIndex]).hebrew)}
                        className="inline-block px-0.5 py-0.5 rounded-md hover:text-blue-600 dark:hover:text-blue-400 hover:underline hover:bg-amber-100 dark:hover:bg-amber-900/50 cursor-pointer transition select-text active:scale-95"
                        title="Нажмите для перевода и словарика"
                      >
                        {displayWord}
                      </span>
                    );
                  }
                  return <span key={token.id}>{token.text}</span>;
                })}
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-300">
                {getTurnText(dialogue.turns[practiceTurnIndex]).transcription}
              </div>
            </div>
          )}

          {/* Баннер непрерывного анализа речи ИИ */}
          {isEvaluating && !lastEvaluation && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/60 border border-blue-200 dark:border-blue-800/80 shadow-xs space-y-2 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5 animate-spin text-amber-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-blue-950 dark:text-blue-100">
                    {evaluatingPhase === 'transcribing'
                      ? 'ИИ слушает и расшифровывает вашу речь...'
                      : 'ИИ оценивает смысл, грамматику и произношение...'}
                  </p>
                  <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80">
                    {evaluatingPhase === 'transcribing'
                      ? 'Обработка аудиодорожки через нейросеть Whisper...'
                      : 'Сверка ответа с контекстом диалога...'}
                  </p>
                </div>
              </div>
              {spokenText && (
                <div className="pt-1.5 border-t border-blue-200/60 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <span className="font-semibold">Распознано:</span>
                  <span dir="rtl" className="font-hebrew font-bold">«{spokenText}»</span>
                </div>
              )}
            </div>
          )}

          {/* Поле того, что произнес ученик */}
          {spokenText && !isEvaluating && !lastEvaluation && (
            <div className="p-3 rounded-2xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 space-y-1.5 animate-fadeIn shadow-2xs overflow-hidden">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎙️</span>
                <span>Распознанная речь:</span>
              </span>
              <div className="flex items-start gap-1 text-lg sm:text-xl font-extrabold font-hebrew text-zinc-900 dark:text-zinc-50 leading-relaxed min-w-0">
                <span className="text-blue-400 select-none shrink-0">«</span>
                <bdi dir="rtl" className="break-words whitespace-pre-wrap text-right flex-1 min-w-0">
                  {spokenText}
                </bdi>
                <span className="text-blue-400 select-none shrink-0">»</span>
              </div>
            </div>
          )}

          {/* Результат семантической и фонетической проверки ИИ */}
          {lastEvaluation && (
            <div
              ref={evaluationRef}
              className={`p-3.5 sm:p-4 rounded-2xl space-y-3 transition-all animate-fadeIn ${
                lastEvaluation.isCorrect
                  ? 'bg-emerald-50/95 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-50'
                  : 'bg-amber-50/95 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-50'
              }`}
            >
              {/* Шапка оценки: Статус + Процент чёткости */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <span className="font-black flex items-center gap-2 text-base sm:text-lg">
                    {lastEvaluation.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{lastEvaluation.assessment === 'perfect' ? '🎉 Отлично!' : '👍 Хорошо, вас поняли!'}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        <span>Попробуйте ещё раз</span>
                      </>
                    )}
                  </span>

                  {/* Индикатор четкости произношения в % */}
                  {typeof lastEvaluation.pronunciationScore === 'number' && (
                    <span className="px-2.5 py-1 rounded-xl bg-white/90 dark:bg-black/40 border border-black/10 dark:border-white/10 text-xs sm:text-sm font-black text-blue-700 dark:text-blue-300 flex items-center gap-1.5 shadow-2xs shrink-0">
                      <span>🎙️ Произношение:</span>
                      <span className="text-sm sm:text-base font-extrabold">{lastEvaluation.pronunciationScore}%</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 1. Как ИИ распознал сказанную фразу + Прослушивание своей записи и скачивание */}
              {(lastEvaluation.userSpokenHebrew || spokenText) && (
                <div className="p-3 sm:p-3.5 rounded-xl bg-white/95 dark:bg-black/40 border border-black/10 dark:border-white/10 shadow-2xs space-y-2 overflow-hidden">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🎯</span>
                      <span>ИИ распознал вашу фразу:</span>
                    </span>

                    {/* Кнопки воспроизведения: аудиозапись своего голоса + скачивание + синтезатор речи */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(userAudioUrl || lastEvaluation.userAudioUrl) && (
                        (() => {
                          const currentEvalUrl = lastEvaluation.userAudioUrl || userAudioUrl || undefined;
                          const isThisEvalAudioPlaying = Boolean(playingAudioUrl && currentEvalUrl && playingAudioUrl === currentEvalUrl);
                          return (
                            <button
                              type="button"
                              onClick={() => handleToggleUserAudio(currentEvalUrl)}
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer ${
                                isThisEvalAudioPlaying
                                  ? 'bg-blue-600 text-white shadow-blue-600/30 ring-2 ring-blue-400'
                                  : 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                              }`}
                              title="Прослушать аудиозапись своего голоса"
                            >
                              {isThisEvalAudioPlaying ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current" />
                              )}
                              <span>{isThisEvalAudioPlaying ? 'Пауза' : 'Ваша запись'}</span>
                            </button>
                          );
                        })()
                      )}

                      {/* Кнопка скачать аудиофайл своей речи */}
                      {(userAudioUrl || lastEvaluation.userAudioUrl) && (
                        <a
                          href={lastEvaluation.userAudioUrl || userAudioUrl || undefined}
                          download={`ulpana_lesson_${lesson.number}_turn_${practiceTurnIndex + 1}.webm`}
                          className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                          title="Скачать аудиофайл записи (.webm)"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}

                      {/* Кнопка синтезатора речи */}
                      <button
                        type="button"
                        onClick={() => {
                          if (userAudioPlayerRef.current) {
                            userAudioPlayerRef.current.pause();
                          }
                          speakHebrew(lastEvaluation.userSpokenHebrew || spokenText, { rate: speechRate });
                        }}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0 cursor-pointer"
                        title="Прослушать эталонным синтезатором речи"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-1 text-lg sm:text-xl font-black font-hebrew text-zinc-900 dark:text-zinc-50 leading-relaxed min-w-0">
                    <span className="text-zinc-400 select-none shrink-0">«</span>
                    <bdi dir="rtl" className="break-words whitespace-pre-wrap text-right flex-1 min-w-0">
                      {lastEvaluation.userSpokenHebrew || spokenText}
                    </bdi>
                    <span className="text-zinc-400 select-none shrink-0">»</span>
                  </div>
                </div>
              )}

              {/* 2. Оценка смысла */}
              <div className="text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-100 font-medium px-0.5">
                {lastEvaluation.feedbackRu}
              </div>

              {/* 3. Рекомендация по произношению */}
              {lastEvaluation.pronunciationFeedbackRu && (
                <div className="p-3 sm:p-3.5 rounded-xl bg-white/95 dark:bg-black/40 border border-black/10 dark:border-white/10 space-y-1.5 shadow-2xs">
                  <div className="font-bold flex items-center gap-2 text-xs sm:text-sm text-zinc-800 dark:text-zinc-100 uppercase tracking-wide">
                    <span className="text-base">🗣️</span>
                    <span>Рекомендация по произношению:</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed font-normal text-zinc-700 dark:text-zinc-200">
                    {lastEvaluation.pronunciationFeedbackRu}
                  </p>
                </div>
              )}

              {/* 4. Как лучше сказать (эталон) */}
              {lastEvaluation.betterAlternative && (
                <div className="p-3 rounded-xl bg-white/80 dark:bg-black/30 border border-black/10 dark:border-white/10 flex items-center justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-0.5">
                      Как лучше сказать:
                    </span>
                    <span dir="rtl" className="font-hebrew font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-50">
                      {lastEvaluation.betterAlternative}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakHebrew(lastEvaluation.betterAlternative!, { rate: speechRate })}
                    className="p-1.5 rounded-xl text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0 cursor-pointer"
                    title="Прослушать эталонную фразу"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Кнопки управления ответом */}
          {lastEvaluation?.isCorrect ? (
            <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handleProceedToNextTurn}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
              >
                <span>
                  {isFinalTurn
                    ? '🎉 Завершить диалог и зачесть этап'
                    : isLastUserTurn
                    ? 'Финальная реплика собеседника и завершение →'
                    : 'Следующая реплика'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={startVoiceRecording}
                disabled={isEvaluating}
                className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Сказать ещё раз</span>
              </button>
            </div>
          ) : lastEvaluation && !lastEvaluation.isCorrect ? (
            <div className="pt-1 flex items-center justify-center">
              <button
                type="button"
                onClick={startVoiceRecording}
                disabled={isEvaluating}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
              >
                {isRecording ? (
                  <>
                    <Square className="w-4 h-4 fill-white animate-pulse" />
                    <span>Готово, проверить ответ</span>
                  </>
                ) : isEvaluating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                    <span>
                      {evaluatingPhase === 'transcribing'
                        ? 'ИИ распознаёт речь...'
                        : 'ИИ оценивает ответ...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Попробовать снова (голос)</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="pt-1 flex items-center justify-center">
              <button
                type="button"
                onClick={startVoiceRecording}
                disabled={isEvaluating}
                className={`relative w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md active:scale-95 ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse ring-4 ring-red-300 dark:ring-red-900'
                    : isEvaluating
                    ? 'bg-zinc-400 text-white cursor-wait'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-5 h-5 fill-white animate-pulse" />
                    <span>Готово, проверить ответ</span>
                  </>
                ) : isEvaluating ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin text-amber-300" />
                    <span>
                      {evaluatingPhase === 'transcribing'
                        ? 'ИИ слушает и распознаёт речь...'
                        : 'ИИ проверяет смысл ответа...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    <span>Нажмите и говорите на иврите</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Индикатор речи оппонента */}
      {isOpponentSpeaking && (
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 shrink-0">
          <Volume2 className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>{userRoleSide === 'a' ? characterB.nameRu : characterA.nameRu} говорит...</span>
        </div>
      )}
    </div>
  );
};
