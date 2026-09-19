'use client';

import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { BookOpen, Sparkles, Loader2 } from 'lucide-react';

export default function LessonStageDeepLinkPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    const rawId = params?.id;
    const rawStage = params?.stageId;
    const lessonId = rawId ? String(rawId) : '1';
    const stageId = rawStage ? String(rawStage).toLowerCase() : 'theory';
    const promo = searchParams.get('promo') || searchParams.get('ref');

    if (promo && typeof window !== 'undefined') {
      try {
        const cleanPromo = promo.trim().toUpperCase();
        localStorage.setItem('ulpana_pending_promo', cleanPromo);
        localStorage.setItem('ulpana_referral_source', cleanPromo);
        localStorage.setItem('ulpana_promo_captured_at', Date.now().toString());
      } catch {}
    }

    const targetUrl = promo
      ? `/?promo=${encodeURIComponent(promo)}#lesson-${lessonId}/${stageId}`
      : `/#lesson-${lessonId}/${stageId}`;

    window.location.replace(targetUrl);
  }, [params, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 animate-pulse">
          <BookOpen className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center justify-center gap-2">
            Урок Ульпан Алеф <Sparkles className="w-4 h-4 text-amber-400" />
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Загрузка этапа урока...
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Перенаправление в урок</span>
        </div>
      </div>
    </div>
  );
}
