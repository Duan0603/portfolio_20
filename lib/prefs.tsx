"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Lang } from "./data";

export type Colorway = "night" | "day";

type Prefs = {
  lang: Lang;
  colorway: Colorway;
  setLang: (l: Lang) => void;
  toggleColorway: () => void;
};

const PrefsContext = createContext<Prefs>({
  lang: "vi",
  colorway: "night",
  setLang: () => {},
  toggleColorway: () => {},
});

const read = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — the choice just lasts for this visit */
  }
};

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("vi");
  const [colorway, setColorway] = useState<Colorway>("night");

  // Pick up the stored choice; first-time visitors get their browser's language.
  useEffect(() => {
    const storedLang = read("lang");
    if (storedLang === "vi" || storedLang === "en") {
      setLangState(storedLang);
    } else if (!navigator.language.toLowerCase().startsWith("vi")) {
      setLangState("en");
    }
    if (read("colorway") === "day") setColorway("day");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (colorway === "day") {
      document.documentElement.dataset.colorway = "day";
    } else {
      delete document.documentElement.dataset.colorway;
    }
  }, [colorway]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    write("lang", l);
  }, []);

  const toggleColorway = useCallback(() => {
    setColorway((c) => {
      const next = c === "day" ? "night" : "day";
      write("colorway", next);
      return next;
    });
  }, []);

  return (
    <PrefsContext.Provider value={{ lang, colorway, setLang, toggleColorway }}>
      {children}
    </PrefsContext.Provider>
  );
}

export const usePrefs = () => useContext(PrefsContext);
