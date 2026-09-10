import { Lesson, UserProfile, Word, PhoneScenario } from '@/types';

export type CallState = 'idle' | 'dialing' | 'connected' | 'ended';

export interface PhoneCallSimulatorProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  onWordAdded?: (word: Word) => void;
  onBackToLesson?: () => void;
}

export type { PhoneScenario };
