/**
 * LanguageContext — Bilingual FR/EN i18n system for RusingÂcademy
 * Provides translation hooks and language toggle across the entire portal.
 * Persists preference to backend via tRPC.
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { en } from "@/i18n/en";
import { fr } from "@/i18n/fr";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type TranslationKey = string;

interface LanguageContextType {
  lang: "en" | "fr";
  setLang: (lang: "en" | "fr") => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  toggleLang: () => void;
}

const translations: Record<string, Record<string, unknown>> = { en, fr };

const LanguageContext = createContext<LanguageContextType | null>(null);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // fallback to key
    }
  }
  return typeof current === "string" ? current : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lang, setLangState] = useState<"en" | "fr">(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ra-lang");
      if (stored === "en" || stored === "fr") return stored;
    }
    return "en";
  });

  const updateLangMut = trpc.auth.me.useQuery(undefined, { enabled: false });

  // Sync from user preference on login
  useEffect(() => {
    if (user && "preferredLanguage" in user) {
      const pref = (user as { preferredLanguage?: string }).preferredLanguage;
      if (pref === "en" || pref === "fr") {
        setLangState(pref);
        localStorage.setItem("ra-lang", pref);
      }
    }
  }, [user]);

  const setLang = useCallback((newLang: "en" | "fr") => {
    setLangState(newLang);
    localStorage.setItem("ra-lang", newLang);
    document.documentElement.lang = newLang;
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "fr" : "en");
  }, [lang, setLang]);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let value = getNestedValue(translations[lang] as unknown as Record<string, unknown>, key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{{${k}}}`, String(v));
      });
    }
    return value;
  }, [lang]);

  // Set html lang attribute
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
