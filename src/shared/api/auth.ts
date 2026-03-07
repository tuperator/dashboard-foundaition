import { API_KEY } from "./config";
import { API_ENDPOINTS } from "./endpoints";
import { apiClient } from "./http";
import type { ApiEnvelope } from "./http";

export type AuthTokenData = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: string;
  accountId: string;
  email: string;
  username: string;
  status: string;
  roles: string[];
};

export const LOGIN_ENDPOINT = API_ENDPOINTS.auth.login;
export const REFRESH_TOKEN_ENDPOINT = API_ENDPOINTS.auth.refreshToken;

export async function login(payload: { email: string; password: string }) {
  const response = await apiClient.post<ApiEnvelope<AuthTokenData>>(
    LOGIN_ENDPOINT,
    payload,
    {
      skipAuth: true,
      skipAutoRefresh: true,
    },
  );

  return response.data;
}

export async function refreshToken(payload: { refreshToken: string }) {
  const apiKeyHeader: Record<string, string> | undefined = API_KEY
    ? { "X-API-Key": API_KEY }
    : undefined;

  const response = await apiClient.post<ApiEnvelope<AuthTokenData>>(
    REFRESH_TOKEN_ENDPOINT,
    payload,
    {
      headers: apiKeyHeader,
      skipAuth: true,
      skipAutoRefresh: true,
    },
  );

  return response.data;
}
