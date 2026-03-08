export const API_ENDPOINTS = {
  auth: {
    login: "/api/v1/auth/login",
    refreshToken: "/api/v1/auth/refresh-token",
  },
  roles: {
    list: "/api/v1/roles",
  },
  users: {
    me: "/api/v1/users/me",
    byCompany: (companyId: string) => `/api/v1/users/company/${companyId}`,
    byId: (userId: string) => `/api/v1/users/${userId}`,
    password: (userId: string) => `/api/v1/users/${userId}/password`,
    status: (userId: string) => `/api/v1/users/${userId}/status`,
  },
  branches: {
    byCompany: (companyId: string) => `/api/v1/branches/company/${companyId}`,
    byId: (branchId: string) => `/api/v1/branches/${branchId}`,
    status: (branchId: string) => `/api/v1/branches/${branchId}/status`,
  },
} as const;
