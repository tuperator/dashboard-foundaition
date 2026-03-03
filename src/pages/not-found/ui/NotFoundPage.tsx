import { Link } from "react-router-dom";
import { appRoutes } from "@/shared/constants/routes";

export function NotFoundPage() {
  return (
    <main className="bg-background text-foreground flex min-h-screen items-center justify-center p-6">
      <div className="border-border bg-card max-w-md rounded-xl border p-6 text-center">
        <h1 className="text-xl font-semibold">Trang không tồn tại</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Hãy quay về dashboard để tiếp tục thao tác.
        </p>
        <Link
          to={appRoutes.dashboard}
          className="bg-primary text-primary-foreground mt-4 inline-flex rounded-md px-4 py-2 text-sm font-medium"
        >
          Về Dashboard
        </Link>
      </div>
    </main>
  );
}
