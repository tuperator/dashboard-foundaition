import { cn } from "@/shared/lib/utils";
import type { WorkflowIssueType } from "../../../model/types";

const ISSUE_TYPE_TAG_STYLES: Record<WorkflowIssueType, string> = {
  TASK:
    "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200",
  BUG: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
  STORY:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
  EPIC: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
};

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
        "inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-medium tracking-[0.01em]",
        active
          ? ISSUE_TYPE_TAG_STYLES[issueType]
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
