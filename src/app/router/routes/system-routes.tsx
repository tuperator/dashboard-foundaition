import type { RouteObject } from "react-router-dom";
import { appRoutes } from "@/shared/constants/routes";
import { SettingsPage } from "../lazy-pages";
import { withProtectedRoute } from "../route-wrappers";

export const systemRoutes: RouteObject[] = [
  {
    path: appRoutes.settings,
    element: withProtectedRoute(<SettingsPage />),
  },
];
