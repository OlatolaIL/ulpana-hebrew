import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getDbPool } from '@/lib/db';
import { Word } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('ulpana_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ lessonProgress: {}, personalVocabulary: [] });
    }

    // 1. Получаем прогресс уроков
    const progressRes = await db.query(
      'SELECT lesson_id, completed_tabs, is_completed, score, last_visited FROM ulpana_lesson_progress WHERE user_id = $1',
      [session.id]
    );

    const lessonProgress: Record<number, any> = {};
    for (const row of progressRes.rows) {
      lessonProgress[row.lesson_id] = {
        completedTabs: row.completed_tabs || [],
        isCompleted: row.is_completed,
        score: row.score,
        lastVisited: Number(row.last_visited) || Date.now(),
      };
    }

    // 2. Получаем личный словарик
    const vocabRes = await db.query(
      'SELECT id, hebrew, hebrew_plain, transcription, translation, part_of_speech, root, lesson_id FROM ulpana_vocabulary WHERE user_id = $1 ORDER BY created_at DESC',
      [session.id]
    );

    const personalVocabulary: Word[] = vocabRes.rows.map((r) => ({
      id: r.id,
      hebrew: r.hebrew,
      hebrewPlain: r.hebrew_plain,
      transcription: r.transcription || '',
      translation: r.translation,
      partOfSpeech: r.part_of_speech || 'other',
      root: r.root || undefined,
      lessonId: r.lesson_id || 0,
      isUserAdded: true,
    }));

    return NextResponse.json({
      lessonProgress,
      personalVocabulary,
    });
  } catch (error) {
    console.error('[API User Sync GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('ulpana_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { lessonProgress, personalVocabulary, gender, fontStyle } = await req.json();
    const db = getDbPool();

    if (db) {
      // Обновляем настройки пользователя
      if (gender || fontStyle) {
        await db.query(
          `UPDATE ulpana_users
           SET gender = COALESCE($1, gender), font_style = COALESCE($2, font_style), updated_at = NOW()
           WHERE id = $3`,
          [gender || null, fontStyle || null, session.id]
        );
      }

      // Сохраняем прогресс по урокам
      if (lessonProgress && typeof lessonProgress === 'object') {
        for (const [lessonIdStr, prog] of Object.entries(lessonProgress as Record<string, any>)) {
          const lessonId = parseInt(lessonIdStr, 10);
          if (isNaN(lessonId)) continue;

          await db.query(
            `INSERT INTO ulpana_lesson_progress (user_id, lesson_id, completed_tabs, is_completed, score, last_visited, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             ON CONFLICT (user_id, lesson_id)
             DO UPDATE SET
               completed_tabs = EXCLUDED.completed_tabs,
               is_completed = EXCLUDED.is_completed,
               score = EXCLUDED.score,
               last_visited = EXCLUDED.last_visited,
               updated_at = NOW()`,
            [
              session.id,
              lessonId,
              prog.completedTabs || [],
              !!prog.isCompleted,
              prog.score || 0,
              prog.lastVisited || Date.now(),
            ]
          );
        }
      }

      // Сохраняем личный словарик
      if (Array.isArray(personalVocabulary)) {
        for (const word of personalVocabulary) {
          if (!word.hebrew || !word.translation) continue;
          const wordId = word.id || `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

          await db.query(
            `INSERT INTO ulpana_vocabulary (id, user_id, hebrew, hebrew_plain, transcription, translation, part_of_speech, root, lesson_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO UPDATE SET
               translation = EXCLUDED.translation,
               transcription = EXCLUDED.transcription,
               part_of_speech = EXCLUDED.part_of_speech,
               root = EXCLUDED.root`,
            [
              wordId,
              session.id,
              word.hebrew,
              word.hebrewPlain || word.hebrew,
              word.transcription || '',
              word.translation,
              word.partOfSpeech || 'other',
              word.root || null,
              word.lessonId || 0,
            ]
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API User Sync POST] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
