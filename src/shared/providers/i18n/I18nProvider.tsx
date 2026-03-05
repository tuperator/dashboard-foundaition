import * as React from "react";
import {
  LOCALE_STORAGE_KEY,
  isLocale,
  translate,
  type Locale,
  type TranslationKey,
} from "@/shared/i18n/messages";
import {
  resolveInitialLocale,
  setCurrentLocale,
} from "@/shared/i18n/store";

export type Translate = (key: TranslationKey) => string;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: React.PropsWithChildren) {
  const [locale, setLocaleState] = React.useState<Locale>(() => {
    const initialLocale = resolveInitialLocale();
    setCurrentLocale(initialLocale);
    return initialLocale;
  });

  React.useEffect(() => {
    setCurrentLocale(locale);
    document.documentElement.lang = locale;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = React.useCallback((nextLocale: Locale) => {
    if (!isLocale(nextLocale)) {
      return;
    }

    setLocaleState(nextLocale);
  }, []);

  const t = React.useCallback<Translate>(
    (key) => translate(locale, key),
    [locale],
  );

  const value = React.useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}
