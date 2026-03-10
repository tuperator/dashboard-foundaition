import { HugeiconsIcon } from "@hugeicons/react";
import { FloppyDiskIcon } from "@hugeicons/core-free-icons";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { TabsContent } from "@/shared/ui/tabs";
import { cn } from "@/shared/lib/utils";
import type { TaskProject } from "../../../../model/types";

type WorkflowProjectsTabProps = {
  workflowId: string;
  projects: TaskProject[];
  assignProjectIds: string[];
  submitting: boolean;
  onAssignProjectIdsChange: (value: string[]) => void;
  onAssignProjects: (workflowId: string, projectIds: string[]) => Promise<void>;
};

export function WorkflowProjectsTab({
  workflowId,
  projects,
  assignProjectIds,
  submitting,
  onAssignProjectIdsChange,
  onAssignProjects,
}: WorkflowProjectsTabProps) {
  const appToast = useAppToast();
  const { t } = useI18n();

  return (
    <TabsContent value="projects" className="space-y-3 pt-2">
      <div className="grid gap-2 md:grid-cols-2">
        {projects.map((project) => {
          const active = assignProjectIds.includes(project.id);
          return (
            <button
              key={project.id}
              type="button"
              disabled={submitting}
              onClick={() =>
                onAssignProjectIdsChange(
                  active
                    ? assignProjectIds.filter((id) => id !== project.id)
                    : [...assignProjectIds, project.id],
                )
              }
              className={cn(
                "flex items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                active
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card hover:bg-muted/30",
              )}
            >
              <Checkbox
                checked={active}
                className="pointer-events-none shrink-0"
              />
              <div className="min-w-0">
                <p className="truncate font-medium leading-tight">
                  {project.name}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {project.key}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-1">
        <Button
          size="sm"
          disabled={submitting}
          onClick={async () => {
            try {
              await onAssignProjects(workflowId, assignProjectIds);
              appToast.success({
                title: t("tasks.workflow.toast.updatedTitle"),
                description: t("tasks.workflow.toast.appliedProjects"),
              });
            } catch (error) {
              appToast.error({
                title: t("tasks.workflow.toast.requestFailedTitle"),
                description: error instanceof Error ? error.message : undefined,
              });
            }
          }}
        >
          <HugeiconsIcon icon={FloppyDiskIcon} className="mr-2 size-4" />
          {t("tasks.workflow.editor.button.apply")}
        </Button>
      </div>
    </TabsContent>
  );
}
