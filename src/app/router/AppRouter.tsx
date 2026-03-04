import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DashboardPage } from "@/pages/dashboard";
import { LoginPage } from "@/pages/login";
import { NotFoundPage } from "@/pages/not-found";
import { SettingsPage } from "@/pages/settings";
import { appRoutes } from "@/shared/constants/routes";

const router = createBrowserRouter([
  {
    path: appRoutes.login,
    element: <LoginPage />,
  },
  {
    path: appRoutes.dashboard,
    element: <DashboardPage />,
  },
  {
    path: appRoutes.settings,
    element: <SettingsPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
