import { Link } from "react-router-dom"
import { appRoutes } from "@/shared/constants/routes"

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="max-w-md rounded-xl border border-border bg-card p-6 text-center">
        <h1 className="text-xl font-semibold">Trang không tồn tại</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hãy quay về dashboard để tiếp tục thao tác.
        </p>
        <Link
          to={appRoutes.dashboard}
          className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Về Dashboard
        </Link>
      </div>
    </main>
  )
}
