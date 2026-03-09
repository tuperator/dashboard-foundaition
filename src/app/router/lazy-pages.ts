import { lazy } from "react";

export const DashboardPage = lazy(() =>
  import("@/pages/dashboard").then((module) => ({
    default: module.DashboardPage,
  })),
);

export const LoginPage = lazy(() =>
  import("@/pages/login").then((module) => ({ default: module.LoginPage })),
);

export const SettingsPage = lazy(() =>
  import("@/pages/settings").then((module) => ({
    default: module.SettingsPage,
  })),
);

export const UserManagementPage = lazy(() =>
  import("@/pages/user-management").then((module) => ({
    default: module.UserManagementPage,
  })),
);

export const TaskProjectsPage = lazy(() =>
  import("@/pages/task-manager").then((module) => ({
    default: module.TaskProjectsPage,
  })),
);

export const TaskProjectDetailsPage = lazy(() =>
  import("@/pages/task-manager").then((module) => ({
    default: module.TaskProjectDetailsPage,
  })),
);

export const TaskWorkflowManagerPage = lazy(() =>
  import("@/pages/task-manager").then((module) => ({
    default: module.TaskWorkflowManagerPage,
  })),
);

export const RoleManagementPage = lazy(() =>
  import("@/pages/role-management").then((module) => ({
    default: module.RoleManagementPage,
  })),
);

export const BranchManagementPage = lazy(() =>
  import("@/pages/branch-management").then((module) => ({
    default: module.BranchManagementPage,
  })),
);

export const CompanyManagementPage = lazy(() =>
  import("@/pages/company-management").then((module) => ({
    default: module.CompanyManagementPage,
  })),
);

export const NotFoundPage = lazy(() =>
  import("@/pages/not-found").then((module) => ({
    default: module.NotFoundPage,
  })),
);
