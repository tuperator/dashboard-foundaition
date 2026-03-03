type KpiCardProps = {
  title: string;
  value: string;
  trend: string;
  bg: string;
};

export function KpiCard({ title, value, trend, bg }: KpiCardProps) {
  return (
    <article
      className="rounded-2xl border border-(--dash-panel-border) p-4 shadow-(--dash-panel-shadow) md:p-5"
      style={{ backgroundColor: bg }}
    >
      <p className="text-sm text-(--dash-body)">{title}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-[32px] leading-none font-semibold text-(--dash-value)">
          {value}
        </p>
        <p className="text-xs text-(--dash-body)">{trend}</p>
      </div>
    </article>
  );
}
