import { cn } from "@/shared/lib/utils";
import type { WorkflowIssueType } from "../../../model/types";

export function IssueTypeTag({
  issueType,
  active,
}: {
  issueType: WorkflowIssueType;
  active: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-medium",
        active
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-border bg-muted/20 text-muted-foreground",
      )}
    >
      {issueType}
    </span>
  );
}

export function StatusChip({
  color,
  name,
  code,
}: {
  color: string;
  name: string;
  code: string;
}) {
  return (
    <span className="border-border bg-muted/20 text-foreground inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium">
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span>{name}</span>
      <span className="text-muted-foreground text-[10px]">({code})</span>
    </span>
  );
}
