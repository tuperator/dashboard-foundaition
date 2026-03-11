const TASK_MANAGEMENT_SERVICE_PREFIX = "/task-management-service";

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
  companies: {
    me: "/api/v1/companies/me",
  },
  taskManagement: {
    projects: {
      list: `${TASK_MANAGEMENT_SERVICE_PREFIX}/api/v1/projects`,
      byId: (projectId: string) =>
        `${TASK_MANAGEMENT_SERVICE_PREFIX}/api/v1/projects/${projectId}`,
      members: (projectId: string) =>
        `${TASK_MANAGEMENT_SERVICE_PREFIX}/api/v1/projects/${projectId}/members`,
    },
    tasks: {
      list: `${TASK_MANAGEMENT_SERVICE_PREFIX}/api/v1/tasks`,
      byId: (taskId: string) =>
        `${TASK_MANAGEMENT_SERVICE_PREFIX}/api/v1/tasks/${taskId}`,
    },
    workflows: {
      list: `${TASK_MANAGEMENT_SERVICE_PREFIX}/api/v1/workflows`,
      byId: (workflowId: string) =>
        `${TASK_MANAGEMENT_SERVICE_PREFIX}/api/v1/workflows/${workflowId}`,
      statuses: (workflowId: string) =>
        `${TASK_MANAGEMENT_SERVICE_PREFIX}/api/v1/workflows/${workflowId}/statuses`,
      statusById: (workflowId: string, statusId: string) =>
        `${TASK_MANAGEMENT_SERVICE_PREFIX}/api/v1/workflows/${workflowId}/statuses/${statusId}`,
      transitions: (workflowId: string) =>
        `${TASK_MANAGEMENT_SERVICE_PREFIX}/api/v1/workflows/${workflowId}/transitions`,
      transitionById: (workflowId: string, transitionId: string) =>
        `${TASK_MANAGEMENT_SERVICE_PREFIX}/api/v1/workflows/${workflowId}/transitions/${transitionId}`,
      projects: (workflowId: string) =>
        `${TASK_MANAGEMENT_SERVICE_PREFIX}/api/v1/workflows/${workflowId}/projects`,
    },
  },
} as const;
