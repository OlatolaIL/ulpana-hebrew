'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Bot,
  User as UserIcon,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { Lesson, UserProfile, ChatMessage, Word } from '@/types';
import { tokenizeText, TextToken, stripNikkud } from '@/lib/transcription';
import { speakHebrew, HebrewSpeechRecognizer } from '@/lib/speech';
import { WordLookupModal } from './WordLookupModal';
import { markLessonTabCompleted } from '@/lib/storage';

interface LessonAiChatProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onWordAdded?: (word: Word) => void;
}

export const LessonAiChat: React.FC<LessonAiChatProps> = ({
  lesson,
  userProfile,
  onWordAdded,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordContext, setWordContext] = useState<string>('');
  const [recognizer, setRecognizer] = useState<HebrewSpeechRecognizer | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initial: ChatMessage = {
      id: 'init-1',
      role: 'assistant',
      hebrew: lesson.dialogue.initialMessage.hebrew,
      transcription: lesson.dialogue.initialMessage.transcription,
      translation: lesson.dialogue.initialMessage.translation,
      timestamp: Date.now(),
      suggestedReplies:
        lesson.number === 1
          ? [
              {
                hebrew: 'שָׁלוֹם, קוֹרְאִים לִי...',
                transcription: 'шалóм, коръӣм ли...',
                translation: 'Привет, меня зовут...',
              },
              {
                hebrew: 'בֹּקֶר טוֹב! מָה נִשְׁמַע?',
                transcription: 'бóкер тов! ма нишмá?',
                translation: 'Доброе утро! Как дела?',
              },
              {
                hebrew: 'נָעִים מְאוֹד!',
                transcription: 'наӣм мэóд!',
                translation: 'Очень приятно!',
              },
            ]
          : [
              {
                hebrew:
                  userProfile.gender === 'female'
                    ? 'אֲנִי רוֹצָה קָפֶה עִם חָלָב, בְּבַקָּשָׁה.'
                    : 'אֲנִי רוֹצֶה קָפֶה עִם חָלָב, בְּבַקָּשָׁה.',
                transcription:
                  userProfile.gender === 'female'
                    ? 'анӣ роцá кафэ́ им халáв, бэвакашá.'
                    : 'анӣ роцé кафэ́ им халáв, бэвакашá.',
                translation: 'Я хочу кофе с молоком, пожалуйста.',
              },
              {
                hebrew: 'אֶפְשָׁר תֵּה עִם סוּכָּר?',
                transcription: 'эфшáр тэ им сукáр?',
                translation: 'Можно чай с сахаром?',
              },
              {
                hebrew: 'מַיִם קָרִים, בְּבַקָּשָׁה.',
                transcription: 'мáйим карӣм, бэвакашá.',
                translation: 'Холодную воду, пожалуйста.',
              },
            ],
    };
    setMessages([initial]);

    const rec = new HebrewSpeechRecognizer();
    setRecognizer(rec);
  }, [lesson, userProfile.gender]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      hebrew: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const history = newMessages.map((m) => ({
        role: m.role,
        content: m.hebrew,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          lessonNumber: lesson.number,
          level: lesson.level,
          userGender: userProfile.gender,
          scenarioTitle: lesson.dialogue.title,
          situation: lesson.dialogue.situation,
          aiRole: lesson.dialogue.aiRole,
          userRole: lesson.dialogue.userRole,
          goals: lesson.dialogue.goals,
          provider: userProfile.aiProvider,
          apiKey:
            userProfile.aiProvider === 'groq'
              ? userProfile.groqApiKey
              : userProfile.geminiApiKey,
        }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        hebrew: data.hebrew || 'שָׁלוֹם!',
        transcription: data.transcription,
        translation: data.translation,
        feedback: data.feedback,
        suggestedReplies: data.suggestedReplies || [],
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      markLessonTabCompleted(lesson.id, 'chat');
      speakHebrew(aiMsg.hebrew);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!recognizer || !recognizer.isSupported()) {
      alert('Голосовой ввод не поддерживается вашим браузером. Попробуйте Chrome или Safari.');
      return;
    }

    if (isRecording) {
      recognizer.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognizer.start(
        (transcript, isFinal) => {
          setInputText(transcript);
          if (isFinal) {
            setIsRecording(false);
          }
        },
        () => setIsRecording(false),
        () => setIsRecording(false)
      );
    }
  };

  const handleWordClick = (token: TextToken, fullSentence: string) => {
    if (!token.isHebrew || !token.cleanText) return;
    setSelectedWord(token.cleanText);
    setWordContext(fullSentence);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'assistant',
        hebrew: lesson.dialogue.initialMessage.hebrew,
        transcription: lesson.dialogue.initialMessage.transcription,
        translation: lesson.dialogue.initialMessage.translation,
        timestamp: Date.now(),
      },
    ]);
  };

  const lastAiMessage = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="flex flex-col h-[700px] max-h-[80vh] bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-800/60 p-4 border-b border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">
              Ролевой диалог
            </span>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {lesson.dialogue.title}
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
            {lesson.dialogue.situation}
          </p>
        </div>
        <button
          onClick={handleResetChat}
          className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition"
          title="Начать диалог сначала"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-blue-500/10 px-4 py-1.5 border-b border-blue-500/20 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Нажмите на любое слово на иврите, чтобы увидеть перевод и добавить в словарик</span>
        </span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-50/50 dark:bg-zinc-950/30">
        {messages.map((msg) => {
          const isAi = msg.role === 'assistant';
          const tokens = tokenizeText(msg.hebrew);

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} space-y-1`}
            >
              <div className="flex items-end gap-2 max-w-[90%]">
                {isAi && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mb-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl shadow-sm ${
                    isAi
                      ? 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-bl-sm'
                      : 'bg-blue-600 text-white rounded-br-sm'
                  }`}
                >
                  <div
                    dir="rtl"
                    className="text-xl md:text-2xl font-bold font-hebrew leading-loose text-right"
                  >
                    {isAi
                      ? tokens.map((token) => {
                          const displayWord = userProfile.showNikkud
                            ? token.text
                            : stripNikkud(token.text);

                          if (token.isHebrew) {
                            return (
                              <span
                                key={token.id}
                                onClick={() => handleWordClick(token, msg.hebrew)}
                                className="inline hover:text-blue-600 dark:hover:text-blue-400 hover:underline hover:bg-blue-100 dark:hover:bg-blue-900/50 px-1 py-0.5 rounded transition cursor-pointer"
                                title="Посмотреть перевод и добавить в словарик"
                              >
                                {displayWord}
                              </span>
                            );
                          }
                          return <span key={token.id}>{token.text}</span>;
                        })
                      : userProfile.showNikkud
                      ? msg.hebrew
                      : stripNikkud(msg.hebrew)}
                  </div>

                  {userProfile.showTranscription && msg.transcription && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1.5">
                      [{msg.transcription}]
                    </p>
                  )}

                  {msg.translation && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
                      {msg.translation}
                    </p>
                  )}

                  {isAi && (
                    <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-end">
                      <button
                        onClick={() => speakHebrew(msg.hebrew)}
                        className="text-xs text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Прослушать</span>
                      </button>
                    </div>
                  )}
                </div>

                {!isAi && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mb-1 shadow-sm">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>

              {msg.feedback && (
                <div className="ml-10 max-w-[80%] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-2.5 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Пояснение учителя: </span>
                    <span>{msg.feedback}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {lastAiMessage && lastAiMessage.suggestedReplies && lastAiMessage.suggestedReplies.length > 0 && (
          <div className="pt-2 pl-10 flex flex-wrap gap-2 animate-in fade-in">
            {lastAiMessage.suggestedReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(reply.hebrew)}
                className="text-left bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-900 hover:border-blue-500 dark:hover:border-blue-400 p-2.5 rounded-xl text-xs transition shadow-sm hover:scale-101 active:scale-98"
              >
                <div dir="rtl" className="font-bold text-zinc-900 dark:text-zinc-100 font-hebrew text-sm">
                  {userProfile.showNikkud ? reply.hebrew : stripNikkud(reply.hebrew)}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {reply.translation}
                </div>
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 p-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-75" />
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-150" />
            <span>Собеседник печатает...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2.5 rounded-xl border transition ${
              isRecording
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="Голосовой ввод на иврите"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            dir="auto"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Напишите ответ на иврите или выберите подсказку выше..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-zinc-100"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {selectedWord && (
        <WordLookupModal
          word={selectedWord}
          context={wordContext}
          isOpen={!!selectedWord}
          onClose={() => setSelectedWord(null)}
          userProfile={userProfile}
          onWordAdded={onWordAdded}
        />
      )}
    </div>
  );
};
