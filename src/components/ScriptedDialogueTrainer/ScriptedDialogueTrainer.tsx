'use client';

import React from 'react';
import { ScriptedDialogueTrainerProps } from './types';
import { useScriptedDialogue } from './useScriptedDialogue';
import { DialogueHeader } from './DialogueHeader';
import { ListeningView } from './ListeningView';
import { RoleSelectView } from './RoleSelectView';
import { PracticeView } from './PracticeView';
import { CompletedView } from './CompletedView';
import { DialogueWordsDrawer } from './DialogueWordsDrawer';

export const ScriptedDialogueTrainer: React.FC<ScriptedDialogueTrainerProps> = ({
  lesson,
  userProfile,
  onUpdateProfile,
  onWordAdded,
  onGoToNextTab,
}) => {
  const {
    dialogue,
    userGender,
    setUserGender,
    opponentGender,
    setOpponentGender,
    userRoleSide,
    mode,
    setMode,
    showNikkud,
    showTranscription,
    setShowTranscription,
    showTranslation,
    setShowTranslation,
    speechRate,
    setSpeechRate,
    isPlayingAll,
    activeListeningTurnIndex,
    practiceTurnIndex,
    isOpponentSpeaking,
    isRecording,
    isEvaluating,
    evaluatingPhase,
    spokenText,
    showHint,
    setShowHint,
    lastEvaluation,
    turnHistory,
    showSituationModal,
    setShowSituationModal,
    userAudioUrl,
    playingAudioUrl,
    userAudioPlayerRef,
    isWordsDrawerOpen,
    setIsWordsDrawerOpen,
    addedWords,
    mounted,
    dialogueUsefulWords,
    lessonVocabularyWords,
    totalAvailableWordsCount,
    characterA,
    characterB,
    turnsScrollRef,
    practiceScrollRef,
    evaluationRef,
    bottomConsoleRef,
    isFinalTurn,
    isLastUserTurn,
    getTurnText,
    handlePlayTurn,
    handleTogglePlayAll,
    startRoleplay,
    handleToggleUserAudio,
    handleAddWordToDict,
    startVoiceRecording,
    handleProceedToNextTurn,
    handleCompleteListenStage,
  } = useScriptedDialogue({
    lesson,
    userProfile,
    onUpdateProfile,
    onWordAdded,
    onGoToNextTab,
  });

  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-zinc-50/50 dark:bg-zinc-950/40 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800">
      {/* 1. Верхняя панель управления */}
      <DialogueHeader
        dialogue={dialogue}
        userProfile={userProfile}
        mode={mode}
        showSituationModal={showSituationModal}
        setShowSituationModal={setShowSituationModal}
        totalAvailableWordsCount={totalAvailableWordsCount}
        onOpenWordsDrawer={() => setIsWordsDrawerOpen(true)}
        isPlayingAll={isPlayingAll}
        onTogglePlayAll={handleTogglePlayAll}
        opponentGender={opponentGender}
        setOpponentGender={setOpponentGender}
        userGender={userGender}
        setUserGender={setUserGender}
        onUpdateProfile={onUpdateProfile}
        speechRate={speechRate}
        setSpeechRate={setSpeechRate}
      />

      {/* 2. Основное тело: переключение между режимами */}

      {/* РЕЖИМ 1: ПРОСЛУШИВАНИЕ ДИАЛОГА (LISTEN) */}
      {mode === 'listen' && (
        <ListeningView
          dialogue={dialogue}
          characterA={characterA}
          characterB={characterB}
          getTurnText={getTurnText}
          handlePlayTurn={handlePlayTurn}
          isPlayingAll={isPlayingAll}
          activeListeningTurnIndex={activeListeningTurnIndex}
          turnsScrollRef={turnsScrollRef}
          showNikkud={showNikkud}
          showTranscription={showTranscription}
          setShowTranscription={setShowTranscription}
          showTranslation={showTranslation}
          setShowTranslation={setShowTranslation}
          totalAvailableWordsCount={totalAvailableWordsCount}
          onOpenWordsDrawer={() => setIsWordsDrawerOpen(true)}
          onCompleteListenStage={handleCompleteListenStage}
          onSelectRole={() => setMode('select_role')}
        />
      )}

      {/* РЕЖИМ 2: ВЫБОР РОЛИ (SELECT ROLE) */}
      {mode === 'select_role' && (
        <RoleSelectView
          characterA={characterA}
          characterB={characterB}
          onStartRoleplay={startRoleplay}
          onBackToListen={() => setMode('listen')}
        />
      )}

      {/* РЕЖИМ 3: РОЛЕВАЯ ПРАКТИКА С ГОЛОСОМ (PRACTICE) */}
      {mode === 'practice' && (
        <PracticeView
          lesson={lesson}
          dialogue={dialogue}
          userRoleSide={userRoleSide}
          characterA={characterA}
          characterB={characterB}
          practiceTurnIndex={practiceTurnIndex}
          practiceScrollRef={practiceScrollRef}
          bottomConsoleRef={bottomConsoleRef}
          evaluationRef={evaluationRef}
          getTurnText={getTurnText}
          handlePlayTurn={handlePlayTurn}
          turnHistory={turnHistory}
          userAudioUrl={userAudioUrl}
          playingAudioUrl={playingAudioUrl}
          handleToggleUserAudio={handleToggleUserAudio}
          showNikkud={showNikkud}
          showTranscription={showTranscription}
          totalAvailableWordsCount={totalAvailableWordsCount}
          onOpenWordsDrawer={() => setIsWordsDrawerOpen(true)}
          showHint={showHint}
          setShowHint={setShowHint}
          isEvaluating={isEvaluating}
          evaluatingPhase={evaluatingPhase}
          spokenText={spokenText}
          lastEvaluation={lastEvaluation}
          speechRate={speechRate}
          userAudioPlayerRef={userAudioPlayerRef}
          isFinalTurn={isFinalTurn}
          isLastUserTurn={isLastUserTurn}
          handleProceedToNextTurn={handleProceedToNextTurn}
          startVoiceRecording={startVoiceRecording}
          isRecording={isRecording}
          isOpponentSpeaking={isOpponentSpeaking}
        />
      )}

      {/* РЕЖИМ 4: ИТОГИ ДИАЛОГА И СМЕНА РОЛЕЙ (COMPLETED) */}
      {mode === 'completed' && (
        <CompletedView
          userRoleSide={userRoleSide}
          characterA={characterA}
          characterB={characterB}
          turnHistory={turnHistory}
          onGoToNextTab={onGoToNextTab}
          onSwitchRole={() => {
            const otherSide = userRoleSide === 'a' ? 'b' : 'a';
            startRoleplay(otherSide);
          }}
          onBackToListen={() => setMode('listen')}
        />
      )}

      {/* 5 & 6. Боковой ярлычок и шторка словаря */}
      <DialogueWordsDrawer
        isOpen={isWordsDrawerOpen}
        onClose={() => setIsWordsDrawerOpen(false)}
        onOpen={() => setIsWordsDrawerOpen(true)}
        userProfile={userProfile}
        lessonNumber={lesson.number}
        dialogueUsefulWords={dialogueUsefulWords}
        lessonVocabularyWords={lessonVocabularyWords}
        totalAvailableWordsCount={totalAvailableWordsCount}
        addedWords={addedWords}
        onAddWordToDict={handleAddWordToDict}
        showNikkud={showNikkud}
        showTranscription={showTranscription}
        speechRate={speechRate}
        mounted={mounted}
      />
    </div>
  );
};
