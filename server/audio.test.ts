import { describe, it, expect } from "vitest";
import {
  FRENCH_VOICES,
  ENGLISH_VOICES,
  COACH_VOICES,
} from "./services/minimaxAudioService";

describe("MiniMax Audio Service", () => {
  describe("Voice Constants", () => {
    it("should have French voices defined", () => {
      expect(FRENCH_VOICES.MALE_NARRATOR).toBe("French_MaleNarrator");
      expect(FRENCH_VOICES.FEMALE_ANCHOR).toBe("French_Female_News Anchor");
      expect(FRENCH_VOICES.LEVEL_HEADED_MAN).toBe("French_Male_Speech_New");
      expect(FRENCH_VOICES.CASUAL_MAN).toBe("French_CasualMan");
      expect(FRENCH_VOICES.MOVIE_LEAD_FEMALE).toBe("French_MovieLeadFemale");
      expect(FRENCH_VOICES.FEMALE_NEWS).toBe("French_FemaleAnchor");
    });

    it("should have English voices defined", () => {
      expect(ENGLISH_VOICES.COMPELLING_LADY).toBe("English_compelling_lady1");
      expect(ENGLISH_VOICES.TRUSTWORTHY_MAN).toBe("English_Trustworth_Man");
      expect(ENGLISH_VOICES.GENTLE_TEACHER).toBe("English_Gentle-voiced_man");
      expect(ENGLISH_VOICES.EXPRESSIVE_NARRATOR).toBe("English_expressive_narrator");
    });

    it("should have Coach voices defined with correct MiniMax IDs", () => {
      // Active coaches
      expect(COACH_VOICES.STEVEN).toBe("moss_audio_b813fbba-c1d2-11f0-a527-aab150a40f84");
      expect(COACH_VOICES.PRECIOSA).toBe("moss_audio_a784f0fe-f448-11f0-9e6a-0a02ecbdcfa7");
      // Legacy coaches redirect to Steven's voice
      expect(COACH_VOICES.SUE_ANNE).toBe(COACH_VOICES.STEVEN);
      expect(COACH_VOICES.ERIKA).toBe(COACH_VOICES.STEVEN);
    });
  });

  describe("Voice ID Format", () => {
    it("should have valid French voice IDs", () => {
      Object.values(FRENCH_VOICES).forEach((voiceId) => {
        expect(voiceId).toMatch(/^French_/);
        expect(voiceId.length).toBeGreaterThan(7);
      });
    });

    it("should have valid English voice IDs", () => {
      Object.values(ENGLISH_VOICES).forEach((voiceId) => {
        expect(voiceId).toMatch(/^English_/);
        expect(voiceId.length).toBeGreaterThan(8);
      });
    });

    it("should have valid Coach voice IDs (MiniMax format)", () => {
      Object.values(COACH_VOICES).forEach((voiceId) => {
        expect(voiceId).toMatch(/^moss_audio_[a-f0-9-]+$/);
      });
    });
  });
});
