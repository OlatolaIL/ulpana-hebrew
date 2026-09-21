import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import {
  getAllSystemSentences,
  getAudioSettings,
  saveAudioSettings,
  synthesizeSentenceAudio,
  synthesizeSentenceAudioEdge,
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
    const genderFilter = (searchParams.get('gender') || 'all').toLowerCase(); // 'all' | 'sensitive' | 'female' | 'male' | 'neutral'

    // Получаем все фразы системы
    const allSentences = getAllSystemSentences();

    // Статистика по всему каталогу
    const totalCount = allSentences.length;
    let totalGenerated = 0;
    let totalSensitive = 0;
    let totalSensitiveFemaleGenerated = 0;
    for (const item of allSentences) {
      if (item.hasAudio) totalGenerated++;
      if (item.isGenderSensitive) {
        totalSensitive++;
        if (item.femaleVariant?.hasAudio) totalSensitiveFemaleGenerated++;
      }
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

    // 3. Фильтр по грамматическому роду
    if (genderFilter === 'sensitive') {
      filtered = filtered.filter((s) => s.isGenderSensitive);
    } else if (genderFilter === 'female') {
      filtered = filtered.filter(
        (s) => s.genderCategory === 'third_person_f' || s.genderCategory === 'second_person_f'
      );
    } else if (genderFilter === 'male') {
      filtered = filtered.filter(
        (s) => s.genderCategory === 'third_person_m' || s.genderCategory === 'second_person_m'
      );
    } else if (genderFilter === 'neutral') {
      filtered = filtered.filter((s) => s.genderCategory === 'neutral');
    }

    // 4. Поиск по ивриту (с огласовками и без), русскому переводу, теме и словарному слову
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
        sensitive: totalSensitive,
        sensitiveFemaleGenerated: totalSensitiveFemaleGenerated,
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
      const allowedEngines = ['current', 'google_cloud', 'edge_neural'];
      const engine = allowedEngines.includes(body.engine) ? body.engine : 'current';
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

      const targetEngine = body.engine || getAudioSettings().sentenceAudioEngine;
      const targetVariant = body.variant || 'male'; // 'male' | 'female' | 'both'
      const results = [];

      for (const id of idsToGenerate) {
        const item = sentenceMap.get(id);
        if (!item) {
          results.push({ id, success: false, error: 'Фраза не найдена в каталоге' });
          continue;
        }

        // Если запрошена генерация только женской версии
        if (targetVariant === 'female' && item.femaleVariant) {
          const genRes = await synthesizeSentenceAudioEdge(
            item.femaleVariant.sentenceHe,
            item.femaleVariant.fileName,
            'he-IL-HilaNeural',
            true
          );
          results.push({
            id,
            variant: 'female',
            success: genRes.success,
            bytes: genRes.bytes,
            audioUrl: item.femaleVariant.audioUrl,
            error: genRes.error,
          });
          continue;
        }

        // Генерация мужской / основной фразы
        let mainRes;
        if (targetEngine === 'edge_neural') {
          const voice = item.defaultVoice || 'he-IL-AvriNeural';
          mainRes = await synthesizeSentenceAudioEdge(item.sentenceHe, item.fileName, voice, false);
        } else {
          mainRes = await synthesizeSentenceAudio(item.sentenceHe, item.fileName);
        }

        // Если запрошено 'both' и фраза чувствительна к полу — генерируем также женский вариант
        if (targetVariant === 'both' && item.isGenderSensitive && item.femaleVariant) {
          await synthesizeSentenceAudioEdge(
            item.femaleVariant.sentenceHe,
            item.femaleVariant.fileName,
            'he-IL-HilaNeural',
            true
          );
        }

        results.push({
          id,
          variant: 'main',
          success: mainRes.success,
          bytes: mainRes.bytes,
          audioUrl: item.audioUrl,
          error: mainRes.error,
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
