import type { RouteObject } from "react-router-dom";
import { dashboardRoutes } from "./dashboard-routes";
import { fallbackRoutes } from "./fallback-routes";
import { managementRoutes } from "./management-routes";
import { publicRoutes } from "./public-routes";
import { systemRoutes } from "./system-routes";

export const appRouteObjects: RouteObject[] = [
  ...publicRoutes,
  ...dashboardRoutes,
  ...systemRoutes,
  ...managementRoutes,
  ...fallbackRoutes,
];
