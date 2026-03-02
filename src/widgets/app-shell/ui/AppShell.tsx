import type { PropsWithChildren } from "react"

const menuItems = [
  "Dashboard",
  "Bán hàng",
  "Kho",
  "Mua hàng",
  "Tài chính",
  "Nhân sự",
  "Báo cáo",
]

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-border bg-card p-4 lg:border-r lg:border-b-0">
          <h1 className="text-lg font-semibold">ERP Master</h1>
          <p className="mt-1 text-xs text-muted-foreground">Enterprise Management System</p>
          <nav className="mt-6 grid gap-1">
            {menuItems.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex flex-col">
          <header className="border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
            <h2 className="text-base font-medium">Tổng quan doanh nghiệp</h2>
          </header>
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
