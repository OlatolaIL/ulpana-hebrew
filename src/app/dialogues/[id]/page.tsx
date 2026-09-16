import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLessonById } from '@/data/lessonsData';
import { getScriptedDialogueForLesson } from '@/data/dialogueLessons';
import { DialoguePageClient } from './DialoguePageClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const num = parseInt(id, 10);
  if (isNaN(num) || num < 1 || num > 100) {
    return {
      title: 'Диалог не найден • Ульпана Алеф',
    };
  }

  const lesson = getLessonById(num);
  if (!lesson) {
    return {
      title: 'Диалог не найден • Ульпана Алеф',
    };
  }

  const dialogue = getScriptedDialogueForLesson(num);
  const title = dialogue.titleRu || lesson.dialogue?.title || lesson.titleRussian;
  const titleHe = dialogue.titleHe || lesson.titleHebrew;
  const situation = dialogue.situationRu || lesson.dialogue?.situation || lesson.description;
  const pageTitle = `Урок ${num}: Диалог «${title}» (${titleHe}) • Ульпана Алеф`;

  return {
    title: pageTitle,
    description: `Разговорная практика на иврите. ${situation}. Живой диалог по ролям с озвучкой носителей и распознаванием речи.`,
    openGraph: {
      title: pageTitle,
      description: situation,
      type: 'article',
      url: `/dialogues/${num}`,
      siteName: 'Ульпана Алеф',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: situation,
    },
  };
}

export default async function DialoguePage({ params }: Props) {
  const { id } = await params;
  const num = parseInt(id, 10);
  if (isNaN(num) || num < 1 || num > 100) {
    notFound();
  }

  const lesson = getLessonById(num);
  if (!lesson) {
    notFound();
  }

  return <DialoguePageClient lessonId={num} />;
}
