import { Navigate, type RouteObject } from "react-router-dom";
import { appRoutes } from "@/shared/constants/routes";
import {
  BranchManagementPage,
  CompanyManagementPage,
  RoleManagementPage,
  TaskProjectDetailsPage,
  TaskProjectsPage,
  TaskWorkflowManagerPage,
  UserManagementPage,
} from "../lazy-pages";
import { withProtectedRoute } from "../route-wrappers";

export const managementRoutes: RouteObject[] = [
  {
    path: appRoutes.users,
    element: withProtectedRoute(<UserManagementPage />),
  },
  {
    path: appRoutes.tasksOverview,
    element: withProtectedRoute(
      <Navigate to={appRoutes.tasksProjects} replace />,
    ),
  },
  {
    path: appRoutes.tasksProjects,
    element: withProtectedRoute(<TaskProjectsPage />),
  },
  {
    path: appRoutes.tasksWorkflows,
    element: withProtectedRoute(<TaskWorkflowManagerPage />),
  },
  {
    path: appRoutes.tasksProjectDetails,
    element: withProtectedRoute(<TaskProjectDetailsPage />),
  },
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
