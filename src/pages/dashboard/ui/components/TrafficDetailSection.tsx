import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  deviceTraffic,
  locationTraffic,
} from "@/pages/dashboard/ui/config/dashboardData";
import {
  axisTick,
  axisTickSmall,
  chartGridStroke,
  panelClassName,
  tooltipContentStyle,
  tooltipLabelStyle,
} from "@/pages/dashboard/ui/config/dashboardTheme";

export function TrafficDetailSection() {
  return (
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
                className="flex items-center justify-between text-sm text-(--dash-body)"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.location}
                </div>
                <span className="text-(--dash-heading)">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
