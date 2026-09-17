export type AiTaskType = 'essay' | 'phone' | 'chat' | 'lookup' | 'conjugate' | 'debrief' | 'dialogue';

/** Model IDs are deployment configuration, never supplied by the browser. */
export function resolveAiKeys(provider: string, customKey?: unknown) {
  const key = typeof customKey === 'string' ? customKey.trim() : '';
  return {
    groqKey: provider === 'groq' && key ? key : (process.env.GROQ_API_KEY || '').trim(),
    geminiKey: provider === 'gemini' && key ? key : (process.env.GEMINI_API_KEY || '').trim(),
  };
}

export function groqModels(task: AiTaskType = 'chat'): string[] {
  if (task === 'dialogue') {
    const primary = process.env.GROQ_MODEL?.trim() || 'qwen/qwen3.8-27b';
    const fallback = process.env.GROQ_FALLBACK_MODEL?.trim();
    const list = [
      primary,
      fallback,
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
    ].filter((model): model is string => Boolean(model));
    return [...new Set(list)].slice(0, 3);
  }
  const primary =
    process.env.GROQ_MODEL?.trim() ||
    (task === 'essay' ? 'openai/gpt-oss-120b' : 'qwen/qwen3.8-27b');
  const fallback =
    process.env.GROQ_FALLBACK_MODEL?.trim() ||
    (task === 'essay'
      ? 'qwen/qwen3.8-27b'
      : task === 'debrief'
        ? 'openai/gpt-oss-120b'
        : undefined);
  return [...new Set([primary, fallback].filter((model): model is string => Boolean(model)))].slice(0, 2);
}

export function geminiModels(task: AiTaskType = 'chat'): string[] {
  const primary =
    process.env.GEMINI_MODEL?.trim() ||
    (task === 'essay' ? 'gemini-3.6-flash' : 'gemini-3.5-flash-lite');
  const fallback = process.env.GEMINI_FALLBACK_MODEL?.trim();
  return [...new Set([primary, fallback].filter((model): model is string => Boolean(model)))].slice(0, 2);
}

export function geminiModel(task: AiTaskType = 'chat'): string {
  const list = geminiModels(task);
  const selected = list[0] || 'gemini-3.6-flash';
  if (!/^[a-zA-Z0-9._-]+$/.test(selected)) throw new Error('Invalid Gemini model configuration');
  return selected;
}

