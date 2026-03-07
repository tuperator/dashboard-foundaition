import axios from "axios";
import { AxiosError, AxiosHeaders } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { clearAuthSession, getAuthSession, saveAuthSession } from "@/shared/lib/auth-session";
import { API_BASE_URL, API_KEY } from "./config";
import { API_ENDPOINTS } from "./endpoints";
import { getApiErrorMessage } from "./error-messages";

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    skipAutoRefresh?: boolean;
    _retry?: boolean;
  }
}

type RefreshTokenData = {
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

export type ApiEnvelope<TData> = {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
  method: string;
  requestId: string;
  traceId: string;
  data: TData;
};

export type ApiErrorDetail = {
  field: string;
  reason: string;
  rejectedValue: unknown;
};

export type ApiErrorResponse = {
  timestamp?: string;
  status?: number;
  error?: string;
  code?: string;
  message?: string;
  path?: string;
  method?: string;
  requestId?: string;
  traceId?: string;
  details?: ApiErrorDetail[];
};

type ApiClientErrorParams = {
  status: number;
  code?: string;
  details?: ApiErrorDetail[];
  backendMessage?: string;
};

const REFRESH_TOKEN_ENDPOINT = API_ENDPOINTS.auth.refreshToken;

export class ApiClientError extends Error {
  status: number;
  code: string;
  details: ApiErrorDetail[];
  backendMessage?: string;

  constructor({ status, code, details = [], backendMessage }: ApiClientErrorParams) {
    super(getApiErrorMessage(code, status));
    this.name = "ApiClientError";
    this.status = status;
    this.code = code || "API_ERROR";
    this.details = details;
    this.backendMessage = backendMessage;
  }
}

function setAuthorizationHeader(
  config: InternalAxiosRequestConfig,
  accessToken: string,
  tokenType = "Bearer",
) {
  const authValue = `${tokenType} ${accessToken}`.trim();
  const headers = AxiosHeaders.from(config.headers);
  headers.set("Authorization", authValue);
  config.headers = headers;
}

export function normalizeApiError(error: unknown) {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const payload = error.response?.data as ApiErrorResponse | undefined;
    const status = error.response?.status ?? 0;

    return new ApiClientError({
      status,
      code: payload?.code || (status === 0 ? "NETWORK_ERROR" : "API_ERROR"),
      details: payload?.details,
      backendMessage: payload?.message,
    });
  }

  return new ApiClientError({
    status: 0,
    code: "UNKNOWN_ERROR",
  });
}

const refreshHttpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<RefreshTokenData> | null = null;

async function refreshAccessToken() {
  const session = getAuthSession();
  if (!session?.refreshToken) {
    throw new ApiClientError({
      status: 401,
      code: "AUTH_INVALID_REFRESH_TOKEN",
    });
  }

  const headers: Record<string, string> = {};
  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  try {
    const response = await refreshHttpClient.post<ApiEnvelope<RefreshTokenData>>(
      REFRESH_TOKEN_ENDPOINT,
      {
        refreshToken: session.refreshToken,
      },
      {
        headers,
      },
    );

    saveAuthSession(response.data.data, session.rememberMe);
    return response.data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (config.skipAuth) {
    return config;
  }

  const session = getAuthSession();
  if (!session?.accessToken) {
    return config;
  }

  setAuthorizationHeader(config, session.accessToken, session.tokenType || "Bearer");
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const apiError = normalizeApiError(error);
    const originalRequest = error instanceof AxiosError ? error.config : undefined;

    const shouldAutoRefresh =
      !!originalRequest &&
      !originalRequest.skipAutoRefresh &&
      !originalRequest._retry &&
      apiError.status === 401 &&
      apiError.code === "AUTH_ACCESS_TOKEN_EXPIRED";

    if (!shouldAutoRefresh || !originalRequest) {
      return Promise.reject(apiError);
    }

    originalRequest._retry = true;

    try {
      refreshPromise =
        refreshPromise ||
        refreshAccessToken().finally(() => {
          refreshPromise = null;
        });

      const refreshedSession = await refreshPromise;
      setAuthorizationHeader(
        originalRequest,
        refreshedSession.accessToken,
        refreshedSession.tokenType || "Bearer",
      );

      return apiClient.request(originalRequest);
    } catch (refreshError) {
      clearAuthSession();
      return Promise.reject(normalizeApiError(refreshError));
    }
  },
);
