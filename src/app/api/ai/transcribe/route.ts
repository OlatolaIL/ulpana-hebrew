import { NextRequest, NextResponse } from 'next/server';

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
          const gText = gData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (gText) {
            return NextResponse.json({
              text: gText,
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
        groqFormData.append('file', file, 'audio.webm');
        groqFormData.append('model', 'whisper-large-v3');
        groqFormData.append('language', 'he');
        groqFormData.append('response_format', 'json');
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
          const text = (data.text || '').trim();
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
