import { AppShell } from "@/widgets/app-shell";
import { useDashboardKpis } from "../model/useDashboardKpis";
import {
  DashboardHeader,
  KpiSection,
  MarketingSeoSection,
  TrafficDetailSection,
  TrafficOverviewSection,
} from "./components";

export function DashboardPage() {
  const { data, isLoading, isError } = useDashboardKpis();

  if (isError) {
    return (
      <AppShell>
        <section className="rounded-2xl border border-red-300 bg-white p-4 text-sm text-red-700">
          Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <DashboardHeader />
        <KpiSection kpis={data} isLoading={isLoading} />
        <TrafficOverviewSection />
        <TrafficDetailSection />
        <MarketingSeoSection />
      </div>
    </AppShell>
  );
}
