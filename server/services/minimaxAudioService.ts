/**
 * MiniMax Audio Service
 * 
 * Generates French/English pronunciation audio using MiniMax T2A v2 HTTP API
 * for listening exercises and pronunciation guides in the learning platform.
 * 
 * Production-ready: Uses direct HTTP calls (no manus-mcp-cli dependency).
 * 
 * MiniMax T2A v2 API: https://platform.minimax.io/document/T2A%20V2
 * Voice Library: https://www.minimax.io/audio/voices
 */

import path from 'path';
import fs from 'fs/promises';
import https from 'https';
import http from 'http';

// ─── Voice Configuration ────────────────────────────────────────────────────

// High-Value French Voices from MiniMax
export const FRENCH_VOICES = {
  MALE_NARRATOR: 'French_MaleNarrator',
  LEVEL_HEADED_MAN: 'French_Male_Speech_New',
  CASUAL_MAN: 'French_CasualMan',
  FEMALE_ANCHOR: 'French_Female_News Anchor',
  MOVIE_LEAD_FEMALE: 'French_MovieLeadFemale',
  FEMALE_NEWS: 'French_FemaleAnchor',
} as const;

export const ENGLISH_VOICES = {
  COMPELLING_LADY: 'English_compelling_lady1',
  CAPTIVATING_FEMALE: 'English_captivating_female1',
  TRUSTWORTHY_MAN: 'English_Trustworth_Man',
  GENTLE_TEACHER: 'English_Gentle-voiced_man',
  EXPRESSIVE_NARRATOR: 'English_expressive_narrator',
  MAGNETIC_MALE: 'English_magnetic_voiced_man',
} as const;

export type FrenchVoice = typeof FRENCH_VOICES[keyof typeof FRENCH_VOICES];
export type EnglishVoice = typeof ENGLISH_VOICES[keyof typeof ENGLISH_VOICES];

// Cloned Coach Voices (personalized coaching)
// All 4 coaches have unique MiniMax cloned voice profiles
export const COACH_VOICES = {
  STEVEN: 'moss_audio_b813fbba-c1d2-11f0-a527-aab150a40f84',
  SUE_ANNE: 'moss_audio_2abcced5-f449-11f0-beb6-9609078c1ee2',
  ERIKA: 'moss_audio_738f5bca-f448-11f0-aff0-8af3c85499ec',
  PRECIOSA: 'moss_audio_a784f0fe-f448-11f0-9e6a-0a02ecbdcfa7',
} as const;

export type CoachVoice = typeof COACH_VOICES[keyof typeof COACH_VOICES];

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface AudioGenerationOptions {
  text: string;
  voiceId?: FrenchVoice | EnglishVoice | string;
  speed?: number;       // 0.5 to 2.0, default 1.0
  emotion?: 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised' | 'neutral';
  languageBoost?: 'French' | 'English' | 'auto';
  outputDirectory?: string;
  filename?: string;
}

export interface AudioGenerationResult {
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  remoteUrl?: string;
  error?: string;
  voiceUsed?: string;
}

// ─── MiniMax T2A v2 API Types ───────────────────────────────────────────────

interface MiniMaxT2AResponse {
  base_resp?: {
    status_code: number;
    status_msg: string;
  };
  data?: {
    audio?: string;       // URL when output_format is "url"
    status?: number;
  };
  extra_info?: {
    audio_length?: number;
    audio_sample_rate?: number;
    audio_size?: number;
    bitrate?: number;
    word_count?: number;
    usage_characters?: number;
  };
  // Legacy fields (older API versions)
  audio_file?: string;
}

// ─── Helper Functions ───────────────────────────────────────────────────────

/**
 * Download a file from URL to local path
 */
async function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const fsSync = require('fs');
    const file = fsSync.createWriteStream(destPath);
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response: any) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
          return;
        }
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err: Error) => {
      fsSync.unlink(destPath, () => {});
      reject(err);
    });
  });
}

/**
 * Call MiniMax T2A v2 API directly via HTTP
 */
async function callMiniMaxT2A(
  text: string,
  voiceId: string,
  speed: number = 1.0,
  languageBoost: string = 'auto',
): Promise<{ audioUrl?: string; error?: string }> {
  const apiKey = process.env.MINIMAX_API_KEY;

  if (!apiKey) {
    return { error: 'MINIMAX_API_KEY environment variable not configured' };
  }

  try {
    const response = await fetch('https://api.minimax.io/v1/t2a_v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'speech-2.8-hd',
        text,
        stream: false,
        voice_setting: {
          voice_id: voiceId,
          speed: speed,
          vol: 1.2,
          pitch: 0,
        },
        audio_setting: {
          sample_rate: 32000,
          bitrate: 128000,
          format: 'mp3',
          channel: 1,
        },
        language_boost: languageBoost,
        output_format: 'url',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax T2A API error:', response.status, errorText);
      return { error: `MiniMax API returned ${response.status}: ${errorText}` };
    }

    const data: MiniMaxT2AResponse = await response.json();

    // Check for API-level errors
    if (data.base_resp && data.base_resp.status_code !== 0) {
      return { error: `MiniMax error ${data.base_resp.status_code}: ${data.base_resp.status_msg}` };
    }

    // Extract audio URL (handle both new and legacy response formats)
    const audioUrl = data.data?.audio || data.audio_file;
    if (!audioUrl) {
      console.error('MiniMax T2A: no audio URL in response', JSON.stringify(data).slice(0, 500));
      return { error: 'No audio URL in MiniMax response' };
    }

    return { audioUrl };
  } catch (error) {
    console.error('MiniMax T2A API call failed:', error);
    return { error: error instanceof Error ? error.message : 'Unknown API error' };
  }
}

// ─── Main Audio Generation ──────────────────────────────────────────────────

/**
 * Generate audio using MiniMax T2A v2 API with high-value voices
 * 
 * This is the core function that all other generation functions delegate to.
 * Uses direct HTTP calls to MiniMax API (production-safe, no CLI dependency).
 */
export async function generateAudio(options: AudioGenerationOptions): Promise<AudioGenerationResult> {
  const {
    text,
    voiceId = FRENCH_VOICES.MALE_NARRATOR,
    speed = 1.0,
    languageBoost = 'French',
    outputDirectory,
    filename,
  } = options;

  try {
    // Call MiniMax T2A v2 API directly
    const { audioUrl, error } = await callMiniMaxT2A(text, voiceId, speed, languageBoost);

    if (error || !audioUrl) {
      return { success: false, error: error || 'No audio generated' };
    }

    // If outputDirectory is specified, download the file locally
    if (outputDirectory) {
      await fs.mkdir(outputDirectory, { recursive: true });

      const timestamp = Date.now();
      const localFilename = filename || `audio_${timestamp}.mp3`;
      const localPath = path.join(outputDirectory, localFilename);

      await downloadFile(audioUrl, localPath);

      const stats = await fs.stat(localPath);
      if (stats.size > 0) {
        // Generate public URL path (strip the public directory prefix)
        const publicUrl = localPath.includes('/client/public')
          ? localPath.replace(/.*\/client\/public/, '')
          : undefined;

        return {
          success: true,
          filePath: localPath,
          publicUrl,
          remoteUrl: audioUrl,
          voiceUsed: voiceId,
        };
      }

      return { success: false, error: 'Downloaded file is empty' };
    }

    // No local download needed - return remote URL only
    return {
      success: true,
      remoteUrl: audioUrl,
      voiceUsed: voiceId,
    };
  } catch (error) {
    console.error('MiniMax audio generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ─── Specialized Generation Functions ───────────────────────────────────────

/**
 * Generate French pronunciation guide audio
 */
export async function generateFrenchPronunciation(
  phrase: string,
  options?: {
    lessonId?: number;
    voiceGender?: 'male' | 'female';
    speed?: number;
    filename?: string;
  }
): Promise<AudioGenerationResult> {
  const voice = options?.voiceGender === 'female' 
    ? FRENCH_VOICES.FEMALE_ANCHOR 
    : FRENCH_VOICES.MALE_NARRATOR;
  
  const filename = options?.filename || 
    (options?.lessonId ? `lesson_${options.lessonId}_${Date.now()}.mp3` : undefined);
  
  return generateAudio({
    text: phrase,
    voiceId: voice,
    speed: options?.speed || 0.85,
    emotion: 'neutral',
    languageBoost: 'French',
    filename,
  });
}

/**
 * Generate listening comprehension audio
 */
export async function generateListeningExercise(
  text: string,
  options?: {
    exerciseId?: number;
    voiceGender?: 'male' | 'female';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    filename?: string;
  }
): Promise<AudioGenerationResult> {
  const voice = options?.voiceGender === 'female' 
    ? FRENCH_VOICES.MOVIE_LEAD_FEMALE
    : FRENCH_VOICES.LEVEL_HEADED_MAN;
  
  let speed = 1.0;
  if (options?.difficulty === 'beginner') speed = 0.85;
  else if (options?.difficulty === 'advanced') speed = 1.1;
  
  return generateAudio({
    text,
    voiceId: voice,
    speed,
    emotion: 'neutral',
    languageBoost: 'French',
    filename: options?.filename,
  });
}

/**
 * Generate conversation dialogue audio with alternating voices
 */
export async function generateDialogue(
  lines: Array<{ speaker: 'male' | 'female'; text: string }>,
  dialogueId: number
): Promise<{ results: AudioGenerationResult[]; success: boolean }> {
  const results: AudioGenerationResult[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const voice = line.speaker === 'male' 
      ? FRENCH_VOICES.CASUAL_MAN
      : FRENCH_VOICES.MOVIE_LEAD_FEMALE;
    
    const result = await generateAudio({
      text: line.text,
      voiceId: voice,
      speed: 1.0,
      emotion: 'neutral',
      languageBoost: 'French',
      filename: `dialogue_${dialogueId}_line_${i + 1}.mp3`,
    });
    
    results.push(result);
    
    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  const allSuccessful = results.every(r => r.success);
  return { results, success: allSuccessful };
}

/**
 * Generate English pronunciation for bilingual exercises
 */
export async function generateEnglishPronunciation(
  phrase: string,
  options?: {
    voiceGender?: 'male' | 'female';
    speed?: number;
    filename?: string;
  }
): Promise<AudioGenerationResult> {
  const voice = options?.voiceGender === 'female' 
    ? ENGLISH_VOICES.COMPELLING_LADY 
    : ENGLISH_VOICES.TRUSTWORTHY_MAN;
  
  return generateAudio({
    text: phrase,
    voiceId: voice,
    speed: options?.speed || 0.9,
    emotion: 'neutral',
    languageBoost: 'English',
    filename: options?.filename,
  });
}

/**
 * Generate SLE exam practice audio
 */
export async function generateSLEPracticeAudio(
  text: string,
  type: 'oral_comprehension' | 'oral_expression' | 'reading',
  level: 'A' | 'B' | 'C',
  filename?: string
): Promise<AudioGenerationResult> {
  const voice = FRENCH_VOICES.FEMALE_ANCHOR;
  
  let speed = 1.0;
  if (level === 'A') speed = 0.9;
  else if (level === 'C') speed = 1.05;
  
  return generateAudio({
    text,
    voiceId: voice,
    speed,
    emotion: 'neutral',
    languageBoost: 'French',
    filename: filename || `sle_${type}_${level}_${Date.now()}.mp3`,
  });
}

/**
 * Batch generate pronunciation audio for multiple phrases
 */
export async function batchGeneratePronunciation(
  phrases: Array<{ text: string; id: string }>,
  voiceGender: 'male' | 'female' = 'male'
): Promise<Map<string, AudioGenerationResult>> {
  const results = new Map<string, AudioGenerationResult>();
  
  for (const phrase of phrases) {
    const result = await generateFrenchPronunciation(phrase.text, {
      voiceGender,
      filename: `pronunciation_${phrase.id}.mp3`,
    });
    results.set(phrase.id, result);
    
    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

/**
 * Generate personalized coaching audio using cloned coach voices
 */
export async function generateCoachAudio(
  text: string,
  coachName: 'steven' | 'sue_anne' | 'erika' | 'preciosa',
  options?: {
    speed?: number;
    filename?: string;
  }
): Promise<AudioGenerationResult> {
  const voiceMap: Record<string, string> = {
    steven: COACH_VOICES.STEVEN,
    sue_anne: COACH_VOICES.SUE_ANNE,
    erika: COACH_VOICES.ERIKA,
    preciosa: COACH_VOICES.PRECIOSA,
  };
  
  // Determine language boost based on coach
  const languageBoost = coachName === 'preciosa' ? 'English' : 'French';
  
  return generateAudio({
    text,
    voiceId: voiceMap[coachName] || COACH_VOICES.STEVEN,
    speed: options?.speed || 1.0,
    emotion: 'neutral',
    languageBoost,
    filename: options?.filename,
  });
}

export default {
  generateAudio,
  generateFrenchPronunciation,
  generateListeningExercise,
  generateDialogue,
  generateEnglishPronunciation,
  generateSLEPracticeAudio,
  batchGeneratePronunciation,
  generateCoachAudio,
  FRENCH_VOICES,
  ENGLISH_VOICES,
  COACH_VOICES,
};
