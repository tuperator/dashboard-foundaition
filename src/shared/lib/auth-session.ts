import type { AuthTokenData } from "@/shared/api/auth";

const AUTH_SESSION_KEY = "auth-session";

export type AuthSession = AuthTokenData & {
  rememberMe: boolean;
};

function parseSession(raw: string | null): AuthSession | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

function getPersistentSession() {
  if (typeof window === "undefined") {
    return null;
  }

  return parseSession(window.localStorage.getItem(AUTH_SESSION_KEY));
}

function getTemporarySession() {
  if (typeof window === "undefined") {
    return null;
  }

  return parseSession(window.sessionStorage.getItem(AUTH_SESSION_KEY));
}

export function getAuthSession() {
  return getPersistentSession() ?? getTemporarySession();
}

export function saveAuthSession(data: AuthTokenData, rememberMe: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  const session: AuthSession = { ...data, rememberMe };
  const serialized = JSON.stringify(session);

  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);

  if (rememberMe) {
    window.localStorage.setItem(AUTH_SESSION_KEY, serialized);
    return;
  }

  window.sessionStorage.setItem(AUTH_SESSION_KEY, serialized);
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
}

export function hasValidAccessToken(session: AuthSession | null) {
  if (!session?.accessToken) {
    return false;
  }

  const expirationTime = Date.parse(session.expiresAt);
  if (Number.isNaN(expirationTime)) {
    return true;
  }

  return expirationTime - Date.now() > 30_000;
}
