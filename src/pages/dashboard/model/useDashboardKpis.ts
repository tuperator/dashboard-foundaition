import { useQuery } from "@tanstack/react-query";

export type DashboardKpi = {
  id: string;
  title: string;
  value: string;
  trend: string;
};

const mockKpis: DashboardKpi[] = [
  { id: "views", title: "Views", value: "7,265", trend: "+11.01%" },
  { id: "visits", title: "Visits", value: "3,671", trend: "-0.03%" },
  { id: "new-users", title: "New Users", value: "256", trend: "+15.03%" },
  {
    id: "active-users",
    title: "Active Users",
    value: "2,318",
    trend: "+6.08%",
  },
];

async function fetchDashboardKpis() {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockKpis;
}

export function useDashboardKpis() {
  return useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: fetchDashboardKpis,
  });
}
