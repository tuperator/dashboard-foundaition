import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/widgets/app-shell";
import { useDashboardKpis } from "@/pages/dashboard/model/useDashboardKpis";

const yearlyTraffic = [
  { month: "Jan", thisYear: 11000, lastYear: 7000 },
  { month: "Feb", thisYear: 9000, lastYear: 13000 },
  { month: "Mar", thisYear: 14500, lastYear: 21000 },
  { month: "Apr", thisYear: 24000, lastYear: 9000 },
  { month: "May", thisYear: 25500, lastYear: 15000 },
  { month: "Jun", thisYear: 19000, lastYear: 14000 },
  { month: "Jul", thisYear: 23500, lastYear: 19500 },
];

const websiteTraffic = [
  { name: "Google", value: 82 },
  { name: "YouTube", value: 64 },
  { name: "Instagram", value: 58 },
  { name: "Pinterest", value: 49 },
  { name: "Facebook", value: 37 },
  { name: "Twitter", value: 31 },
];

const deviceTraffic = [
  { device: "Linux", value: 18000, color: "var(--dash-device-linux)" },
  { device: "Mac", value: 31000, color: "var(--dash-device-mac)" },
  { device: "iOS", value: 22000, color: "var(--dash-device-ios)" },
  { device: "Windows", value: 34000, color: "var(--dash-device-windows)" },
  { device: "Android", value: 14000, color: "var(--dash-device-android)" },
  { device: "Other", value: 27000, color: "var(--dash-device-other)" },
];

const locationTraffic = [
  { location: "United States", value: 52.1, color: "var(--dash-location-us)" },
  { location: "Canada", value: 22.8, color: "var(--dash-location-canada)" },
  { location: "Mexico", value: 13.9, color: "var(--dash-location-mexico)" },
  { location: "Other", value: 11.2, color: "var(--dash-location-other)" },
];

const marketingSeries = [
  { month: "Jan", seo: 2200, ads: 1700 },
  { month: "Feb", seo: 2600, ads: 1900 },
  { month: "Mar", seo: 2500, ads: 2050 },
  { month: "Apr", seo: 3100, ads: 2450 },
  { month: "May", seo: 3700, ads: 2800 },
  { month: "Jun", seo: 3400, ads: 3000 },
  { month: "Jul", seo: 3900, ads: 3350 },
];

const kpiBackgrounds = [
  "var(--dash-kpi-1)",
  "var(--dash-kpi-2)",
  "var(--dash-kpi-3)",
  "var(--dash-kpi-4)",
];
const panelClassName =
  "rounded-2xl border border-[color:var(--dash-panel-border)] bg-[color:var(--dash-panel-bg)] shadow-[var(--dash-panel-shadow)] p-4 md:p-5";
const chartGridStroke = "var(--dash-grid)";
const axisTick = { fill: "var(--dash-muted)", fontSize: 12 };
const axisTickSmall = { fill: "var(--dash-muted)", fontSize: 11 };
const tooltipContentStyle = {
  backgroundColor: "var(--dash-panel-bg)",
  border: "1px solid var(--dash-panel-border)",
  borderRadius: 8,
  color: "var(--dash-body)",
};
const tooltipLabelStyle = { color: "var(--dash-label)" };

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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-(--dash-heading)">
            Overview
          </h1>
          <button
            type="button"
            className="hover:bg-muted rounded-lg px-2 py-1 text-sm text-(--dash-label) transition"
          >
            Today
          </button>
        </div>

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
            : data?.map((kpi, index) => (
                <KpiCard
                  key={kpi.id}
                  title={kpi.title}
                  value={kpi.value}
                  trend={kpi.trend}
                  bg={kpiBackgrounds[index] ?? "var(--dash-kpi-loading)"}
                />
              ))}
        </section>

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

        <section className="grid gap-4 lg:grid-cols-2">
          <article className={panelClassName}>
            <h3 className="mb-4 text-sm font-semibold text-(--dash-heading)">
              Traffic by Device
            </h3>
            <div className="h-55 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={deviceTraffic}
                  margin={{ top: 8, right: 0, left: -10, bottom: 0 }}
                  barSize={20}
                >
                  <CartesianGrid
                    strokeDasharray="2 4"
                    stroke={chartGridStroke}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="device"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickSmall}
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
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {deviceTraffic.map((entry) => (
                      <Cell key={entry.device} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className={panelClassName}>
            <h3 className="mb-4 text-sm font-semibold text-(--dash-heading)">
              Traffic by Location
            </h3>
            <div className="grid items-center gap-4 sm:grid-cols-[160px_1fr]">
              <div className="mx-auto h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={locationTraffic}
                      dataKey="value"
                      nameKey="location"
                      innerRadius={34}
                      outerRadius={62}
                      paddingAngle={2}
                    >
                      {locationTraffic.map((segment) => (
                        <Cell key={segment.location} fill={segment.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={tooltipContentStyle}
                      labelStyle={tooltipLabelStyle}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {locationTraffic.map((item) => (
                  <div
                    key={item.location}
                    className="flex items-center justify-between text-sm text-[color:var(--dash-body)]"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.location}
                    </div>
                    <span className="text-[color:var(--dash-heading)]">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section>
          <article className={panelClassName}>
            <h3 className="mb-4 text-sm font-semibold text-[color:var(--dash-heading)]">
              Marketing & SEO
            </h3>
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={marketingSeries}
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
                  <YAxis tickLine={false} axisLine={false} tick={axisTick} />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    labelStyle={tooltipLabelStyle}
                  />
                  <Line
                    type="monotone"
                    dataKey="seo"
                    stroke="var(--dash-seo)"
                    strokeWidth={2.2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ads"
                    stroke="var(--dash-ads)"
                    strokeWidth={1.9}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}

function KpiCard({
  title,
  value,
  trend,
  bg,
}: {
  title: string;
  value: string;
  trend: string;
  bg: string;
}) {
  return (
    <article
      className="rounded-2xl border border-[color:var(--dash-panel-border)] p-4 shadow-[var(--dash-panel-shadow)] md:p-5"
      style={{ backgroundColor: bg }}
    >
      <p className="text-sm text-[color:var(--dash-body)]">{title}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-[32px] leading-none font-semibold text-[color:var(--dash-value)]">
          {value}
        </p>
        <p className="text-xs text-[color:var(--dash-body)]">{trend}</p>
      </div>
    </article>
  );
}
