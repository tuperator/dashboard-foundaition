import { useQuery } from "@tanstack/react-query"

export type DashboardKpi = {
  id: string
  title: string
  value: string
  trend: string
}

const mockKpis: DashboardKpi[] = [
  { id: "revenue", title: "Doanh thu", value: "2.45B VND", trend: "+12.8% so với tháng trước" },
  { id: "orders", title: "Đơn hàng", value: "1,284", trend: "+6.1% so với tháng trước" },
  { id: "debt", title: "Công nợ", value: "356M VND", trend: "-3.4% so với tháng trước" },
  { id: "operations", title: "Hiệu suất vận hành", value: "92.4%", trend: "+1.9 điểm" },
]

async function fetchDashboardKpis() {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return mockKpis
}

export function useDashboardKpis() {
  return useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: fetchDashboardKpis,
  })
}
