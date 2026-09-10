import { Word, UserProfile } from '@/types';

export type TrainerMode = 'flip' | 'builder' | 'listening' | 'auto_audio';

export interface Tile {
  id: string;
  char: string;
}

export interface FlashcardTrainerProps {
  initialWords: Word[];
  userProfile: UserProfile;
  onClose?: () => void;
  onUpdateProfile?: (profile: UserProfile) => void;
  customTitle?: string;
  initialMode?: TrainerMode;
  initialDirection?: 'he-ru' | 'ru-he' | 'carousel';
  initialShuffle?: boolean;
  lessonId?: number;
  onContinueLesson?: (
    lessonId: number,
    nextTab: 'theory' | 'vocab' | 'exercises' | 'chat' | 'phone'
  ) => void;
}
