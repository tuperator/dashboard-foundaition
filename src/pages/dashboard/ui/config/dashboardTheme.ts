import type { CSSProperties } from "react";

export const panelClassName =
  "rounded-2xl border border-[color:var(--dash-panel-border)] bg-[color:var(--dash-panel-bg)] shadow-[var(--dash-panel-shadow)] p-4 md:p-5";

export const chartGridStroke = "var(--dash-grid)";
export const axisTick = { fill: "var(--dash-muted)", fontSize: 12 };
export const axisTickSmall = { fill: "var(--dash-muted)", fontSize: 11 };

export const tooltipContentStyle: CSSProperties = {
  backgroundColor: "var(--dash-panel-bg)",
  border: "1px solid var(--dash-panel-border)",
  borderRadius: 8,
  color: "var(--dash-body)",
};

export const tooltipLabelStyle: CSSProperties = {
  color: "var(--dash-label)",
};
