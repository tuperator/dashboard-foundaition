import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { appRouteObjects } from "./routes";

const router = createBrowserRouter(appRouteObjects);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
