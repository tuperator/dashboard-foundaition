import {
  apiMessages,
  appMessages,
  authMessages,
  branchesMessages,
  companyMessages,
  commonMessages,
  managementMessages,
  rolesMessages,
  settingsMessages,
  sidebarMessages,
  taskManagerMessages,
  usersMessages,
} from "./dictionaries";

export type Locale = "vi" | "en";

export const DEFAULT_LOCALE: Locale = "vi";
export const LOCALE_STORAGE_KEY = "app-locale";

const VI_MESSAGES = {
  ...commonMessages.vi,
  ...authMessages.vi,
  ...apiMessages.vi,
  ...branchesMessages.vi,
  ...companyMessages.vi,
  ...rolesMessages.vi,
  ...appMessages.vi,
  ...settingsMessages.vi,
  ...sidebarMessages.vi,
  ...usersMessages.vi,
  ...managementMessages.vi,
  ...taskManagerMessages.vi,
};

const EN_MESSAGES: Record<keyof typeof VI_MESSAGES, string> = {
  ...commonMessages.en,
  ...authMessages.en,
  ...apiMessages.en,
  ...branchesMessages.en,
  ...companyMessages.en,
  ...rolesMessages.en,
  ...appMessages.en,
  ...settingsMessages.en,
  ...sidebarMessages.en,
  ...usersMessages.en,
  ...managementMessages.en,
  ...taskManagerMessages.en,
};

export const TRANSLATIONS = {
  vi: VI_MESSAGES,
  en: EN_MESSAGES,
} as const;

export type TranslationKey = keyof (typeof TRANSLATIONS)["vi"];

export function isLocale(value: string): value is Locale {
  return value === "vi" || value === "en";
}

export function translate(locale: Locale, key: TranslationKey) {
  return TRANSLATIONS[locale][key] || TRANSLATIONS[DEFAULT_LOCALE][key];
}

export function translateWithParams(
  locale: Locale,
  key: TranslationKey,
  params: Record<string, string | number>,
) {
  let message = String(translate(locale, key));
  for (const [name, value] of Object.entries(params)) {
    message = message.replaceAll(`{${name}}`, String(value));
  }
  return message;
}
