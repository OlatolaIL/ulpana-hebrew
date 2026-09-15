import { NextResponse } from 'next/server';
import { groqModels, geminiModel } from '@/lib/aiModels';

/**
 * GET /api/healthz
 * Public diagnostic endpoint — returns active model configuration.
 * Never exposes secrets, only model names from env vars.
 */
export async function GET() {
  const models = groqModels();
  const gemini = (() => { try { return geminiModel(); } catch { return null; } })();

  return NextResponse.json({
    status: 'ok',
    groq: {
      primary: models[0] || null,
      fallback: models[1] || null,
    },
    gemini: gemini,
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
}
