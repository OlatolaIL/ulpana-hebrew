import type { Metadata } from 'next';
import { getLessonById, DETAILED_LESSONS } from '@/data/lessonsData';
import { getScriptedDialogueForLesson } from '@/data/dialogueLessons';
import { DialoguesCatalogClient } from './DialoguesCatalogClient';

export const metadata: Metadata = {
  title: 'Каталог диалогов и речевых ситуаций • Ульпана Алеф',
  description:
    '100 живых ситуационных диалогов на иврите: пошаговая практика речи по ролям, озвучка носителей и свободный ИИ-собеседник.',
  openGraph: {
    title: 'Каталог диалогов • Ульпана Алеф',
    description: '100 живых диалогов на иврите с озвучкой и речевым тренажером.',
    url: '/dialogues',
    siteName: 'Ульпана Алеф',
  },
};

export default function DialoguesCatalogPage() {
  const dialogues = Array.from({ length: 100 }, (_, i) => {
    const num = i + 1;
    const lesson = getLessonById(num) || DETAILED_LESSONS[num];
    const diag = getScriptedDialogueForLesson(num);
    return {
      lessonId: num,
      level: lesson?.level || 'alef',
      titleRu: diag.titleRu || lesson?.dialogue?.title || lesson?.titleRussian || `Урок ${num}`,
      titleHe: diag.titleHe || lesson?.titleHebrew || '',
      situation: diag.situationRu || lesson?.dialogue?.situation || lesson?.description || '',
      aiRole: lesson?.dialogue?.aiRole || diag.speakerA?.male?.roleRu || 'Собеседник',
      userRole: lesson?.dialogue?.userRole || diag.speakerB?.male?.roleRu || 'Ученик',
      turnsCount: diag.turns?.length || 0,
    };
  });

  return <DialoguesCatalogClient dialogues={dialogues} />;
}
