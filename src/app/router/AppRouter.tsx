import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { BranchManagementPage } from "@/pages/branch-management";
import { DashboardPage } from "@/pages/dashboard";
import { LoginPage } from "@/pages/login";
import { ManagementPlaceholderPage } from "@/pages/management-placeholder";
import { NotFoundPage } from "@/pages/not-found";
import { SettingsPage } from "@/pages/settings";
import { UserManagementPage } from "@/pages/user-management";
import { appRoutes } from "@/shared/constants/routes";
import { RequireAuth } from "./RequireAuth";

const router = createBrowserRouter([
  {
    path: appRoutes.login,
    element: <LoginPage />,
  },
  {
    path: appRoutes.dashboard,
    element: (
      <RequireAuth>
        <DashboardPage />
      </RequireAuth>
    ),
  },
  {
    path: appRoutes.settings,
    element: (
      <RequireAuth>
        <SettingsPage />
      </RequireAuth>
    ),
  },
  {
    path: appRoutes.users,
    element: (
      <RequireAuth>
        <UserManagementPage />
      </RequireAuth>
    ),
  },
  {
    path: appRoutes.tasksOverview,
    element: (
      <RequireAuth>
        <ManagementPlaceholderPage
          titleKey="tasks.title"
          descriptionKey="tasks.description"
        />
      </RequireAuth>
    ),
  },
  {
    path: appRoutes.tasksBoard,
    element: (
      <RequireAuth>
        <ManagementPlaceholderPage
          titleKey="tasks.board.title"
          descriptionKey="tasks.board.description"
        />
      </RequireAuth>
    ),
  },
  {
    path: appRoutes.tasksCalendar,
    element: (
      <RequireAuth>
        <ManagementPlaceholderPage
          titleKey="tasks.calendar.title"
          descriptionKey="tasks.calendar.description"
        />
      </RequireAuth>
    ),
  },
  {
    path: appRoutes.tasksBacklog,
    element: (
      <RequireAuth>
        <ManagementPlaceholderPage
          titleKey="tasks.backlog.title"
          descriptionKey="tasks.backlog.description"
        />
      </RequireAuth>
    ),
  },
  {
    path: appRoutes.roleGroups,
    element: (
      <RequireAuth>
        <ManagementPlaceholderPage
          titleKey="roles.title"
          descriptionKey="roles.description"
        />
      </RequireAuth>
    ),
  },
  {
    path: appRoutes.branches,
    element: (
      <RequireAuth>
        <BranchManagementPage />
      </RequireAuth>
    ),
  },
  {
    path: appRoutes.companyInfo,
    element: (
      <RequireAuth>
        <ManagementPlaceholderPage
          titleKey="company.title"
          descriptionKey="company.description"
        />
      </RequireAuth>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
