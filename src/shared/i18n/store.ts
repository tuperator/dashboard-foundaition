import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "./messages";

let currentLocale: Locale = DEFAULT_LOCALE;

export function resolveInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (savedLocale && isLocale(savedLocale)) {
    return savedLocale;
  }

  const browserLanguage = window.navigator.language.toLowerCase();
  if (browserLanguage.startsWith("vi")) {
    return "vi";
  }

  return "en";
}

export function getCurrentLocale() {
  return currentLocale;
}

export function setCurrentLocale(locale: Locale) {
  currentLocale = locale;
}
