import type { RouteObject } from "react-router-dom";
import { appRoutes } from "@/shared/constants/routes";
import { DashboardPage } from "../lazy-pages";
import { withProtectedRoute } from "../route-wrappers";

export const dashboardRoutes: RouteObject[] = [
  {
    path: appRoutes.dashboard,
    element: withProtectedRoute(<DashboardPage />),
  },
];
