import {
  translate,
  type Locale,
  type TranslationKey,
} from "@/shared/i18n/messages";
import { getCurrentLocale } from "@/shared/i18n/store";

const API_ERROR_KEY_BY_CODE: Record<string, TranslationKey> = {
  AUTH_INVALID_CREDENTIALS: "api.error.AUTH_INVALID_CREDENTIALS",
  AUTH_ACCESS_TOKEN_EXPIRED: "api.error.AUTH_ACCESS_TOKEN_EXPIRED",
  AUTH_REFRESH_TOKEN_EXPIRED: "api.error.AUTH_REFRESH_TOKEN_EXPIRED",
  AUTH_INVALID_REFRESH_TOKEN: "api.error.AUTH_INVALID_REFRESH_TOKEN",
  AUTH_ACCOUNT_LOCKED: "api.error.AUTH_ACCOUNT_LOCKED",
  AUTH_ACCOUNT_INACTIVE: "api.error.AUTH_ACCOUNT_INACTIVE",
  AUTH_FORBIDDEN: "api.error.AUTH_FORBIDDEN",
};

export function getApiErrorMessage(code?: string, status?: number) {
  const locale: Locale = getCurrentLocale();

  if (code && API_ERROR_KEY_BY_CODE[code]) {
    return translate(locale, API_ERROR_KEY_BY_CODE[code]);
  }

  if (status === 401) {
    return translate(locale, "api.error.status.401");
  }

  if (status === 403) {
    return translate(locale, "api.error.status.403");
  }

  if (status === 404) {
    return translate(locale, "api.error.status.404");
  }

  if (status === 409) {
    return translate(locale, "api.error.status.409");
  }

  if (status === 422) {
    return translate(locale, "api.error.status.422");
  }

  if (status && status >= 500) {
    return translate(locale, "api.error.status.5xx");
  }

  return translate(locale, "api.error.default");
}
