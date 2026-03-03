import type { DashboardKpi } from "../../model/useDashboardKpis";
import { kpiBackgrounds } from "../config/dashboardData";
import { KpiCard } from "./KpiCard";

type KpiSectionProps = {
  kpis?: DashboardKpi[];
  isLoading: boolean;
};

export function KpiSection({ kpis, isLoading }: KpiSectionProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {isLoading
        ? Array.from({ length: 4 }).map((_, index) => (
            <KpiCard
              key={`loading-${index}`}
              title="Loading"
              value="--"
              trend="Syncing data"
              bg="var(--dash-kpi-loading)"
            />
          ))
        : kpis?.map((kpi, index) => (
            <KpiCard
              key={kpi.id}
              title={kpi.title}
              value={kpi.value}
              trend={kpi.trend}
              bg={kpiBackgrounds[index] ?? "var(--dash-kpi-loading)"}
            />
          ))}
    </section>
  );
}
