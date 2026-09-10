import { Lesson, UserProfile, Word } from '@/types';

export interface LessonAiChatProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  onWordAdded?: (word: Word) => void;
  onGoToPhone?: () => void;
}
