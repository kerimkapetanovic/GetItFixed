"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  defaultLocale,
  formatTranslation,
  getTranslationValue,
  localeStorageKey,
  type Locale,
} from "@/lib/i18n/translations";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "bs";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return defaultLocale;
    }

    const storedLocale = window.localStorage.getItem(localeStorageKey);
    if (isLocale(storedLocale)) {
      return storedLocale;
    }

    return window.navigator.language.toLowerCase().startsWith("bs")
      ? "bs"
      : defaultLocale;
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(localeStorageKey, locale);
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: (key, values) => formatTranslation(getTranslationValue(locale, key), values),
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}