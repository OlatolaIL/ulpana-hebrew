import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { VERB_SENTENCES_DATA } from '@/data/verbSentencesData';
import { NOUN_DRILLS_DATA } from '@/data/drills/nounDrillsData';
import { ADJECTIVE_DRILLS_DATA } from '@/data/drills/adjectiveDrillsData';
import { PREPOSITION_DRILLS_DATA } from '@/data/drills/prepositionDrillsData';
import { MOM_DRILLS_DATA } from '@/data/drills/momDrillsData';
import { stripNikkud } from '@/lib/transcription';
import { normalizeSentenceKey } from '@/lib/speech';
import {
  getSentenceGenderInfo,
  SentenceGenderCategory,
} from '@/lib/drills/sentenceGenderAdapter';

export interface SentenceDrillItem {
  id: string;
  sentenceHe: string;
  sentencePlain: string;
  sentenceRu: string;
  sentenceTranscription?: string;
  category: 'verb' | 'noun' | 'adjective' | 'preposition' | 'mom';
  categoryRu: string;
  targetWord?: string;
  lessonTheme: string;
  minLesson: number;
  fileName: string;
  audioUrl: string;
  hasAudio: boolean;
  fileSizeBytes?: number;
  // Поля грамматического рода и голоса синтеза (R-17, Edge Neural TTS)
  genderCategory?: SentenceGenderCategory;
  isGenderSensitive?: boolean;
  defaultVoice?: 'he-IL-AvriNeural' | 'he-IL-HilaNeural';
  femaleVariant?: {
    sentenceHe: string;
    sentencePlain: string;
    sentenceTranscription?: string;
    fileName: string;
    audioUrl: string;
    hasAudio: boolean;
    fileSizeBytes?: number;
  };
}

export interface AudioSettings {
  sentenceAudioEngine: 'current' | 'google_cloud' | 'edge_neural' | 'gemini_3.5_tts';
  defaultVoiceMale?: string;
  defaultVoiceFemale?: string;
  lastUpdated: string;
}

const SENTENCES_DIR = path.resolve(process.cwd(), 'public/audio/sentences');
const MANIFEST_PATH = path.resolve(SENTENCES_DIR, 'manifest.json');
const SETTINGS_PATH = path.resolve(process.cwd(), 'src/data/audioSettings.json');

// Ensure directory exists
if (!fs.existsSync(SENTENCES_DIR)) {
  try {
    fs.mkdirSync(SENTENCES_DIR, { recursive: true });
  } catch {}
}

/**
 * Читает или инициализирует глобальные настройки движка озвучки
 */
export function getAudioSettings(): AudioSettings {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      const raw = fs.readFileSync(SETTINGS_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading audioSettings.json:', err);
  }
  return {
    sentenceAudioEngine: 'current',
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Сохраняет глобальные настройки движка озвучки
 */
export function saveAudioSettings(settings: Partial<AudioSettings>): AudioSettings {
  const current = getAudioSettings();
  const updated: AudioSettings = {
    ...current,
    ...settings,
    lastUpdated: new Date().toISOString(),
  };
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving audioSettings.json:', err);
  }
  return updated;
}

/**
 * Читает манифест готовых аудиофайлов предложений
 */
export function getSentencesManifest(): Record<string, string> {
  try {
    if (fs.existsSync(MANIFEST_PATH)) {
      const raw = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading manifest.json:', err);
  }
  return {};
}

/**
 * Сохраняет запись в манифест готовых аудиофайлов
 */
export function saveToSentencesManifest(key: string, fileName: string): void {
  try {
    const manifest = getSentencesManifest();
    manifest[key] = fileName;
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing manifest.json:', err);
  }
}

/**
 * Генерирует детерминированное коллизионно-безопасное имя файла для предложения на основе его нормализованного текста
 */
export function getSentenceAudioFileName(sentenceHe: string, isFemale: boolean = false): string {
  const normKey = normalizeSentenceKey(sentenceHe);
  const hash = crypto.createHash('md5').update(normKey).digest('hex').slice(0, 12);
  return isFemale ? `s_${hash}_f.mp3` : `s_${hash}.mp3`;
}

/**
 * Очищает ID предложения для безопасного имени файла
 */
export function sanitizeFileName(id: string): string {
  return `${id.replace(/[^a-zA-Z0-9_-]/g, '_')}.mp3`;
}

function buildSentenceItem(
  raw: {
    id: string;
    sentenceHe: string;
    sentenceRu: string;
    sentenceTranscription?: string;
    category: 'verb' | 'noun' | 'adjective' | 'preposition' | 'mom';
    categoryRu: string;
    targetWord?: string;
    lessonTheme: string;
    minLesson: number;
  },
  manifest: Record<string, string>
): SentenceDrillItem {
  const normKey = normalizeSentenceKey(raw.sentenceHe);
  const fileName = manifest[normKey] || getSentenceAudioFileName(raw.sentenceHe, false);
  const filePath = path.resolve(SENTENCES_DIR, fileName);
  const existsOnDisk = fs.existsSync(filePath);
  let sizeBytes = 0;
  if (existsOnDisk) {
    try {
      sizeBytes = fs.statSync(filePath).size;
    } catch {}
  }

  const genderInfo = getSentenceGenderInfo(raw.sentenceHe, raw.sentenceTranscription);
  let femaleVariant: SentenceDrillItem['femaleVariant'] = undefined;

  if (genderInfo.isGenderSensitive && genderInfo.femaleVariant) {
    const fHe = genderInfo.femaleVariant.sentenceHe;
    const fKey = `${normKey}::female`;
    const fFileName = manifest[fKey] || getSentenceAudioFileName(raw.sentenceHe, true);
    const fFilePath = path.resolve(SENTENCES_DIR, fFileName);
    const fExists = fs.existsSync(fFilePath);
    let fSize = 0;
    if (fExists) {
      try {
        fSize = fs.statSync(fFilePath).size;
      } catch {}
    }

    femaleVariant = {
      sentenceHe: fHe,
      sentencePlain: stripNikkud(fHe),
      sentenceTranscription: genderInfo.femaleVariant.sentenceTranscription,
      fileName: fFileName,
      audioUrl: `/audio/sentences/${fFileName}`,
      hasAudio: fExists,
      fileSizeBytes: fSize,
    };
  }

  return {
    id: raw.id,
    sentenceHe: raw.sentenceHe,
    sentencePlain: stripNikkud(raw.sentenceHe),
    sentenceRu: raw.sentenceRu,
    sentenceTranscription: raw.sentenceTranscription,
    category: raw.category,
    categoryRu: raw.categoryRu,
    targetWord: raw.targetWord,
    lessonTheme: raw.lessonTheme,
    minLesson: raw.minLesson,
    fileName,
    audioUrl: `/audio/sentences/${fileName}`,
    hasAudio: existsOnDisk,
    fileSizeBytes: sizeBytes,
    genderCategory: genderInfo.category,
    isGenderSensitive: genderInfo.isGenderSensitive,
    defaultVoice: genderInfo.defaultVoice,
    femaleVariant,
  };
}

/**
 * Собирает плоский список ВСЕХ предложений курса из 5 основных репозиториев Комплекса
 */
export function getAllSystemSentences(): SentenceDrillItem[] {
  const list: SentenceDrillItem[] = [];
  const manifest = getSentencesManifest();

  // 1. ГЛАГОЛЫ (VERB_SENTENCES_DATA)
  for (const [infinitive, group] of Object.entries(VERB_SENTENCES_DATA)) {
    if (!group?.sentences) continue;
    for (const s of group.sentences) {
      if (!s.sentenceHe) continue;
      list.push(
        buildSentenceItem(
          {
            id: s.id,
            sentenceHe: s.sentenceHe,
            sentenceRu: s.sentenceRu,
            sentenceTranscription: s.sentenceTranscription,
            category: 'verb',
            categoryRu: 'Глаголы',
            targetWord: s.verbInfinitive || infinitive,
            lessonTheme: s.lessonTheme || group.sourceLessonTitle || 'Глагольный тренажёр',
            minLesson: s.minLesson || group.sourceLessonId || 1,
          },
          manifest
        )
      );
    }
  }

  // 2. СУЩЕСТВИТЕЛЬНЫЕ (NOUN_DRILLS_DATA)
  for (const [word, item] of Object.entries(NOUN_DRILLS_DATA)) {
    if (!item?.sentenceHe) continue;
    list.push(
      buildSentenceItem(
        {
          id: item.id,
          sentenceHe: item.sentenceHe,
          sentenceRu: item.sentenceRu,
          sentenceTranscription: item.sentenceTranscription,
          category: 'noun',
          categoryRu: 'Существительные',
          targetWord: item.targetWordVocalized || word,
          lessonTheme: item.lessonTheme || 'Существительные',
          minLesson: item.minLesson || 1,
        },
        manifest
      )
    );
  }

  // 3. ПРИЛАГАТЕЛЬНЫЕ (ADJECTIVE_DRILLS_DATA)
  for (const [word, item] of Object.entries(ADJECTIVE_DRILLS_DATA)) {
    if (!item?.sentenceHe) continue;
    list.push(
      buildSentenceItem(
        {
          id: item.id,
          sentenceHe: item.sentenceHe,
          sentenceRu: item.sentenceRu,
          sentenceTranscription: item.sentenceTranscription,
          category: 'adjective',
          categoryRu: 'Прилагательные',
          targetWord: item.targetWordVocalized || word,
          lessonTheme: item.lessonTheme || 'Прилагательные',
          minLesson: item.minLesson || 1,
        },
        manifest
      )
    );
  }

  // 4. ПРЕДЛОГИ (PREPOSITION_DRILLS_DATA)
  for (const [word, item] of Object.entries(PREPOSITION_DRILLS_DATA)) {
    if (!item?.sentenceHe) continue;
    list.push(
      buildSentenceItem(
        {
          id: item.id,
          sentenceHe: item.sentenceHe,
          sentenceRu: item.sentenceRu,
          sentenceTranscription: item.sentenceTranscription,
          category: 'preposition',
          categoryRu: 'Предлоги',
          targetWord: item.targetWordVocalized || word,
          lessonTheme: item.lessonTheme || 'Предлоги',
          minLesson: item.minLesson || 1,
        },
        manifest
      )
    );
  }

  // 5. МАМЫ (MOM_DRILLS_DATA)
  for (const [word, item] of Object.entries(MOM_DRILLS_DATA)) {
    if (!item?.sentenceHe) continue;
    list.push(
      buildSentenceItem(
        {
          id: item.id,
          sentenceHe: item.sentenceHe,
          sentenceRu: item.sentenceRu,
          sentenceTranscription: item.sentenceTranscription,
          category: 'mom',
          categoryRu: 'Мамы в Израиле',
          targetWord: item.targetWordVocalized || word,
          lessonTheme: item.lessonTheme || 'Профессия: Мама',
          minLesson: item.minLesson || 0,
        },
        manifest
      )
    );
  }

  return list;
}

/**
 * Синтезирует аудиофайл для одного предложения через Google TTS и сохраняет его на диск.
 * Поддерживает как Google Cloud Text-to-Speech (Chirp/Neural2 при наличии OAuth-токена),
 * так и быстрый Google Translate TTS Web API (безлимитный и без авторизации).
 */
export async function synthesizeSentenceAudio(
  sentenceHe: string,
  destFileName: string
): Promise<{ success: boolean; bytes: number; error?: string }> {
  try {
    const destPath = path.resolve(SENTENCES_DIR, destFileName);
    const cleanText = stripNikkud(sentenceHe)
      .replace(/[؟？]/g, '?')
      .replace(/[！]/g, '!')
      .replace(/["'״׳()[\]{}—<>«»]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      return { success: false, bytes: 0, error: 'Empty text after cleaning' };
    }

    // 1. Попытка через Google Cloud Text-to-Speech (Chirp / Aoede), если передан токен
    const gcpToken = process.env.GCP_ACCESS_TOKEN;
    const gcpProjectId = process.env.GCP_PROJECT_ID || 'project-aebc6692-f6eb-4d2f-b1b';

    if (gcpToken) {
      try {
        const cloudUrl = 'https://texttospeech.googleapis.com/v1/text:synthesize';
        const payload = {
          input: { text: sentenceHe }, // Cloud TTS умеет читать с огласовками
          voice: { languageCode: 'he-IL', name: 'he-IL-Chirp3-HD-Aoede' },
          audioConfig: { audioEncoding: 'MP3' },
        };
        const cloudRes = await fetch(cloudUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${gcpToken}`,
            'x-goog-user-project': gcpProjectId,
          },
          body: JSON.stringify(payload),
        });
        if (cloudRes.ok) {
          const data = await cloudRes.json();
          if (data.audioContent) {
            const buf = Buffer.from(data.audioContent, 'base64');
            fs.writeFileSync(destPath, buf);
            // Регистрируем в манифесте
            saveToSentencesManifest(normalizeSentenceKey(sentenceHe), destFileName);
            return { success: true, bytes: buf.length };
          }
        }
      } catch (cloudErr) {
        console.warn('[AudioStudio] GCP Cloud TTS error, falling back to Google Translate TTS:', cloudErr);
      }
    }

    // 2. Основной надежный генератор Google TTS Web API (возвращает чистый audio/mpeg)
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=iw&client=tw-ob&q=${encodeURIComponent(
      cleanText
    )}`;
    const res = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!res.ok) {
      return { success: false, bytes: 0, error: `Google TTS responded with HTTP ${res.status}` };
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 100) {
      return { success: false, bytes: 0, error: 'Received invalid or empty audio buffer' };
    }

    fs.writeFileSync(destPath, buffer);

    // Регистрируем в манифесте по ключу нормализованного предложения
    saveToSentencesManifest(normalizeSentenceKey(sentenceHe), destFileName);

    return { success: true, bytes: buffer.length };
  } catch (err: any) {
    console.error('[AudioStudio] synthesizeSentenceAudio error:', err);
    return { success: false, bytes: 0, error: err?.message || 'Unknown error' };
  }
}

/**
 * Синтезирует аудиофайл предложения через нейросетевой Microsoft Edge Neural TTS.
 * Поддерживает чистый естественный иврит с огласовками без сбоев омографов:
 * ♂ he-IL-AvriNeural (мужской голос)
 * ♀ he-IL-HilaNeural (женский голос)
 */
export async function synthesizeSentenceAudioEdge(
  sentenceHe: string,
  destFileName: string,
  voice: 'he-IL-AvriNeural' | 'he-IL-HilaNeural' = 'he-IL-AvriNeural',
  isFemaleVariant: boolean = false
): Promise<{ success: boolean; bytes: number; error?: string }> {
  try {
    const destPath = path.resolve(SENTENCES_DIR, destFileName);
    // Для Microsoft Edge Neural TTS огласовки (никуд) сохраняем!
    // Движок читает огласованный текст с правильными гласными (роцэ vs роца).
    const cleanText = sentenceHe
      .replace(/[؟？]/g, '?')
      .replace(/[！]/g, '!')
      .replace(/["״׳«»]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      return { success: false, bytes: 0, error: 'Empty text for Edge TTS' };
    }

    const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const { audioStream } = tts.toStream(cleanText);
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    if (buffer.length < 100) {
      return { success: false, bytes: 0, error: 'Edge TTS returned empty audio buffer' };
    }

    fs.writeFileSync(destPath, buffer);

    const normKey = normalizeSentenceKey(sentenceHe);
    const manifestKey = isFemaleVariant ? `${normKey}::female` : normKey;
    saveToSentencesManifest(manifestKey, destFileName);

    return { success: true, bytes: buffer.length };
  } catch (err: any) {
    console.error('[AudioStudio] synthesizeSentenceAudioEdge error:', err);
    return { success: false, bytes: 0, error: err?.message || 'Edge TTS error' };
  }
}
