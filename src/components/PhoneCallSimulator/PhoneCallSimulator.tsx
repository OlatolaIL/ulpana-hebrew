'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import { phoneAudio } from '@/lib/phoneAudio';
import { PhoneCallSimulatorProps } from './types';
import { usePhoneCall } from './usePhoneCall';
import { IdleCallView } from './IdleCallView';
import { DialingCallView } from './DialingCallView';
import { ActiveCallView } from './ActiveCallView';
import { CallDebriefView } from './CallDebriefView';
import { CallDrawer } from './CallDrawer';
import { DialogueReviewModal } from './DialogueReviewModal';
import { AudioHelpModal } from './AudioHelpModal';

export const PhoneCallSimulator: React.FC<PhoneCallSimulatorProps> = ({
  lesson,
  userProfile,
  onUpdateProfile,
  onWordAdded,
  onBackToLesson,
}) => {
  const {
    scenario,
    callState,
    setCallState,
    callDuration,
    formatTimer,
    messages,
    isAiSpeaking,
    isRecording,
    audioLevel,
    isMuted,
    liveTranscript,
    loadingAi,
    showSubtitles,
    setShowSubtitles,
    textInput,
    setTextInput,
    showTextInput,
    setShowTextInput,
    speechNotice,
    addedWords,
    isAiHangingUp,
    mounted,
    isWordsDrawerOpen,
    setIsWordsDrawerOpen,
    showDialogueReviewModal,
    setShowDialogueReviewModal,
    debriefReport,
    loadingDebrief,
    showAudioHelp,
    setShowAudioHelp,
    audioHelpUnlocked,
    setAudioHelpUnlocked,
    latestAiMessage,
    isEchoFromAi,
    handleStartCall,
    handleEndCall,
    handleSendMessage,
    toggleMute,
    handleAddWord,
    getRelevantWordsForCall,
  } = usePhoneCall({
    lesson,
    userProfile,
    onUpdateProfile,
    onWordAdded,
  });

  return (
    <div className="space-y-4">
      {/* 1. СОСТОЯНИЕ: ДО ЗВОНКА (IDLE) */}
      {callState === 'idle' && (
        <IdleCallView
          scenario={scenario}
          userProfile={userProfile}
          onStartCall={handleStartCall}
          onOpenWordsDrawer={() => setIsWordsDrawerOpen(true)}
        />
      )}

      {/* 2. СОСТОЯНИЕ: ВЫЗОВ / ГУДКИ (DIALING) */}
      {callState === 'dialing' && (
        <DialingCallView
          scenario={scenario}
          userProfile={userProfile}
          onCancelCall={() => {
            phoneAudio.stopAll();
            setCallState('idle');
          }}
        />
      )}

      {/* 3. СОСТОЯНИЕ: АКТИВНЫЙ РАЗГОВОР (CONNECTED) — ПОЛНОСТЬЮ ГОЛОСОВОЙ HANDS-FREE РЕЖИМ */}
      {callState === 'connected' && (
        <ActiveCallView
          scenario={scenario}
          userProfile={userProfile}
          callDuration={callDuration}
          formatTimer={formatTimer}
          isAiSpeaking={isAiSpeaking}
          isRecording={isRecording}
          audioLevel={audioLevel}
          isMuted={isMuted}
          isAiHangingUp={isAiHangingUp}
          loadingAi={loadingAi}
          latestAiMessage={latestAiMessage}
          showSubtitles={showSubtitles}
          onToggleSubtitles={() => setShowSubtitles(!showSubtitles)}
          onOpenAudioHelp={() => {
            setAudioHelpUnlocked(false);
            setShowAudioHelp(true);
          }}
          liveTranscript={liveTranscript}
          isEchoFromAi={isEchoFromAi}
          onSendMessage={handleSendMessage}
          speechNotice={speechNotice}
          textInput={textInput}
          setTextInput={setTextInput}
          showTextInput={showTextInput}
          setShowTextInput={setShowTextInput}
          onToggleMute={toggleMute}
          onEndCall={handleEndCall}
        />
      )}

      {/* 4. СОСТОЯНИЕ: ЗАВЕРШЕНИЕ И РАЗБОР РАЗГОВОРА (ENDED) */}
      {callState === 'ended' && (
        <CallDebriefView
          scenario={scenario}
          userProfile={userProfile}
          callDuration={callDuration}
          formatTimer={formatTimer}
          messages={messages}
          relevantWords={getRelevantWordsForCall()}
          addedWords={addedWords}
          onAddWord={handleAddWord}
          debriefReport={debriefReport}
          onOpenDialogueReview={() => setShowDialogueReviewModal(true)}
          onStartCall={handleStartCall}
          onBackToLesson={onBackToLesson}
        />
      )}

      {/* 5. БОКОВОЙ ЯРЛЫЧОК ШТОРКИ (Floating Drawer Tab справа) */}
      {scenario.usefulWords && scenario.usefulWords.length > 0 && callState !== 'ended' && (
        <button
          type="button"
          onClick={() => setIsWordsDrawerOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xl rounded-l-2xl py-3 px-1.5 sm:px-2 flex flex-col items-center gap-1.5 cursor-pointer border-y border-l border-blue-400/60 transition-all group font-hebrew"
          title="Полезные фразы к звонку"
        >
          <BookOpen className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase [writing-mode:vertical-rl] tracking-widest text-blue-100">
            ФРАЗЫ
          </span>
          <span className="w-5 h-5 rounded-full bg-white text-blue-700 text-[10px] font-black flex items-center justify-center shadow-xs">
            {scenario.usefulWords.length}
          </span>
        </button>
      )}

      {/* 6. БОКОВАЯ ШТОРКА (SIDE DRAWER СПРАВА) ЧЕРЕЗ CREATEPORTAL */}
      <CallDrawer
        isOpen={isWordsDrawerOpen}
        onClose={() => setIsWordsDrawerOpen(false)}
        scenario={scenario}
        userProfile={userProfile}
        lessonId={lesson.id}
        addedWords={addedWords}
        onAddWord={handleAddWord}
        mounted={mounted}
      />

      {/* 7. МОДАЛЬНОЕ ОКНО ПОЛНОГО ДИАЛОГА И КОММЕНТАРИЕВ ИИ-УЧИТЕЛЯ К ОТВЕТАМ */}
      <DialogueReviewModal
        isOpen={showDialogueReviewModal}
        onClose={() => setShowDialogueReviewModal(false)}
        scenario={scenario}
        userProfile={userProfile}
        lessonId={lesson.id}
        callDuration={callDuration}
        formatTimer={formatTimer}
        messages={messages}
        debriefReport={debriefReport}
        loadingDebrief={loadingDebrief}
        addedWords={addedWords}
        onAddWord={handleAddWord}
        onStartCall={handleStartCall}
        mounted={mounted}
      />

      {/* 8. МОДАЛЬНОЕ ОКНО ПОМОЩИ: НЕ СЛЫШНО СОБЕСЕДНИКА */}
      <AudioHelpModal
        isOpen={showAudioHelp}
        onClose={() => setShowAudioHelp(false)}
        userProfile={userProfile}
        audioHelpUnlocked={audioHelpUnlocked}
        setAudioHelpUnlocked={setAudioHelpUnlocked}
        mounted={mounted}
      />
    </div>
  );
};
