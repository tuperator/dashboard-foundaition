import type { RouteObject } from "react-router-dom";
import type { TranslationKey } from "@/shared/i18n/messages";
import { appRoutes } from "@/shared/constants/routes";
import {
  BranchManagementPage,
  CompanyManagementPage,
  ManagementPlaceholderPage,
  RoleManagementPage,
  UserManagementPage,
} from "../lazy-pages";
import { withProtectedRoute } from "../route-wrappers";

export const managementRoutes: RouteObject[] = [
  {
    path: appRoutes.users,
    element: withProtectedRoute(<UserManagementPage />),
  },
  createPlaceholderRoute(
    appRoutes.tasksOverview,
    "tasks.title",
    "tasks.description",
  ),
  createPlaceholderRoute(
    appRoutes.tasksBoard,
    "tasks.board.title",
    "tasks.board.description",
  ),
  createPlaceholderRoute(
    appRoutes.tasksCalendar,
    "tasks.calendar.title",
    "tasks.calendar.description",
  ),
  createPlaceholderRoute(
    appRoutes.tasksBacklog,
    "tasks.backlog.title",
    "tasks.backlog.description",
  ),
  {
    path: appRoutes.roleGroups,
    element: withProtectedRoute(<RoleManagementPage />),
  },
  {
    path: appRoutes.branches,
    element: withProtectedRoute(<BranchManagementPage />),
  },
  {
    path: appRoutes.companyInfo,
    element: withProtectedRoute(<CompanyManagementPage />),
  },
];

function createPlaceholderRoute(
  path: string,
  titleKey: TranslationKey,
  descriptionKey: TranslationKey,
): RouteObject {
  return {
    path,
    element: withProtectedRoute(
      <ManagementPlaceholderPage
        titleKey={titleKey}
        descriptionKey={descriptionKey}
      />,
    ),
  };
}
