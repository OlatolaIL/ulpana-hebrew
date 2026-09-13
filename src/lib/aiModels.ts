/** Model IDs are deployment configuration, never supplied by the browser. */
export function resolveAiKeys(provider: string, customKey?: unknown) {
  const key = typeof customKey === 'string' ? customKey.trim() : '';
  return {
    groqKey: provider === 'groq' && key ? key : (process.env.GROQ_API_KEY || '').trim(),
    geminiKey: provider === 'gemini' && key ? key : (process.env.GEMINI_API_KEY || '').trim(),
  };
}

export function groqModels(): string[] {
  return [...new Set([
    process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-120b',
    process.env.GROQ_FALLBACK_MODEL?.trim(),
  ].filter((model): model is string => Boolean(model)))].slice(0, 2);
}

export function geminiModel(): string {
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
  if (!/^[a-zA-Z0-9._-]+$/.test(model)) throw new Error('Invalid Gemini model configuration');
  return model;
}
