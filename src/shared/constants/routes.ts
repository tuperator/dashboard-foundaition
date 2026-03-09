export const appRoutes = {
  dashboard: "/",
  login: "/login",
  settings: "/settings",
  users: "/users",
  tasksOverview: "/tasks",
  tasksProjects: "/tasks/projects",
  tasksWorkflows: "/tasks/workflows",
  tasksProjectDetails: "/tasks/projects/:projectId",
  roleGroups: "/role-groups",
  branches: "/branches",
  companyInfo: "/company",
} as const;

export function getTaskProjectDetailsRoute(projectId: string) {
  return `/tasks/projects/${projectId}`;
}
