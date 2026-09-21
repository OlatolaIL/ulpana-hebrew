import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import {
  getAllSystemSentences,
  getAudioSettings,
  saveAudioSettings,
  synthesizeSentenceAudio,
} from '@/lib/audioSentencesCatalog';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(500, parseInt(searchParams.get('limit') || '25', 10)));
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const status = (searchParams.get('status') || 'all').toLowerCase(); // 'all' | 'generated' | 'missing'
    const category = (searchParams.get('category') || 'all').toLowerCase(); // 'all' | 'verb' | 'noun' | ...

    // Получаем все фразы системы
    const allSentences = getAllSystemSentences();

    // Статистика по всему каталогу
    const totalCount = allSentences.length;
    let totalGenerated = 0;
    for (const item of allSentences) {
      if (item.hasAudio) totalGenerated++;
    }
    const totalMissing = totalCount - totalGenerated;

    // Фильтрация
    let filtered = allSentences;

    // 1. Фильтр по категории
    if (category && category !== 'all') {
      filtered = filtered.filter((s) => s.category === category);
    }

    // 2. Фильтр по статусу озвучки
    if (status === 'generated') {
      filtered = filtered.filter((s) => s.hasAudio);
    } else if (status === 'missing') {
      filtered = filtered.filter((s) => !s.hasAudio);
    }

    // 3. Поиск по ивриту (с огласовками и без), русскому переводу, теме и словарному слову
    if (search) {
      filtered = filtered.filter((s) => {
        return (
          s.sentencePlain.toLowerCase().includes(search) ||
          s.sentenceHe.includes(search) ||
          s.sentenceRu.toLowerCase().includes(search) ||
          (s.lessonTheme && s.lessonTheme.toLowerCase().includes(search)) ||
          (s.targetWord && s.targetWord.toLowerCase().includes(search))
        );
      });
    }

    const filteredTotal = filtered.length;
    const totalPages = Math.ceil(filteredTotal / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      ok: true,
      items: paginatedItems,
      pagination: {
        total: filteredTotal,
        page,
        limit,
        totalPages,
      },
      stats: {
        total: totalCount,
        generated: totalGenerated,
        missing: totalMissing,
      },
      settings: getAudioSettings(),
    });
  } catch (err: any) {
    console.error('[Admin Audio Sentences GET] Error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Не удалось загрузить список предложений' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const body = await req.json();
    const action = body.action;

    // 1. Сохранение глобального переключателя движка озвучки
    if (action === 'set_engine') {
      const engine = body.engine === 'google_cloud' ? 'google_cloud' : 'current';
      const updated = saveAudioSettings({ sentenceAudioEngine: engine });
      return NextResponse.json({ ok: true, settings: updated });
    }

    // 2. Генерация аудио для массива ID или одного ID
    if (action === 'generate') {
      const idsToGenerate: string[] = Array.isArray(body.ids)
        ? body.ids
        : body.id
        ? [body.id]
        : [];

      if (idsToGenerate.length === 0) {
        return NextResponse.json(
          { ok: false, error: 'Не указаны идентификаторы предложений для генерации' },
          { status: 400 }
        );
      }

      // Находим фразы в общем каталоге
      const allSentences = getAllSystemSentences();
      const sentenceMap = new Map(allSentences.map((s) => [s.id, s]));

      const results = [];
      for (const id of idsToGenerate) {
        const item = sentenceMap.get(id);
        if (!item) {
          results.push({ id, success: false, error: 'Фраза не найдена в каталоге' });
          continue;
        }

        const genRes = await synthesizeSentenceAudio(item.sentenceHe, item.fileName);
        results.push({
          id,
          success: genRes.success,
          bytes: genRes.bytes,
          audioUrl: item.audioUrl,
          error: genRes.error,
        });
      }

      return NextResponse.json({
        ok: true,
        results,
        settings: getAudioSettings(),
      });
    }

    return NextResponse.json({ ok: false, error: 'Неизвестное действие (action)' }, { status: 400 });
  } catch (err: any) {
    console.error('[Admin Audio Sentences POST] Error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Ошибка обработки запроса' },
      { status: 500 }
    );
  }
}
