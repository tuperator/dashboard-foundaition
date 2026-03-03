export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold text-(--dash-heading)">Overview</h1>
      <button
        type="button"
        className="hover:bg-muted rounded-lg px-2 py-1 text-sm text-(--dash-label) transition"
      >
        Today
      </button>
    </div>
  );
}
