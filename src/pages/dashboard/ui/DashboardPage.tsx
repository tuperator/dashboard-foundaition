import { AppShell } from "@/widgets/app-shell"
import { useDashboardKpis } from "@/pages/dashboard/model/useDashboardKpis"

export function DashboardPage() {
  const { data, isLoading, isError } = useDashboardKpis()

  if (isError) {
    return (
      <AppShell>
        <section className="rounded-xl border border-destructive/40 bg-card p-4 text-sm text-destructive">
          Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.
        </section>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <KpiCard
              key={`loading-${index}`}
              title="Đang tải..."
              value="--"
              trend="Đang đồng bộ dữ liệu"
            />
          ))}
        {data?.map((kpi) => (
          <KpiCard key={kpi.id} title={kpi.title} value={kpi.value} trend={kpi.trend} />
        ))}
      </section>
    </AppShell>
  )
}

function KpiCard({ title, value, trend }: { title: string; value: string; trend: string }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
    </article>
  )
}
