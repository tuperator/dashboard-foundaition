import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { type TaskProject, type WorkflowTemplate } from "../../../model/types";

export interface TaskProjectDetailsOverviewTabProps {
  project: TaskProject;
  progress: {
    total: number;
    done: number;
    inProgress: number;
    completion: number;
  };
  workflowTemplate: WorkflowTemplate | null;
  workflow: string[];
  workflowStatusByCode: Map<string, { name: string; color: string }>;
  onOpenWorkflowManager: () => void;
}

export function TaskProjectDetailsOverviewTab({
  project,
  progress,
  workflowTemplate,
  workflow,
  workflowStatusByCode,
  onOpenWorkflowManager,
}: TaskProjectDetailsOverviewTabProps) {
  const { t } = useI18n();

  return (
    <section className="bg-card rounded-2xl border p-4">
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={t("tasks.projectDetails.metric.members")}
          value={String(project.members.length)}
        />
        <MetricCard
          label={t("tasks.projectDetails.metric.totalIssues")}
          value={String(progress.total)}
        />
        <MetricCard
          label={t("tasks.projectDetails.metric.inProgress")}
          value={String(progress.inProgress)}
        />
        <MetricCard
          label={t("tasks.projectDetails.metric.done")}
          value={String(progress.done)}
        />
      </div>

      <article className="bg-muted/15 mb-4 rounded-xl border p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-foreground text-sm font-semibold">
            {t("tasks.projectDetails.projectCompletion")}
          </p>
          <span className="text-foreground text-sm font-semibold">
            {progress.completion}%
          </span>
        </div>
        <Progress value={progress.completion} className="h-2" />
      </article>

      <article className="bg-muted/15 rounded-xl border p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-foreground text-sm font-semibold">
              {t("tasks.projectDetails.workflow")}
            </p>
            <p className="text-muted-foreground text-xs">
              {t("tasks.projectDetails.workflowDescription")}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={onOpenWorkflowManager}>
            {t("tasks.projectDetails.workflowManager")}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="h-6 rounded-full">
            {workflowTemplate?.name ||
              t("tasks.projectDetails.defaultWorkflow")}
          </Badge>
          {workflow.map((status) => (
            <Badge
              key={status}
              className="h-6 rounded-full border border-transparent px-2 text-[11px]"
              style={{
                backgroundColor: `${workflowStatusByCode.get(status)?.color || "#6B7280"}20`,
                color:
                  workflowStatusByCode.get(status)?.color || "currentColor",
              }}
            >
              {workflowStatusByCode.get(status)?.name || status}
            </Badge>
          ))}
        </div>
      </article>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border bg-gradient-to-br from-slate-50 to-slate-100/50 p-3 dark:from-slate-950/30 dark:to-slate-900/10">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-foreground mt-1 text-sm font-semibold">{value}</p>
    </article>
  );
}
