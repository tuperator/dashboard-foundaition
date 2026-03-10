import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleHalfDotIcon } from "@hugeicons/core-free-icons";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import {
  type SprintItem,
  type TaskItem,
  type TaskProject,
} from "../../../model/types";

export interface TaskProjectDetailsSprintsTabProps {
  project: TaskProject;
  projectSprints: SprintItem[];
  sprintIssuesBySprintId: Map<string, TaskItem[]>;
  workflow: string[];
  workflowStatusByCode: Map<string, { name: string; color: string }>;
  activeSprint: SprintItem | null;
  activeSprintTasksByStatus: Map<string, TaskItem[]>;
  resolveUserLabel: (value: string | null | undefined) => string;
  dragTaskId: string | null;
  setDragTaskId: (taskId: string | null) => void;
  onSprintCreate: () => void;
  onSprintStart: (sprintId: string) => void;
  onSprintClose: (sprintId: string) => void;
  onIssueRemoveFromSprint: (taskId: string) => void;
  onTaskChangeStatus: (taskId: string, status: string) => void;
}

export function TaskProjectDetailsSprintsTab({
  project,
  projectSprints,
  sprintIssuesBySprintId,
  workflow,
  workflowStatusByCode,
  activeSprint,
  activeSprintTasksByStatus,
  resolveUserLabel,
  dragTaskId,
  setDragTaskId,
  onSprintCreate,
  onSprintStart,
  onSprintClose,
  onIssueRemoveFromSprint,
  onTaskChangeStatus,
}: TaskProjectDetailsSprintsTabProps) {
  const { t } = useI18n();

  if (project.type !== "SCRUM") {
    return (
      <section className="bg-card rounded-2xl border p-5">
        <p className="text-muted-foreground text-sm">
          {t("tasks.projectDetails.sprintOnlyScrum")}
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="bg-card rounded-2xl border p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-foreground text-sm font-semibold">
              {t("tasks.projectDetails.sprintManagement")}
            </p>
            <p className="text-muted-foreground text-xs">
              {t("tasks.projectDetails.sprintManagementDescription")}
            </p>
          </div>
          <Button onClick={onSprintCreate}>
            <HugeiconsIcon icon={AddCircleHalfDotIcon} />
            {t("tasks.projectDetails.createSprint")}
          </Button>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {projectSprints.length === 0 ? (
            <article className="text-muted-foreground rounded-xl border border-dashed p-5 text-sm">
              {t("tasks.projectDetails.noSprintYet")}
            </article>
          ) : (
            projectSprints.map((sprint) => {
              const sprintIssues = sprintIssuesBySprintId.get(sprint.id) || [];
              const sprintDone = sprintIssues.filter(
                (task) => task.status === "DONE",
              ).length;
              const sprintProgress =
                sprintIssues.length === 0
                  ? 0
                  : Math.round((sprintDone / sprintIssues.length) * 100);

              return (
                <article
                  key={sprint.id}
                  className="bg-muted/10 rounded-xl border p-3"
                >
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-foreground text-sm font-semibold">
                        {sprint.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {sprint.startDate} - {sprint.endDate}
                      </p>
                    </div>
                    <Badge
                      className={
                        sprint.status === "ACTIVE"
                          ? "h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : sprint.status === "CLOSED"
                            ? "bg-muted text-muted-foreground h-6 rounded-full"
                            : "h-6 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      }
                    >
                      {sprint.status}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground mb-2 text-xs">
                    {sprint.goal || t("tasks.projectDetails.noGoal")}
                  </p>

                  <div className="mb-2">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">
                        {t("tasks.projectDetails.progress")}
                      </span>
                      <span className="text-foreground text-xs">
                        {sprintProgress}%
                      </span>
                    </div>
                    <Progress value={sprintProgress} className="h-1.5" />
                  </div>

                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {sprint.status === "PLANNED" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSprintStart(sprint.id)}
                      >
                        {t("tasks.projectDetails.startSprint")}
                      </Button>
                    ) : null}
                    {sprint.status === "ACTIVE" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSprintClose(sprint.id)}
                      >
                        {t("tasks.projectDetails.closeSprint")}
                      </Button>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    {sprintIssues.length === 0 ? (
                      <p className="text-muted-foreground text-xs">
                        {t("tasks.projectDetails.noIssueInSprint")}
                      </p>
                    ) : (
                      sprintIssues.map((issue) => (
                        <div
                          key={issue.id}
                          className="bg-card flex items-center justify-between rounded-md border px-2 py-1.5"
                        >
                          <span className="text-foreground truncate text-xs">
                            {issue.title}
                          </span>
                          {sprint.status !== "CLOSED" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => onIssueRemoveFromSprint(issue.id)}
                            >
                              {t("tasks.common.remove")}
                            </Button>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="bg-card rounded-2xl border p-4">
        <p className="text-foreground mb-2 text-sm font-semibold">
          {t("tasks.projectDetails.activeSprintBoard")}
        </p>
        {activeSprint ? (
          <div className="grid gap-3 xl:grid-cols-4">
            {workflow.map((status) => (
              <section
                key={status}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (!dragTaskId) return;
                  onTaskChangeStatus(dragTaskId, status);
                  setDragTaskId(null);
                }}
                className="bg-muted/15 min-h-[300px] rounded-xl border p-2.5"
              >
                <header className="mb-2 flex items-center justify-between">
                  <Badge
                    className="h-6 rounded-full border border-transparent px-2 text-[11px]"
                    style={{
                      backgroundColor: `${workflowStatusByCode.get(status)?.color || "#6B7280"}20`,
                      color:
                        workflowStatusByCode.get(status)?.color ||
                        "currentColor",
                    }}
                  >
                    {workflowStatusByCode.get(status)?.name || status}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {activeSprintTasksByStatus.get(status)?.length || 0}
                  </span>
                </header>
                <div className="space-y-2">
                  {(activeSprintTasksByStatus.get(status) || []).map((task) => (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={() => setDragTaskId(task.id)}
                      className="bg-card cursor-grab rounded-lg border p-2.5"
                    >
                      <p className="text-foreground text-sm font-medium">
                        {task.title}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {task.assignee
                          ? resolveUserLabel(task.assignee)
                          : t("tasks.common.unassigned")}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {t("tasks.projectDetails.noActiveSprint")}
          </p>
        )}
      </section>
    </>
  );
}
