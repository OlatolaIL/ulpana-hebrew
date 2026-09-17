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
  const debriefGroq = groqModels('debrief');
  const geminiList = geminiModels('essay');

  return NextResponse.json({
    status: 'ok',
    groq: {
      primary: essayGroq[0] || null,
      fallback: essayGroq[1] || null,
      essay: essayGroq,
      phone: phoneGroq,
      debrief: debriefGroq,
    },
    gemini: geminiList[0] || null,
    geminiModels: geminiList,
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_PRIMARY_API_KEY || process.env.GEMINI_AI_STUDIO_KEY || process.env.GEMINI_API_KEY),
    geminiPrimaryConfigured: Boolean(process.env.GEMINI_PRIMARY_API_KEY || process.env.GEMINI_AI_STUDIO_KEY),
    geminiFallbackConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
}
