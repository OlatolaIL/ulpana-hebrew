import { geminiModel, resolveAiKeys } from '@/lib/aiModels';
import { normalizeHebrewHomophones, isWhisperSilenceHallucination } from '@/lib/speechTranscription';
import { checkAiRequest, fetchAi, aiErrorResponse, AiRequestError } from '@/lib/aiRequest';
import { NextRequest, NextResponse } from 'next/server';
import { readBoundedForm } from '@/lib/requestBody';





export async function POST(req: NextRequest) {
  try {
    await checkAiRequest(req);
    if (Number(req.headers.get('content-length') || 0) > 10 * 1024 * 1024) throw new AiRequestError('Слишком большая запись.', 413);
    const formData = await readBoundedForm(req, 10 * 1024 * 1024);
    const file = formData.get('file') as Blob | File | null;
    const prompt = (formData.get('prompt') as string) || '';
    const customKey = (formData.get('apiKey') as string) || '';

    if (!(file instanceof Blob) || !file.type.startsWith('audio/') || file.size === 0 || file.size > 10 * 1024 * 1024 || prompt.length > 2000) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const provider = (formData.get('provider') as string) || 'groq';
    const { groqKey, geminiKey } = resolveAiKeys(provider, customKey);

    // 1. Если выбран Gemini и есть ключ — используем Gemini Transcribe
    if (provider === 'gemini' && geminiKey) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = file.type || 'audio/webm';

        const geminiRes = await fetchAi(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel()}:generateContent?key=${geminiKey}`,
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
                engine: 'Gemini (silence filtered)',
                filtered: true,
              });
            }
            return NextResponse.json({
              text,
              engine: 'Gemini',
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

        const groqRes = await fetchAi('https://api.groq.com/openai/v1/audio/transcriptions', {
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
          if (avgNoSpeechProb > 0.8 || (isHallucination && avgNoSpeechProb > 0.45)) {
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
  } catch (error: any) { return aiErrorResponse(error); }
}
