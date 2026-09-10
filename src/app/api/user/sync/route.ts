import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getDbPool } from '@/lib/db';
import { Word } from '@/types';
import { normalizeHebrewWord } from '@/lib/storage';

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

    // 2. Получаем личный словарик с дедупликацией
    const vocabRes = await db.query(
      'SELECT id, hebrew, hebrew_plain, transcription, translation, part_of_speech, root, lesson_id FROM ulpana_vocabulary WHERE user_id = $1 ORDER BY created_at DESC',
      [session.id]
    );

    const seenPlain = new Set<string>();
    const personalVocabulary: Word[] = [];
    for (const r of vocabRes.rows) {
      const plain = normalizeHebrewWord(r.hebrew_plain || r.hebrew);
      if (!plain || seenPlain.has(plain)) continue;
      seenPlain.add(plain);

      let hebrew = r.hebrew;
      let transcription = r.transcription || '';
      let translation = r.translation;
      let root = r.root || undefined;

      // Авто-исправление старых записей мебели
      if (plain === 'רהוט' || plain === 'ריהוט') {
        if (translation?.toLowerCase().includes('просторн') || root?.includes('ר-ו-ה')) {
          hebrew = 'רִיהוּט';
          transcription = 'риhӯт';
          translation = 'мебель, обстановка';
          root = 'ר-ה-ט';
        }
      }

      personalVocabulary.push({
        id: r.id,
        hebrew,
        hebrewPlain: plain,
        transcription,
        translation,
        partOfSpeech: r.part_of_speech || 'other',
        root,
        lessonId: r.lesson_id || 0,
        isUserAdded: true,
      });
    }

    // 3. Получаем прогресс карточек (SM-2 интервалы)
    const userRes = await db.query('SELECT flashcard_stats FROM ulpana_users WHERE id = $1', [session.id]);
    const flashcardStats = userRes.rows[0]?.flashcard_stats || {};

    return NextResponse.json({
      lessonProgress,
      personalVocabulary,
      flashcardStats,
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

    const { lessonProgress, personalVocabulary, flashcardStats, gender, fontStyle } = await req.json();
    const db = getDbPool();

    if (db) {
      // Обновляем настройки пользователя и прогресс карточек
      const updateFields: string[] = ['updated_at = NOW()'];
      const updateValues: any[] = [];
      let paramIdx = 1;

      if (gender) {
        updateFields.push(`gender = $${paramIdx++}`);
        updateValues.push(gender);
      }
      if (fontStyle) {
        updateFields.push(`font_style = $${paramIdx++}`);
        updateValues.push(fontStyle);
      }
      if (flashcardStats && typeof flashcardStats === 'object') {
        updateFields.push(`flashcard_stats = COALESCE(flashcard_stats, '{}'::jsonb) || $${paramIdx++}::jsonb`);
        updateValues.push(JSON.stringify(flashcardStats));
      }

      if (updateValues.length > 0) {
        updateValues.push(session.id);
        await db.query(
          `UPDATE ulpana_users SET ${updateFields.join(', ')} WHERE id = $${paramIdx}`,
          updateValues
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

      // Сохраняем личный словарик с надёжной дедупликацией
      if (Array.isArray(personalVocabulary)) {
        const seenInBatch = new Set<string>();
        for (const word of personalVocabulary) {
          if (!word.hebrew || !word.translation) continue;
          const plain = normalizeHebrewWord(word.hebrewPlain || word.hebrew);
          if (!plain || seenInBatch.has(plain)) continue;
          seenInBatch.add(plain);

          // Авто-исправление старых ошибочных записей
          let hebrew = word.hebrew;
          let transcription = word.transcription || '';
          let translation = word.translation;
          let root = word.root || null;
          if (plain === 'רהוט' || plain === 'ריהוט') {
            if (translation?.toLowerCase().includes('просторн') || root?.includes('ר-ו-ה')) {
              hebrew = 'רִיהוּט';
              transcription = 'риhӯт';
              translation = 'мебель, обстановка';
              root = 'ר-ה-ט';
            }
          }

          // Ищем существующую запись по hebrew_plain или hebrew
          const existing = await db.query(
            'SELECT id FROM ulpana_vocabulary WHERE user_id = $1 AND (hebrew_plain = $2 OR hebrew = $3) LIMIT 1',
            [session.id, plain, hebrew]
          );

          if (existing.rows.length > 0) {
            const keepId = existing.rows[0].id;
            await db.query(
              `UPDATE ulpana_vocabulary SET
                 hebrew = $1,
                 hebrew_plain = $2,
                 transcription = $3,
                 translation = $4,
                 part_of_speech = $5,
                 root = $6,
                 lesson_id = COALESCE($7, lesson_id)
               WHERE id = $8`,
              [
                hebrew,
                plain,
                transcription,
                translation,
                word.partOfSpeech || 'other',
                root,
                word.lessonId || null,
                keepId,
              ]
            );
            // Удаляем любые оставшиеся дубликаты этого же слова у пользователя
            await db.query(
              'DELETE FROM ulpana_vocabulary WHERE user_id = $1 AND (hebrew_plain = $2 OR hebrew = $3) AND id != $4',
              [session.id, plain, hebrew, keepId]
            );
          } else {
            const wordId = word.id || `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            await db.query(
              `INSERT INTO ulpana_vocabulary (id, user_id, hebrew, hebrew_plain, transcription, translation, part_of_speech, root, lesson_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                wordId,
                session.id,
                hebrew,
                plain,
                transcription,
                translation,
                word.partOfSpeech || 'other',
                root,
                word.lessonId || 0,
              ]
            );
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API User Sync POST] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
