import { lazy } from "react";

export const DashboardPage = lazy(() =>
  import("@/pages/dashboard").then((module) => ({ default: module.DashboardPage })),
);

export const LoginPage = lazy(() =>
  import("@/pages/login").then((module) => ({ default: module.LoginPage })),
);

export const SettingsPage = lazy(() =>
  import("@/pages/settings").then((module) => ({ default: module.SettingsPage })),
);

export const UserManagementPage = lazy(() =>
  import("@/pages/user-management").then((module) => ({
    default: module.UserManagementPage,
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

export const ManagementPlaceholderPage = lazy(() =>
  import("@/pages/management-placeholder").then((module) => ({
    default: module.ManagementPlaceholderPage,
  })),
);

export const NotFoundPage = lazy(() =>
  import("@/pages/not-found").then((module) => ({ default: module.NotFoundPage })),
);
