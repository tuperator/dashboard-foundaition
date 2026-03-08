import type { RouteObject } from "react-router-dom";
import { appRoutes } from "@/shared/constants/routes";
import { LoginPage } from "../lazy-pages";
import { withRouteSuspense } from "../route-wrappers";

export const publicRoutes: RouteObject[] = [
  {
    path: appRoutes.login,
    element: withRouteSuspense(<LoginPage />),
  },
];
