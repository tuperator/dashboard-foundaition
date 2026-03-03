import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { yearlyTraffic, websiteTraffic } from "@/pages/dashboard/ui/config/dashboardData";
import {
  axisTick,
  chartGridStroke,
  panelClassName,
  tooltipContentStyle,
  tooltipLabelStyle,
} from "@/pages/dashboard/ui/config/dashboardTheme";

export function TrafficOverviewSection() {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_220px]">
      <article className={panelClassName}>
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          <p className="font-semibold text-(--dash-heading)">Total Users</p>
          <p className="text-(--dash-muted)">Total Projects</p>
          <p className="text-(--dash-muted)">Operating Status</p>
          <span className="ml-auto flex items-center gap-3 text-xs text-(--dash-label)">
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-(--dash-dot-primary)" />
              This year
            </span>
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-(--dash-dot-secondary)" />
              Last year
            </span>
          </span>
        </div>

        <div className="h-62.5 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={yearlyTraffic}
              margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="2 4"
                stroke={chartGridStroke}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={axisTick}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={axisTick}
                tickFormatter={(value) => `${Math.round(value / 1000)}K`}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
              />
              <Line
                type="monotone"
                dataKey="thisYear"
                stroke="var(--dash-line-primary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="lastYear"
                stroke="var(--dash-line-secondary)"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className={panelClassName}>
        <h3 className="mb-5 text-sm font-semibold text-(--dash-heading)">
          Traffic by Website
        </h3>
        <div className="space-y-3">
          {websiteTraffic.map((row) => (
            <div key={row.name}>
              <div className="mb-1 flex items-center justify-between text-xs text-(--dash-body)">
                <span>{row.name}</span>
                <span>{row.value}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-(--dash-progress-track)">
                <div
                  className="h-1.5 rounded-full bg-(--dash-line-primary)"
                  style={{ width: `${row.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
