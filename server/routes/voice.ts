/**
 * Voice API Routes for RusingAcademy SLE AI Companion
 * Multi-Coach Voice System with MiniMax TTS and OpenAI Whisper STT
 * 
 * Uses axios for API calls (no openai SDK dependency)
 */

import { Router, Request, Response } from "express";
import axios from "axios";
import multer from "multer";
import fs from "fs";
import path from "path";
import FormData from "form-data";

const router = Router();

// Multer configuration for audio file uploads
const upload = multer({
  dest: "/tmp/voice-uploads/",
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

// Voice Coach Configuration
const VOICE_COACHES: Record<string, {
  id: string;
  name: string;
  voiceId: string;
  languages: string[];
  specialty: string;
  languageBoost: string;
  systemPrompt: string;
}> = {
  "prof-steven": {
    id: "prof-steven",
    name: "Coach Steven",
    voiceId: process.env.STEVEN_VOICE_ID || "moss_audio_b813fbba-c1d2-11f0-a527-aab150a40f84",
    languages: ["fr"],
    specialty: "SLE French Oral Expression",
    languageBoost: "French",
    systemPrompt: `Tu es Steven, coach de français langue seconde spécialisé dans la préparation aux Examens de langue seconde (ELS) de la Commission de la fonction publique du Canada. Tu parles UNIQUEMENT en français. Tu aides les apprenants à atteindre le niveau C à l'oral. Garde tes réponses concises pour la conversation vocale. Sois encourageant, professionnel et bienveillant.`,
  },
  "coach-preciosa": {
    id: "coach-preciosa",
    name: "Coach Preciosa",
    voiceId: process.env.PRECIOSA_VOICE_ID || "moss_audio_a784f0fe-f448-11f0-9e6a-0a02ecbdcfa7",
    languages: ["en"],
    specialty: "SLE English Oral Expression",
    languageBoost: "English",
    systemPrompt: `You are Preciosa, an English as a Second Language coach specializing in Second Language Evaluation (SLE) exam preparation for the Canadian Public Service Commission. You speak ONLY in English. You help learners achieve Level C in oral proficiency. Keep responses concise for voice conversation. Be encouraging, professional, and supportive.`,
  },
};

/**
 * Helper function to transcribe audio using OpenAI Whisper API via axios
 */
async function transcribeAudio(audioPath: string, language?: string): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const formData = new FormData();
  formData.append("file", fs.createReadStream(audioPath));
  formData.append("model", "whisper-1");
  if (language) {
    formData.append("language", language);
  }

  const response = await axios.post(
    "https://api.openai.com/v1/audio/transcriptions",
    formData,
    {
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        ...formData.getHeaders(),
      },
    }
  );

  return response.data.text;
}

/**
 * Helper function to generate AI chat response using OpenAI API via axios
 */
async function generateChatResponse(
  systemPrompt: string,
  userMessage: string,
  context?: string
): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  if (context) {
    messages.push({ role: "user", content: `Context: ${context}` });
  }

  messages.push({ role: "user", content: userMessage });

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o",
      messages,
      max_tokens: 300,
    },
    {
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0]?.message?.content || "I apologize, I couldn't generate a response.";
}

/**
 * GET /api/voice/coaches
 * Returns list of available voice coaches
 */
router.get("/coaches", (_req: Request, res: Response) => {
  const coaches = Object.values(VOICE_COACHES).map((coach) => ({
    id: coach.id,
    name: coach.name,
    languages: coach.languages,
    specialty: coach.specialty,
  }));
  res.json({ coaches });
});

/**
 * POST /api/voice/tts
 * Text-to-Speech using MiniMax API
 */
router.post("/tts", async (req: Request, res: Response) => {
  try {
    const { text, coachId = "prof-steven" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const coach = VOICE_COACHES[coachId];
    if (!coach) {
      return res.status(400).json({ error: "Invalid coach ID" });
    }

    const apiKey = process.env.MINIMAX_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "MiniMax API not configured (MINIMAX_API_KEY missing)" });
    }

    // Call MiniMax TTS API (api.minimax.io v1 — no GroupId needed)
    const response = await fetch(
      `https://api.minimax.io/v1/t2a_v2`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "speech-2.8-hd",
          text: text,
          stream: false,
          voice_setting: {
            voice_id: coach.voiceId,
            speed: 1.0,
            vol: 1.2,
            pitch: 0,
          },
          audio_setting: {
            sample_rate: 32000,
            bitrate: 128000,
            format: "mp3",
            channel: 1,
          },
          language_boost: coach.languageBoost || "auto",
          output_format: "url",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MiniMax TTS error:", errorText);
      // FALLBACK: Return text with retry flag instead of a hard error
      return res.json({
        success: false,
        fallback: true,
        text,
        coachId: coach.id,
        coachName: coach.name,
        showRetry: true,
        error: `TTS generation failed (${response.status})`,
      });
    }

    const data: any = await response.json();

    // Handle both URL and hex output formats
    const audioUrl = data.data?.audio || data.audio_file;
    if (audioUrl) {
      res.json({
        success: true,
        fallback: false,
        audioUrl,
        coachId: coach.id,
        coachName: coach.name,
        showRetry: false,
      });
    } else {
      console.error("MiniMax TTS: no audio in response", JSON.stringify(data).slice(0, 500));
      // FALLBACK: Return text with retry flag instead of silence
      res.json({
        success: false,
        fallback: true,
        text,
        coachId: coach.id,
        coachName: coach.name,
        showRetry: true,
        error: "No audio generated by TTS service",
      });
    }
  } catch (error) {
    console.error("TTS error:", error);
    // FALLBACK: Never leave the user in silence
    const fallbackText = req.body?.text || "";
    res.json({
      success: false,
      fallback: true,
      text: fallbackText,
      showRetry: true,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

/**
 * POST /api/voice/stt
 * Speech-to-Text using OpenAI Whisper via axios
 */
router.post("/stt", upload.single("audio"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    const audioPath = req.file.path;

    // Transcribe using OpenAI Whisper via axios
    const text = await transcribeAudio(audioPath, req.body.language);

    // Clean up uploaded file
    fs.unlinkSync(audioPath);

    res.json({
      success: true,
      text,
    });
  } catch (error) {
    console.error("STT error:", error);
    res.status(500).json({ error: "Transcription failed" });
  }
});

/**
 * POST /api/voice/conversation
 * Full conversation endpoint: STT -> AI Response -> TTS
 */
router.post("/conversation", upload.single("audio"), async (req: Request, res: Response) => {
  try {
    const { coachId = "prof-steven", context = "" } = req.body;

    const coach = VOICE_COACHES[coachId];
    if (!coach) {
      return res.status(400).json({ error: "Invalid coach ID" });
    }

    let userText = req.body.text;

    // If audio file provided, transcribe it first
    if (req.file) {
      userText = await transcribeAudio(req.file.path);
      fs.unlinkSync(req.file.path);
    }

    if (!userText) {
      return res.status(400).json({ error: "No input provided" });
    }

    // Generate AI response using OpenAI via axios
    const aiResponse = await generateChatResponse(coach.systemPrompt, userText, context);

    // Generate TTS for the response
    const apiKey = process.env.MINIMAX_API_KEY;

    let audioUrl = null;

    if (apiKey) {
      const ttsResponse = await fetch(
        `https://api.minimax.io/v1/t2a_v2`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "speech-2.8-hd",
            text: aiResponse,
            stream: false,
            voice_setting: {
              voice_id: coach.voiceId,
              speed: 1.0,
              vol: 1.2,
              pitch: 0,
            },
            audio_setting: {
              sample_rate: 32000,
              bitrate: 128000,
              format: "mp3",
              channel: 1,
            },
            language_boost: coach.languageBoost || "auto",
            output_format: "url",
          }),
        }
      );

      if (ttsResponse.ok) {
        const ttsData: any = await ttsResponse.json();
        audioUrl = ttsData.data?.audio || ttsData.audio_file;
      }
    }

    res.json({
      success: true,
      userText,
      aiResponse,
      audioUrl,
      // FALLBACK: If TTS failed, provide text + retry flag
      fallback: !audioUrl,
      showRetry: !audioUrl,
      coachId: coach.id,
      coachName: coach.name,
    });
  } catch (error) {
    console.error("Conversation error:", error);
    // FALLBACK: Return partial result with text if AI succeeded but TTS failed
    const partialText = req.body?.text || "";
    res.json({
      success: false,
      fallback: true,
      userText: partialText,
      aiResponse: "",
      audioUrl: null,
      showRetry: true,
      error: error instanceof Error ? error.message : "Conversation failed",
    });
  }
});

export default router;
