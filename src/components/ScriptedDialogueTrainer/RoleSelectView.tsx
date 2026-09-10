import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { DialogueParticipant } from '@/types';

interface RoleSelectViewProps {
  characterA: DialogueParticipant;
  characterB: DialogueParticipant;
  onStartRoleplay: (chosenRole: 'a' | 'b') => void;
  onBackToListen: () => void;
}

export const RoleSelectView: React.FC<RoleSelectViewProps> = ({
  characterA,
  characterB,
  onStartRoleplay,
  onBackToListen,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
          <Users className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
            За какую сторону вы хотите сыграть?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Вы будете отвечать ГОЛОСОМ через микрофон. ИИ оценит смысл ваших ответов.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
          {/* Карточка Сторона А */}
          <button
            type="button"
            onClick={() => onStartRoleplay('a')}
            className="p-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-zinc-900 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all cursor-pointer group shadow-2xs hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="text-3xl mb-2">{characterA.avatarEmoji}</div>
              <div className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {characterA.nameRu}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                {characterA.roleRu}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
              <span>Играть за роль А</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* Карточка Сторона Б */}
          <button
            type="button"
            onClick={() => onStartRoleplay('b')}
            className="p-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-purple-500 dark:hover:border-purple-500 bg-white dark:bg-zinc-900 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-all cursor-pointer group shadow-2xs hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="text-3xl mb-2">{characterB.avatarEmoji}</div>
              <div className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                {characterB.nameRu}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                {characterB.roleRu}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
              <span>Играть за роль Б</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </button>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onBackToListen}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 underline cursor-pointer"
          >
            ← Вернуться к прослушиванию диалога
          </button>
        </div>
      </div>
    </div>
  );
};
