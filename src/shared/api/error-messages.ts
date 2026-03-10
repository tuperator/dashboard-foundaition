import {
  translate,
  type Locale,
  type TranslationKey,
} from "@/shared/i18n/messages";
import { getCurrentLocale } from "@/shared/i18n/store";

const API_ERROR_KEY_BY_CODE: Record<string, TranslationKey> = {
  TOKEN_INVALID: "api.error.TOKEN_INVALID",
  TOKEN_EXPIRED: "api.error.TOKEN_EXPIRED",
  TOKEN_NOT_YET_VALID: "api.error.TOKEN_NOT_YET_VALID",
  FORBIDDEN: "api.error.FORBIDDEN",
  COMPANY_ACCESS_DENIED: "api.error.COMPANY_ACCESS_DENIED",
  USER_CREATION_FORBIDDEN: "api.error.USER_CREATION_FORBIDDEN",
  USER_PROFILE_NOT_FOUND: "api.error.USER_PROFILE_NOT_FOUND",
  USER_ALREADY_EXISTS: "api.error.USER_ALREADY_EXISTS",
  BRANCH_NOT_FOUND: "api.error.BRANCH_NOT_FOUND",
  BRANCH_MANAGEMENT_FORBIDDEN: "api.error.BRANCH_MANAGEMENT_FORBIDDEN",
  COMPANY_PROFILE_NOT_FOUND: "api.error.COMPANY_PROFILE_NOT_FOUND",
  COMPANY_PROFILE_UPDATE_FORBIDDEN:
    "api.error.COMPANY_PROFILE_UPDATE_FORBIDDEN",
  COMPANY_CODE_ALREADY_EXISTS: "api.error.COMPANY_CODE_ALREADY_EXISTS",
  ROLE_NOT_FOUND: "api.error.ROLE_NOT_FOUND",
  WORKFLOW_NOT_FOUND: "api.error.WORKFLOW_NOT_FOUND",
  WORKFLOW_NAME_ALREADY_EXISTS: "api.error.WORKFLOW_NAME_ALREADY_EXISTS",
  WORKFLOW_DELETE_FORBIDDEN: "api.error.WORKFLOW_DELETE_FORBIDDEN",
  WORKFLOW_LAST_TEMPLATE_DELETE_FORBIDDEN:
    "api.error.WORKFLOW_LAST_TEMPLATE_DELETE_FORBIDDEN",
  WORKFLOW_STATUS_NOT_FOUND: "api.error.WORKFLOW_STATUS_NOT_FOUND",
  WORKFLOW_STATUS_CODE_ALREADY_EXISTS:
    "api.error.WORKFLOW_STATUS_CODE_ALREADY_EXISTS",
  WORKFLOW_STATUS_DELETE_FORBIDDEN:
    "api.error.WORKFLOW_STATUS_DELETE_FORBIDDEN",
  WORKFLOW_TRANSITION_NOT_FOUND: "api.error.WORKFLOW_TRANSITION_NOT_FOUND",
  WORKFLOW_TRANSITION_ALREADY_EXISTS:
    "api.error.WORKFLOW_TRANSITION_ALREADY_EXISTS",
  WORKFLOW_PROJECT_ASSIGNMENT_INVALID:
    "api.error.WORKFLOW_PROJECT_ASSIGNMENT_INVALID",
  VALIDATION_ERROR: "api.error.VALIDATION_ERROR",
  REQUEST_BODY_INVALID: "api.error.REQUEST_BODY_INVALID",
  BAD_REQUEST: "api.error.BAD_REQUEST",
  INTERNAL_SERVER_ERROR: "api.error.INTERNAL_SERVER_ERROR",
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

  if (status === 400) {
    return translate(locale, "api.error.status.400");
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
