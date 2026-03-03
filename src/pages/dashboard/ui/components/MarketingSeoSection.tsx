import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { marketingSeries } from "../config/dashboardData";
import {
  axisTick,
  chartGridStroke,
  panelClassName,
  tooltipContentStyle,
  tooltipLabelStyle,
} from "../config/dashboardTheme";

export function MarketingSeoSection() {
  return (
    <section>
      <article className={panelClassName}>
        <h3 className="mb-4 text-sm font-semibold text-(--dash-heading)">
          Marketing & SEO
        </h3>
        <div className="h-52.5 w-full">
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
  );
}
