import React from 'react';
import { PhoneOff, Radio } from 'lucide-react';
import { UserProfile, PhoneScenario } from '@/types';

interface DialingCallViewProps {
  scenario: PhoneScenario;
  userProfile: UserProfile;
  onCancelCall: () => void;
}

export const DialingCallView: React.FC<DialingCallViewProps> = ({
  scenario,
  userProfile,
  onCancelCall,
}) => {
  return (
    <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 text-white rounded-3xl p-8 border border-zinc-800 shadow-2xl flex flex-col items-center justify-center min-h-[420px] text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
        <div className="absolute -inset-4 rounded-full bg-emerald-500/10 animate-pulse" />
        <div className="w-28 h-28 rounded-full bg-zinc-800 border-2 border-emerald-500/50 flex items-center justify-center text-5xl relative z-10 shadow-2xl">
          {scenario.avatarEmoji}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white font-hebrew">
        {scenario.callerName}
      </h3>
      {!userProfile.ulpanMode && (
        <p className="text-sm text-zinc-400 mt-1">{scenario.callerNameRu}</p>
      )}

      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mt-4 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/40 font-hebrew">
        <Radio className="w-4 h-4 animate-spin text-emerald-400" />
        <span>{userProfile.ulpanMode ? '...מְחַיֵּג' : 'מְחַיֵּג... (Идут гудки)'}</span>
      </div>

      {/* Кнопка отмены */}
      <button
        onClick={onCancelCall}
        className="mt-10 p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition active:scale-95 cursor-pointer"
        title={userProfile.ulpanMode ? 'בטל שיחה' : 'Отменить вызов'}
      >
        <PhoneOff className="w-7 h-7" />
      </button>
    </div>
  );
};
