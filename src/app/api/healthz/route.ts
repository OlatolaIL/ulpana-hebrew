import { NextResponse } from 'next/server';
import { groqModels, geminiModel, geminiModels } from '@/lib/aiModels';

/**
 * GET /api/healthz
 * Public diagnostic endpoint — returns active model configuration.
 * Never exposes secrets, only model names from env vars.
 */
export async function GET() {
  const essayGroq = groqModels('essay');
  const phoneGroq = groqModels('phone');
  const geminiList = geminiModels('essay');

  return NextResponse.json({
    status: 'ok',
    groq: {
      primary: essayGroq[0] || null,
      fallback: essayGroq[1] || null,
      essay: essayGroq,
      phone: phoneGroq,
    },
    gemini: geminiList[0] || null,
    geminiModels: geminiList,
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
}
