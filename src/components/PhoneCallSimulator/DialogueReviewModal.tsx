import React from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Volume2,
  Award,
  Mic,
  BookOpen,
  Sparkles,
  Bot,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Check,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { UserProfile, PhoneScenario, ChatMessage, Word, PhoneDebriefReport } from '@/types';
import { speakHebrew } from '@/lib/speech';
import { stripNikkud } from '@/lib/transcription';
import { isWordInPersonalDict } from '@/lib/storage';

interface DialogueReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: PhoneScenario;
  userProfile: UserProfile;
  lessonId: number;
  callDuration: number;
  formatTimer: (seconds: number) => string;
  messages: ChatMessage[];
  debriefReport: PhoneDebriefReport | null;
  loadingDebrief: boolean;
  addedWords: Record<string, boolean>;
  onAddWord: (w: Word) => void;
  onStartCall: () => void;
  mounted: boolean;
}

export const DialogueReviewModal: React.FC<DialogueReviewModalProps> = ({
  isOpen,
  onClose,
  scenario,
  userProfile,
  lessonId,
  callDuration,
  formatTimer,
  messages,
  debriefReport,
  loadingDebrief,
  addedWords,
  onAddWord,
  onStartCall,
  mounted,
}) => {
  if (!mounted || !isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden font-hebrew"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка модального окна */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
              {scenario.avatarEmoji}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-50 truncate">
                  {userProfile.ulpanMode ? 'סִיכּוּם וּפֵירוּט הַשִּׂיחָה' : 'Разбор телефонного звонка'}
                </h3>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {scenario.callerName} • {scenario.callerRole} • {formatTimer(callDuration)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {debriefReport && (
              <div className="flex items-center gap-1 sm:gap-1.5">
                {/* Общий балл */}
                <div
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs shadow-2xs"
                  title={userProfile.ulpanMode ? 'צִיּוּן כְּלָלִי' : 'Общий балл решения задачи звонка'}
                >
                  <Award className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{debriefReport.overallScore}%</span>
                </div>

                {/* Чёткость произношения */}
                {typeof debriefReport.pronunciationScore === 'number' && (
                  <div
                    className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 font-bold text-xs shadow-2xs"
                    title={userProfile.ulpanMode ? 'צִיּוּן הֶגֶה וּמִבְטָא' : 'Чёткость произношения и ударений'}
                  >
                    <Mic className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{debriefReport.pronunciationScore}%</span>
                  </div>
                )}

                {/* Грамматика и род */}
                {typeof debriefReport.grammarScore === 'number' && (
                  <div
                    className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border font-bold text-xs shadow-2xs ${
                      debriefReport.grammarScore >= 85
                        ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300'
                        : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300'
                    }`}
                    title={userProfile.ulpanMode ? 'דִּקְדּוּק וּסֵדֶר מִילִּים' : 'Грамматика, согласование родов и порядок слов'}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>{debriefReport.grammarScore}%</span>
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Скроллируемое тело с диалогом и комментариями */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Загрузка разбора */}
          {loadingDebrief && (
            <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
              <span className="text-xs sm:text-sm text-blue-900 dark:text-blue-200 font-medium">
                {userProfile.ulpanMode
                  ? '...הַמּוֹרֶה מֵכִין מַשּׁוֹב מְפֹרָט לְשִׂיחַת הַטֶּלֶפוֹן'
                  : 'ИИ-учитель готовит разбор звонка, оценку и живые израильские фразы...'}
              </span>
            </div>
          )}

          {/* Верхняя плашка от ИИ-учителя */}
          {debriefReport ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 shadow-2xs space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs sm:text-sm text-blue-950 dark:text-blue-200">
                      {userProfile.ulpanMode ? 'סִיכּוּם הַשִּׂיחָה' : 'Итог звонка:'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        debriefReport.isSuccess
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {debriefReport.isSuccess
                        ? userProfile.ulpanMode
                          ? 'הַמַּטָּרָה הוּשְׂגָה ✔️'
                          : 'Цель достигнута ✔️'
                        : userProfile.ulpanMode
                        ? 'שִׂיחָה קְצָרָה'
                        : 'Стоит повторить'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {debriefReport.summaryRu}
                  </p>
                </div>
              </div>
            </div>
          ) : !loadingDebrief ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 text-xs sm:text-sm">
                  <div className="font-bold text-blue-950 dark:text-blue-200 mb-0.5">
                    {userProfile.ulpanMode ? 'מַשּׁוֹב הַמּוֹרֶה' : 'Комментарий ИИ-учителя:'}
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {messages.filter((m) => m.role === 'user').length >= 1
                      ? userProfile.ulpanMode
                        ? 'כָּל הַכָּבוֹד! שׂוֹחַחְתֶּם בְּהַצְלָחָה בְּעִבְרִית. לְמַטָּה מוֹפִיעַ הַדִּיאָלוֹג הַמָּלֵא עִם מַשּׁוֹב לְכָל אַחַת מֵהַתְּשׁוּבוֹת שֶׁלָּכֶם.'
                        : 'Отличная работа! Вы провели живой телефонный диалог на иврите. Ниже представлен полный текст разговора с подробным разбором.'
                      : userProfile.ulpanMode
                      ? 'הַשִּׂיחָה הָיְתָה קְצָרָה מִדַּי. נַסּוּ שׁוּב וַעֲנוּ לַבֶּן-שִׂיחַ.'
                      : 'Разговор получился слишком коротким. Попробуйте еще раз и ответьте собеседнику.'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Лайфхак израильской разговорной речи */}
          {debriefReport?.spokenTip && (
            <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3.5 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                <span className="font-bold block mb-0.5">
                  {userProfile.ulpanMode
                    ? 'טִיפּ לִשְׂפַת הַדִּיבּוּר בְּיִשְׂרָאֵל:'
                    : 'Лайфхак разговорного этикета в Израиле:'}
                </span>
                {debriefReport.spokenTip}
              </div>
            </div>
          )}

          {/* Список реплик с комментариями к ответам ученика */}
          <div className="space-y-3.5">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isCursive = userProfile.fontStyle === 'cursive';

              // Поиск рецензии на реплику ученика в debriefReport
              const userMsgIndex = isUser
                ? messages.filter((m, i) => m.role === 'user' && i <= idx).length - 1
                : -1;
              const turnReview =
                isUser && debriefReport?.turnReviews && debriefReport.turnReviews[userMsgIndex]
                  ? debriefReport.turnReviews[userMsgIndex]
                  : null;

              return (
                <div
                  key={msg.id || idx}
                  className={`rounded-2xl p-3.5 sm:p-4 border transition ${
                    isUser
                      ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-900/60 ml-2 sm:ml-6'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/60 mr-2 sm:mr-6'
                  }`}
                >
                  {/* Шапка сообщения: кто говорит + кнопка озвучки */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                          isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        {isUser ? <UserIcon className="w-3.5 h-3.5" /> : scenario.avatarEmoji}
                      </span>
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-200 truncate">
                        {isUser
                          ? userProfile.ulpanMode
                            ? 'אַתֶּם (תַּלְמִיד)'
                            : 'Вы (ученик)'
                          : `${scenario.callerName} (${scenario.callerRole})`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        speakHebrew(msg.hebrew, { rate: userProfile.speechRate || 0.7 })
                      }
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
                      title="Прослушать реплику"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Текст реплики на иврите */}
                  <div
                    dir="rtl"
                    className={`text-base sm:text-lg font-hebrew font-bold text-zinc-900 dark:text-zinc-50 leading-relaxed ${
                      isCursive ? 'font-cursive text-xl text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    {userProfile.showNikkud ? msg.hebrew : stripNikkud(msg.hebrew)}
                  </div>

                  {/* Транскрипция кириллицей */}
                  {!userProfile.ulpanMode && userProfile.showTranscription && msg.transcription && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-1">
                      [{msg.transcription}]
                    </div>
                  )}

                  {/* Перевод на русский язык */}
                  {!userProfile.ulpanMode && msg.translation && (
                    <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-1 leading-snug">
                      {msg.translation}
                    </div>
                  )}

                  {/* БЛОК РАЗБОРА И КОММЕНТАРИЕВ ИИ-УЧИТЕЛЯ К ОТВЕТУ УЧЕНИКА */}
                  {isUser && (
                    <div className="mt-3 pt-2.5 border-t border-blue-200/60 dark:border-blue-900/50 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                          <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>{userProfile.ulpanMode ? 'מַשּׁוֹב הַמּוֹרֶה:' : 'Разбор ответа:'}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Индикатор четкости произношения */}
                          {typeof turnReview?.pronunciationScore === 'number' && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1 shadow-2xs">
                              <span>🎙️</span>
                              <span>{turnReview.pronunciationScore}%</span>
                            </span>
                          )}

                          {turnReview && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                turnReview.assessment === 'perfect'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-500/30'
                                  : turnReview.assessment === 'good'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-500/30'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-500/30'
                              }`}
                            >
                              {turnReview.assessment === 'perfect'
                                ? 'Идеально ✔️'
                                : turnReview.assessment === 'good'
                                ? 'Хорошо 👍'
                                : 'Можно улучшить 💡'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Предупреждение об ошибках рода или порядка слов */}
                      {turnReview?.grammarErrors && turnReview.grammarErrors.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>
                              {userProfile.ulpanMode
                                ? 'שְׁגִיאַת מִין אוֹ סֵדֶר מִילִּים:'
                                : 'Внимание к роду и порядку слов:'}
                            </span>
                          </div>
                          {turnReview.grammarErrors.map((ge, gIdx) => (
                            <div
                              key={gIdx}
                              className="text-xs text-amber-900 dark:text-amber-200 leading-snug space-y-0.5"
                            >
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="line-through text-red-500 font-hebrew font-semibold">
                                  «{ge.wrongPhrase}»
                                </span>
                                <span>➔</span>
                                <span className="font-bold text-emerald-700 dark:text-emerald-400 font-hebrew">
                                  «{ge.correctPhrase}»
                                </span>
                              </div>
                              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 font-sans">
                                {ge.explanationRu}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Рекомендация по произношению звуков/ударений */}
                      {turnReview?.pronunciationFeedbackRu && (
                        <div className="p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs flex items-start gap-1.5">
                          <span className="text-sm shrink-0">🗣️</span>
                          <div className="text-zinc-700 dark:text-zinc-300 text-[11px] sm:text-xs leading-relaxed">
                            <span className="font-semibold text-blue-900 dark:text-blue-300 mr-1">
                              {userProfile.ulpanMode ? 'הֶגֶה וּמִבְטָא:' : 'Произношение:'}
                            </span>
                            {turnReview.pronunciationFeedbackRu}
                          </div>
                        </div>
                      )}

                      {turnReview?.commentRu ? (
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {turnReview.commentRu}
                        </p>
                      ) : (
                        <div className="p-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>
                            {userProfile.ulpanMode
                              ? 'תְּשׁוּבָה נְכוֹנָה וּבְרוּרָה בַּהֶקְשֵׁר הַשִּׂיחָה! ✔️'
                              : 'Точный и естественный ответ по контексту звонка! ✔️'}
                          </span>
                        </div>
                      )}

                      {/* Альтернатива носителя иврита (как сказать естественнее) */}
                      {turnReview?.betterAlternative && (
                        <div className="p-2.5 rounded-xl bg-purple-50/90 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-bold text-[11px] text-purple-800 dark:text-purple-300 mb-0.5 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                              <span>
                                {userProfile.ulpanMode
                                  ? 'אֵיךְ אוֹמְרִים בְּיִשְׂרָאֵל:'
                                  : 'Как это звучит в живой речи израильтян:'}
                              </span>
                            </div>
                            <div
                              dir="rtl"
                              className="text-sm font-hebrew font-bold text-purple-950 dark:text-purple-100 leading-snug"
                            >
                              {turnReview.betterAlternative}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              speakHebrew(turnReview.betterAlternative || '', {
                                rate: userProfile.speechRate || 0.7,
                              })
                            }
                            className="p-1 rounded-lg text-purple-600 hover:text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition cursor-pointer shrink-0 mt-0.5"
                            title="Озвучить"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Рекомендованные слова из разбора */}
          {debriefReport?.recommendedWords && debriefReport.recommendedWords.length > 0 && (
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {userProfile.ulpanMode
                    ? 'מִילִּים מוּמְלָצוֹת מֵהַשִּׂיחָה:'
                    : 'Рекомендованные фразы для звонка:'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {debriefReport.recommendedWords.map((rw, rIdx) => {
                  const isAdded =
                    addedWords[rw.hebrew] ||
                    isWordInPersonalDict(rw.hebrew, userProfile.personalVocabulary);
                  return (
                    <div
                      key={rIdx}
                      className="bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span
                          dir="rtl"
                          className="font-hebrew font-bold text-sm text-zinc-900 dark:text-zinc-50 block"
                        >
                          {rw.hebrew}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block truncate">
                          {rw.translation}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            speakHebrew(rw.hebrew, { rate: userProfile.speechRate || 0.7 })
                          }
                          className="p-1 rounded-lg text-zinc-400 hover:text-blue-600 transition cursor-pointer"
                          title="Озвучить"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isAdded}
                          onClick={() =>
                            onAddWord({
                              id: `debrief-w-${rIdx}-${Date.now()}`,
                              hebrew: rw.hebrew,
                              hebrewPlain: stripNikkud(rw.hebrew),
                              transcription: rw.transcription,
                              translation: rw.translation,
                              partOfSpeech: 'expression',
                              lessonId,
                              isUserAdded: true,
                              dateAdded: Date.now(),
                            })
                          }
                          className={`p-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-zinc-200 hover:bg-amber-500 hover:text-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                          }`}
                          title={isAdded ? 'В словаре' : 'Добавить в словарь'}
                        >
                          {isAdded ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Футер модального окна с кнопками действий */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-end gap-2 bg-zinc-50/80 dark:bg-zinc-900/80 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartCall();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{userProfile.ulpanMode ? 'שִׂיחָה חוֹזֶרֶת 🔄' : 'Позвонить еще раз'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>{userProfile.ulpanMode ? 'סְגִירָה' : 'Закрыть'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
