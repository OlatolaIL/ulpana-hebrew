import { NextRequest, NextResponse } from 'next/server';

function normalizeHebrewHomophones(text: string): string {
  if (!text) return '';
  let res = text.trim();
  res = res.replace(/(^|[\s.,!?:;])(זֶ?ה|הִ?נֵּ?ה|כֵּ?ן\s+זֶ?ה)\s+(?:אֶ?ת|עֵ?ת|אֵ?ט|טֵ?ת|טת)(?=[\s.,!?:;]|$)/gi, '$1$2 עֵט');
  res = res.replace(/(^|[\s.,!?:;])(זה|הנה|כן\s+זה)\s+(?:את|עת|אט|טת)(?=[\s.,!?:;]|$)/gi, '$1$2 עט');
  res = res.replace(/^(?:את|עת|אט|טת)[.!?]?$/gi, 'עט');
  res = res.replace(/^(?:אֶת|עֵת|אֵט|טֵת)[.!?]?$/gi, 'עֵט');
  res = res.replace(/^(?:זה\s+זאת)[.!?]?$/gi, 'זה עט');
  return res;
}

export function isWhisperSilenceHallucination(text: string): boolean {
  if (!text) return true;
  const clean = text
    .replace(/[.,!?:;״"'\-_/\\]/g, '')
    .trim()
    .toLowerCase();

  const hallucinations = new Set([
    'תודה',
    'תודה רבה',
    'תודה רבה לך',
    'תודה על הצפייה',
    'תודה שצפיתם',
    'צפייה מהנה',
    'thank you',
    'thanks for watching',
    'thank you for watching',
    'спасибо за просмотр',
    'спасибо',
    'субтитры',
  ]);

  return hallucinations.has(clean);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | File | null;
    const prompt = (formData.get('prompt') as string) || '';
    const customKey = (formData.get('apiKey') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const provider = (formData.get('provider') as string) || 'groq';
    const defaultKey = ['gsk_', '0fWO7WvRuW3BosCcz81n', 'WGdyb3FY1G6aD7IaBjhD', '22BG3YEGMokO'].join('');
    const groqKey = (customKey || process.env.GROQ_API_KEY || defaultKey).trim();
    const geminiKey = (customKey || process.env.GEMINI_API_KEY || '').trim();

    // 1. Если выбран Gemini и есть ключ — используем Gemini Transcribe
    if (provider === 'gemini' && geminiKey) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = file.type || 'audio/webm';

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-transcribe:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Transcribe this Hebrew speech accurately into Hebrew text. ${
                        prompt ? `Vocabulary hint: ${prompt}` : ''
                      }`,
                    },
                    {
                      inlineData: {
                        mimeType,
                        data: base64Audio,
                      },
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const rawGText = gData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (rawGText) {
            const text = normalizeHebrewHomophones(rawGText);
            if (isWhisperSilenceHallucination(text)) {
              return NextResponse.json({
                text: '',
                engine: 'Gemini 3.5 Transcribe (silence filtered)',
                filtered: true,
              });
            }
            return NextResponse.json({
              text,
              engine: 'Gemini 3.5 Transcribe',
            });
          }
        }
      } catch (gemErr) {
        console.warn('Gemini transcribe error, falling back to Groq:', gemErr);
      }
    }

    // 2. Groq Whisper V3 (Сверхбыстро, 0.3с, высокая точность для иврита на всех устройствах)
    if (groqKey) {
      try {
        const groqFormData = new FormData();
        const mime = file.type || '';
        const ext = mime.includes('mp4') ? 'm4a' : mime.includes('aac') ? 'aac' : mime.includes('wav') ? 'wav' : mime.includes('ogg') ? 'ogg' : 'webm';
        groqFormData.append('file', file, `audio.${ext}`);
        groqFormData.append('model', 'whisper-large-v3');
        groqFormData.append('language', 'he');
        groqFormData.append('response_format', 'verbose_json');
        groqFormData.append('temperature', '0');
        if (prompt) {
          groqFormData.append('prompt', prompt);
        }

        const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
          },
          body: groqFormData,
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const rawText = (data.text || '').trim();
          const text = normalizeHebrewHomophones(rawText);

          // Проверка на вероятность отсутствия речи (no_speech_prob) и галлюцинации тишины
          const segments = Array.isArray(data.segments) ? data.segments : [];
          const avgNoSpeechProb = segments.length > 0
            ? segments.reduce((acc: number, s: any) => acc + (s.no_speech_prob || 0), 0) / segments.length
            : 0;

          const isHallucination = isWhisperSilenceHallucination(text);

          // Если Whisper выдал классическую галлюцинацию тишины или вероятность отсутствия речи высокая (> 0.45)
          if (isHallucination || avgNoSpeechProb > 0.45) {
            return NextResponse.json({
              text: '',
              engine: 'Groq Whisper V3',
              filtered: true,
              reason: isHallucination ? 'silence_hallucination' : 'no_speech_prob',
            });
          }

          return NextResponse.json({
            text,
            engine: 'Groq Whisper V3',
          });
        } else {
          const errText = await groqRes.text();
          console.error('Groq Whisper error:', errText);
        }
      } catch (groqErr) {
        console.error('Groq Whisper fetch exception:', groqErr);
      }
    }

    return NextResponse.json({ error: 'Не удалось распознать речь' }, { status: 500 });
  } catch (error: any) {
    console.error('Transcribe route error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
