import type { RouteObject } from "react-router-dom";
import { NotFoundPage } from "../lazy-pages";
import { withRouteSuspense } from "../route-wrappers";

export const fallbackRoutes: RouteObject[] = [
  {
    path: "*",
    element: withRouteSuspense(<NotFoundPage />),
  },
];
