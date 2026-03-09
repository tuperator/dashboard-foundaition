import { Badge } from "@/shared/ui/badge";
type TaskStatusBadgeProps = {
  status: string;
};

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const label =
    status === "TODO"
      ? "Todo"
      : status === "IN_PROGRESS"
        ? "In progress"
        : status === "REVIEW"
          ? "Review"
          : status;

  const className =
    status === "TODO"
      ? "border-slate-200 bg-slate-50 text-slate-700"
      : status === "IN_PROGRESS"
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : status === "REVIEW"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : status === "DONE"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-violet-200 bg-violet-50 text-violet-700";

  return (
    <Badge variant="outline" className={`h-5 rounded-full ${className}`}>
      {label}
    </Badge>
  );
}
