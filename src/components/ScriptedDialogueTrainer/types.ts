import { Lesson, UserProfile, Word } from '@/types';

export type TrainerMode = 'listen' | 'select_role' | 'practice' | 'completed';

export interface ScriptedDialogueTrainerProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  onWordAdded?: (word: Word) => void;
  onGoToNextTab?: () => void;
}
