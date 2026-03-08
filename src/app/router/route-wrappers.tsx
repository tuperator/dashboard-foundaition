import { Suspense, type ReactNode } from "react";
import { Spinner } from "@/shared/ui/spinner";
import { RequireAuth } from "./RequireAuth";

const routeLoadingFallback = (
  <div className="bg-background flex min-h-screen items-center justify-center">
    <div className="text-muted-foreground inline-flex items-center gap-2 text-sm">
      <Spinner className="size-4" />
      <span>Loading...</span>
    </div>
  </div>
);

export function withRouteSuspense(element: ReactNode) {
  return <Suspense fallback={routeLoadingFallback}>{element}</Suspense>;
}

export function withProtectedRoute(element: ReactNode) {
  return withRouteSuspense(<RequireAuth>{element}</RequireAuth>);
}
