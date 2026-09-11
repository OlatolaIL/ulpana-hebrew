'use client';

import React, { useState } from 'react';
import { Info, RotateCcw, CheckCircle2 } from 'lucide-react';
import { TextToken } from '@/lib/transcription';
import { speakHebrew } from '@/lib/speech';
import { markLessonTabCompleted } from '@/lib/storage';
import { WordLookupModal } from '../WordLookupModal';
import { LessonAiChatProps } from './types';
import { useAiChat } from './useAiChat';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInputBar } from './ChatInputBar';
import { ChatSidebar } from './ChatSidebar';
import { ChatDrawer } from './ChatDrawer';
import { ChatBriefingModal } from './ChatBriefingModal';
import { getStageNumber, LESSON_STAGES } from '@/lib/config';

export const LessonAiChat: React.FC<LessonAiChatProps> = ({
  lesson,
  userProfile,
  onUpdateProfile,
  onWordAdded,
  onGoToPhone,
}) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordContext, setWordContext] = useState<string>('');
  const [wordSentenceTranslation, setWordSentenceTranslation] = useState<string | undefined>(undefined);
  const [wordSentenceTranscription, setWordSentenceTranscription] = useState<string | undefined>(undefined);
  const [isWordsDrawerOpen, setIsWordsDrawerOpen] = useState(false);
  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'words' | 'replies'>('words');

  const {
    messages,
    inputText,
    setInputText,
    loading,
    isRecording,
    isTranscribing,
    audioLevel,
    revealedTranslations,
    toggleTranslation,
    addedWords,
    handleAddWordDirectly,
    handleAppendWord,
    handleSendMessage,
    toggleRecording,
    handleResetChat,
    handleGenderSwitch,
    lastAiMessage,
    userTurnsCount,
    stepsCount,
    activeStep,
    isDialogueFinished,
    inputRef,
    lastMessageRef,
    messagesEndRef,
    TARGET_TURNS,
  } = useAiChat({
    lesson,
    userProfile,
    onUpdateProfile,
    onWordAdded,
  });

  const handleWordClick = (
    token: TextToken,
    fullSentence: string,
    sentenceTranslation?: string,
    sentenceTranscription?: string
  ) => {
    if (!token.isHebrew || !token.cleanText) return;
    setSelectedWord(token.cleanText);
    setWordContext(fullSentence);
    setWordSentenceTranslation(sentenceTranslation);
    setWordSentenceTranscription(sentenceTranscription);
  };

  const handleSpeak = (text: string) => {
    speakHebrew(text, { rate: userProfile.speechRate || 0.7 });
  };

  const handleOpenDrawer = (tab: 'words' | 'replies') => {
    setDrawerTab(tab);
    setIsWordsDrawerOpen(true);
  };

  return (
    <div
      data-font-style={userProfile.fontStyle || 'print'}
      className="flex flex-col lg:flex-row h-full flex-1 min-h-0 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
    >
      {/* ЛЕВАЯ КОЛОНКА: ОСНОВНОЙ ЧАТ */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800">
        {/* ВЕРХНЯЯ ЗАКРЕПЛЕННАЯ ПАНЕЛЬ: Вводные данные шага + Переключение пола ♂ ♀ + Сброс ⟲ */}
        <div className="shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 sm:px-4 sm:py-2.5 z-10 shadow-2xs font-hebrew">
          <div className="flex items-center justify-between gap-2">
            {/* Слева: Текущий шаг + кнопка Вводные данные */}
            <div className="flex items-center gap-2 min-w-0">
              {activeStep ? (
                <>
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-2.5 py-1 rounded-lg shrink-0">
                    Шаг {activeStep.stepIndex}/{stepsCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBriefingModal(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 transition cursor-pointer active:scale-95 shadow-2xs truncate"
                    title="Открыть подробные вводные данные шага"
                  >
                    <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="font-bold truncate">
                      Вводные данные
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                    {lesson.dialogue.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBriefingModal(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 transition cursor-pointer active:scale-95 shadow-2xs shrink-0"
                    title="Открыть вводные данные ситуации"
                  >
                    <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="font-bold truncate">
                      Вводные данные
                    </span>
                  </button>
                </>
              )}
            </div>

            {/* Справа: Смена пола ♂ ♀ + Кнопка сброса ⟲ */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleGenderSwitch('male')}
                  className={`px-2 py-1 rounded-md font-bold text-xs transition cursor-pointer ${
                    userProfile.gender === 'male'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                  title="זָכָר ♂ (Мужской род)"
                >
                  ♂
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderSwitch('female')}
                  className={`px-2 py-1 rounded-md font-bold text-xs transition cursor-pointer ${
                    userProfile.gender === 'female'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                  title="נְקֵבָה ♀ (Женский род)"
                >
                  ♀
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 hover:text-blue-600 dark:text-zinc-400 transition cursor-pointer shadow-2xs"
                title="Начать диалог сначала"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Быстрый факт шага (кликабельный) */}
          {activeStep ? (
            <div
              onClick={() => setShowBriefingModal(true)}
              className="mt-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs cursor-pointer group"
              title="Нажмите, чтобы открыть подробные вводные данные шага"
            >
              <div className="flex items-center gap-1.5 min-w-0 text-zinc-700 dark:text-zinc-300">
                <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">📍 Факт:</span>
                <span className="font-medium truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {activeStep.fact}
                </span>
              </div>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold shrink-0 group-hover:underline flex items-center gap-0.5">
                <span>Подробнее</span>
                <span>→</span>
              </span>
            </div>
          ) : (
            lesson.dialogue.situation && (
              <div
                onClick={() => setShowBriefingModal(true)}
                className="mt-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs cursor-pointer group"
                title="Нажмите, чтобы открыть вводные данные ситуации"
              >
                <div className="flex items-center gap-1.5 min-w-0 text-zinc-700 dark:text-zinc-300">
                  <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">📍 Ситуация:</span>
                  <span className="font-medium truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {lesson.dialogue.situation}
                  </span>
                </div>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold shrink-0 group-hover:underline flex items-center gap-0.5">
                  <span>Подробнее</span>
                  <span>→</span>
                </span>
              </div>
            )
          )}
        </div>

        {/* Просторная область сообщений чата */}
        <div className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto space-y-3 bg-zinc-50/40 dark:bg-zinc-950/20">
          {messages.map((msg, index) => {
            const isLastMessage = index === messages.length - 1;
            return (
              <ChatMessageItem
                key={msg.id}
                msg={msg}
                isLastMessage={isLastMessage}
                lastMessageRef={lastMessageRef}
                userProfile={userProfile}
                isTranslationRevealed={Boolean(revealedTranslations[msg.id])}
                addedWords={addedWords}
                onToggleTranslation={toggleTranslation}
                onWordClick={handleWordClick}
                onSpeak={handleSpeak}
                onAddWordDirectly={handleAddWordDirectly}
              />
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-zinc-400 p-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-75" />
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-150" />
              <span className="font-hebrew">
                Собеседник печатает...
              </span>
            </div>
          )}

          {isDialogueFinished && userTurnsCount >= TARGET_TURNS && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-400/40 dark:border-emerald-700/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left animate-in fade-in shadow-xs my-2 font-hebrew">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100">
                    🎉 Диалог успешно завершён!
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Вы успешно пообщались с ИИ! Теперь закрепите живую речь в звонке.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                {onGoToPhone && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = markLessonTabCompleted(lesson.id, 'chat');
                      if (onUpdateProfile) onUpdateProfile(updated);
                      onGoToPhone();
                    }}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      Звонок (этап {getStageNumber('phone')}/{LESSON_STAGES.length}) 📞 ➡️
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="p-2 rounded-xl text-xs font-semibold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                  title="Начать сначала"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. Нижняя зона: Фиксированная строка ввода со встроенным микрофоном */}
        <ChatInputBar
          lastAiMessage={lastAiMessage}
          isDialogueFinished={isDialogueFinished}
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          audioLevel={audioLevel}
          inputText={inputText}
          loading={loading}
          userProfile={userProfile}
          inputRef={inputRef}
          setInputText={setInputText}
          onOpenDrawer={handleOpenDrawer}
          onToggleRecording={toggleRecording}
          onSendMessage={() => handleSendMessage()}
        />
      </div>

      {/* ПРАВАЯ КОЛОНКА: БОКОВАЯ ПАНЕЛЬ ШПАРГАЛКИ (DESKTOP SIDEBAR) */}
      <ChatSidebar
        lesson={lesson}
        userProfile={userProfile}
        activeStep={activeStep}
        stepsCount={stepsCount}
        addedWords={addedWords}
        onAppendWord={handleAppendWord}
        onAddWordDirectly={handleAddWordDirectly}
        onSpeak={handleSpeak}
      />

      {/* БОКОВАЯ ШТОРКА (SIDE DRAWER СПРАВА) ДЛЯ МОБИЛЬНЫХ */}
      <ChatDrawer
        isOpen={isWordsDrawerOpen}
        onOpen={handleOpenDrawer}
        onClose={() => setIsWordsDrawerOpen(false)}
        lesson={lesson}
        userProfile={userProfile}
        lastAiMessage={lastAiMessage}
        isDialogueFinished={isDialogueFinished}
        drawerTab={drawerTab}
        setDrawerTab={setDrawerTab}
        addedWords={addedWords}
        onAddWordDirectly={handleAddWordDirectly}
        onSelectReply={(hebrew) => {
          setInputText(hebrew);
          setIsWordsDrawerOpen(false);
        }}
        onSpeak={handleSpeak}
      />

      {/* МОДАЛЬНОЕ ОКНО: ВВОДНЫЕ ДАННЫЕ ШАГА */}
      <ChatBriefingModal
        isOpen={showBriefingModal}
        onClose={() => setShowBriefingModal(false)}
        lesson={lesson}
        userProfile={userProfile}
        activeStep={activeStep}
        stepsCount={stepsCount}
        onSpeak={handleSpeak}
      />

      {/* Модалка разбора слова */}
      {selectedWord && (
        <WordLookupModal
          word={selectedWord}
          context={wordContext}
          sentenceTranslation={wordSentenceTranslation}
          sentenceTranscription={wordSentenceTranscription}
          isOpen={!!selectedWord}
          onClose={() => setSelectedWord(null)}
          userProfile={userProfile}
          lessonId={lesson.id}
          onWordAdded={onWordAdded}
        />
      )}
    </div>
  );
};
