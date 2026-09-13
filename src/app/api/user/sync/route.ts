import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getDbPool, initDatabase } from '@/lib/db';
import { randomUUID } from 'crypto';
import { Word } from '@/types';
import { normalizeHebrewWord, sanitizePersonalVocabulary } from '@/lib/storage';
import { readBoundedJson, RequestBodyError } from '@/lib/requestBody';
import { parseProfileSnapshot } from '@/lib/profileSnapshot';

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

    const pool = getDbPool();
    if (!pool) {
      return NextResponse.json({ error: 'Cloud storage unavailable' }, { status: 503 });
    }
    await initDatabase();
    const db = await pool.connect();
    try {
      await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');

    // 1. Получаем прогресс уроков
    const progressRes = await db.query(
      'SELECT lesson_id, completed_tabs, is_completed, score, last_visited, essay FROM ulpana_lesson_progress WHERE user_id = $1',
      [session.id]
    );

    const lessonProgress: Record<number, any> = {};
    for (const row of progressRes.rows) {
      lessonProgress[row.lesson_id] = {
        completedTabs: row.completed_tabs || [],
        isCompleted: row.is_completed,
        score: row.score,
        lastVisited: Number(row.last_visited) || Date.now(),
        essay: row.essay || undefined,
      };
    }

    // 2. Получаем личный словарик с дедупликацией
    const vocabRes = await db.query(
      'SELECT id, hebrew, hebrew_plain, transcription, translation, part_of_speech, root, lesson_id FROM ulpana_vocabulary WHERE user_id = $1 ORDER BY created_at DESC',
      [session.id]
    );

    const rawList: Word[] = vocabRes.rows.map((r) => ({
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

    const personalVocabulary: Word[] = sanitizePersonalVocabulary(rawList);

    // 3. Получаем прогресс карточек (SM-2 интервалы)
    const userRes = await db.query('SELECT flashcard_stats, sync_revision FROM ulpana_users WHERE id = $1', [session.id]);
    if (!userRes.rows.length) {
      await db.query('ROLLBACK');
      return NextResponse.json({ error: 'Account not found' }, { status: 401 });
    }
    const flashcardStats = userRes.rows[0]?.flashcard_stats || {};

    await db.query('COMMIT');
    return NextResponse.json({
      lessonProgress,
      personalVocabulary,
      flashcardStats,
      userId: session.id,
      revision: Number(userRes.rows[0].sync_revision),
    });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally { db.release(); }
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

    const body = await readBoundedJson(req, 2_000_000);
    if (body.expectedUserId !== session.id) return NextResponse.json({ error: 'Account changed' }, { status: 409 });
    const { lessonProgress, personalVocabulary, flashcardStats, gender, fontStyle, expectedUserId, expectedRevision } = parseProfileSnapshot(body);
    if (expectedUserId !== session.id) return NextResponse.json({ error: 'Account changed' }, { status: 409 });
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 ||
        !lessonProgress || typeof lessonProgress !== 'object' || Array.isArray(lessonProgress) ||
        Object.keys(lessonProgress).length > 100 || !Array.isArray(personalVocabulary) || personalVocabulary.length > 10000 ||
        !flashcardStats || typeof flashcardStats !== 'object' || Array.isArray(flashcardStats) ||
        !['male', 'female'].includes(gender) || !['print', 'cursive'].includes(fontStyle)) {
      return NextResponse.json({ error: 'Invalid profile snapshot' }, { status: 400 });
    }
    const pool = getDbPool();
    if (!pool) return NextResponse.json({ error: 'Cloud storage unavailable' }, { status: 503 });
    await initDatabase();
    const db = await pool.connect();
    try {
      await db.query('BEGIN');
      const current = await db.query('SELECT sync_revision FROM ulpana_users WHERE id = $1 FOR UPDATE', [session.id]);
      if (!current.rows.length || Number(current.rows[0].sync_revision) !== expectedRevision) {
        await db.query('ROLLBACK');
        return NextResponse.json({ error: 'Profile changed on another device' }, { status: 409 });
      }

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
        updateFields.push(`flashcard_stats = $${paramIdx++}::jsonb`);
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
          if (!Number.isInteger(lessonId) || lessonId < 1 || lessonId > 100 || !prog || !Array.isArray(prog.completedTabs) ||
              prog.completedTabs.some((tab: unknown) => typeof tab !== 'string' || !['theory', 'vocab', 'exercises', 'essay', 'chat', 'phone'].includes(tab))) {
            throw new Error('Invalid lesson progress');
          }

          await db.query(
            `INSERT INTO ulpana_lesson_progress (user_id, lesson_id, completed_tabs, is_completed, score, last_visited, essay, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
             ON CONFLICT (user_id, lesson_id)
             DO UPDATE SET
               completed_tabs = EXCLUDED.completed_tabs,
               is_completed = EXCLUDED.is_completed,
               score = EXCLUDED.score,
               last_visited = EXCLUDED.last_visited,
               essay = CASE
                 WHEN NOT ('essay' = ANY(EXCLUDED.completed_tabs)) THEN NULL
                 ELSE COALESCE(EXCLUDED.essay, ulpana_lesson_progress.essay)
               END,
               updated_at = NOW()`,
            [
              session.id,
              lessonId,
              prog.completedTabs || [],
              !!prog.isCompleted,
              prog.score || 0,
              prog.lastVisited || Date.now(),
              prog.essay ? JSON.stringify(prog.essay) : null,
            ]
          );
        }
      }

      // Сохраняем личный словарик с надёжной дедупликацией
      if (Array.isArray(personalVocabulary)) {
        const cleanList = sanitizePersonalVocabulary(personalVocabulary);
        for (const word of cleanList) {
          if (!word.hebrew || !word.translation) continue;
          const plain = normalizeHebrewWord(word.hebrewPlain || word.hebrew);
          if (!plain) continue;

          // Ищем существующую запись по hebrew_plain или hebrew
          const existing = await db.query(
            'SELECT id FROM ulpana_vocabulary WHERE user_id = $1 AND (hebrew_plain = $2 OR hebrew = $3) LIMIT 1',
            [session.id, plain, word.hebrew]
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
                word.hebrew,
                plain,
                word.transcription || '',
                word.translation,
                word.partOfSpeech || 'other',
                word.root || null,
                word.lessonId || null,
                keepId,
              ]
            );
            // Удаляем любые оставшиеся дубликаты этого же слова у пользователя
            await db.query(
              'DELETE FROM ulpana_vocabulary WHERE user_id = $1 AND (hebrew_plain = $2 OR hebrew = $3) AND id != $4',
              [session.id, plain, word.hebrew, keepId]
            );
          } else {
            const wordId = randomUUID();
            await db.query(
              `INSERT INTO ulpana_vocabulary (id, user_id, hebrew, hebrew_plain, transcription, translation, part_of_speech, root, lesson_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (user_id, hebrew_plain) DO UPDATE SET
                 hebrew = EXCLUDED.hebrew,
                 transcription = EXCLUDED.transcription,
                 translation = EXCLUDED.translation,
                 part_of_speech = EXCLUDED.part_of_speech,
                 root = EXCLUDED.root,
                 lesson_id = COALESCE(EXCLUDED.lesson_id, ulpana_vocabulary.lesson_id)`,
              [
                wordId,
                session.id,
                word.hebrew,
                plain,
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
    }

      await db.query('DELETE FROM ulpana_lesson_progress WHERE user_id = $1 AND NOT (lesson_id = ANY($2::int[]))',
        [session.id, Object.keys(lessonProgress).map(Number)]);
      await db.query('DELETE FROM ulpana_vocabulary WHERE user_id = $1 AND NOT (hebrew_plain = ANY($2::text[]))',
        [session.id, sanitizePersonalVocabulary(personalVocabulary).map(w => normalizeHebrewWord(w.hebrewPlain || w.hebrew))]);
      await db.query('UPDATE ulpana_users SET sync_revision = sync_revision + 1 WHERE id = $1', [session.id]);
      await db.query('COMMIT');
      return NextResponse.json({ success: true, userId: session.id, revision: expectedRevision + 1 });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally { db.release(); }
  } catch (error) {
    if (error instanceof RequestBodyError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[API User Sync POST] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
