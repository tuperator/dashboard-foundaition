import { AddCircleHalfDotIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { Button } from "@/shared/ui/button";
import { TaskDialog } from "../TaskDialog";
import { TaskProjectDetailsIssuesBoard } from "./TaskProjectDetailsIssuesBoard";
import { TaskProjectDetailsIssuesTable } from "./TaskProjectDetailsIssuesTable";
import {
  type SprintItem,
  type TaskItem,
  type TaskManagerUserOption,
  type TaskPriorityItem,
  type TaskProject,
} from "../../../model/types";
import type { Dispatch, SetStateAction } from "react";

type ViewMode = "LIST" | "KANBAN";

export interface TaskProjectDetailsIssuesTabProps {
  project: TaskProject;
  projectSprints: SprintItem[];
  filteredTasks: TaskItem[];
  workflow: string[];
  getAvailableStatuses: (task: TaskItem) => string[];
  workflowStatusByCode: Map<string, { name: string; color: string }>;
  activeSprint: SprintItem | null;
  issueTasksByStatus: Map<string, TaskItem[]>;
  issueViewMode: ViewMode;
  setIssueViewMode: Dispatch<SetStateAction<ViewMode>>;
  issuePage: number;
  issuePageSize: number;
  issueRowStart: number;
  issueRowEnd: number;
  issueTotal: number;
  visibleIssuePages: number[];
  onIssuePageChange: (page: number) => void;
  onIssuePageSizeChange: (pageSize: number) => void;
  hasMoreKanbanTasks: boolean;
  isLoadingMoreKanbanTasks: boolean;
  onLoadMoreKanbanTasks: () => void;
  taskPriorities: TaskPriorityItem[];
  taskPriorityByCode: Map<string, TaskPriorityItem>;
  assigneeOptions: TaskManagerUserOption[];
  dragTaskId: string | null;
  setDragTaskId: Dispatch<SetStateAction<string | null>>;
  resolveUserLabel: (value: string | null | undefined) => string;
}

export function TaskProjectDetailsIssuesTab({
  project,
  projectSprints,
  filteredTasks,
  workflow,
  getAvailableStatuses,
  workflowStatusByCode,
  activeSprint,
  issueTasksByStatus,
  issueViewMode,
  setIssueViewMode,
  issuePage,
  issuePageSize,
  issueRowStart,
  issueRowEnd,
  issueTotal,
  visibleIssuePages,
  onIssuePageChange,
  onIssuePageSizeChange,
  hasMoreKanbanTasks,
  isLoadingMoreKanbanTasks,
  onLoadMoreKanbanTasks,
  taskPriorities,
  taskPriorityByCode,
  assigneeOptions,
  dragTaskId,
  setDragTaskId,
  resolveUserLabel,
}: TaskProjectDetailsIssuesTabProps) {
  const { t, tp } = useI18n();
  const [taskDialogMode, setTaskDialogMode] = useState<"create" | "edit">(
    "create",
  );
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const projectIssueView =
    project.type === "SCRUM" ? "Issue board (Scrum)" : "Issue board (Kanban)";

  const openCreateIssueDialog = () => {
    setTaskDialogMode("create");
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const openEditIssueDialog = (task: TaskItem) => {
    setTaskDialogMode("edit");
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  return (
    <section className="bg-card rounded-2xl border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-foreground text-sm font-semibold">
            {projectIssueView}
          </p>
          <p className="text-muted-foreground text-xs">
            {activeSprint
              ? tp("tasks.projectDetails.activeSprint", {
                  name: activeSprint.name,
                })
              : t("tasks.projectDetails.noActiveSprint")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="border-border/80 bg-muted/20 inline-flex items-center gap-1 rounded-md border p-1">
            <Button
              size="sm"
              variant={issueViewMode === "LIST" ? "default" : "ghost"}
              onClick={() => setIssueViewMode("LIST")}
            >
              {t("tasks.projectDetails.view.list")}
            </Button>
            <Button
              size="sm"
              variant={issueViewMode === "KANBAN" ? "default" : "ghost"}
              onClick={() => setIssueViewMode("KANBAN")}
            >
              {t("tasks.projectDetails.view.kanban")}
            </Button>
          </div>
          <Button size="sm" onClick={openCreateIssueDialog}>
            <HugeiconsIcon icon={AddCircleHalfDotIcon} />
            {t("tasks.projectDetails.newIssue")}
          </Button>
        </div>
      </div>

      {issueViewMode === "LIST" ? (
        <TaskProjectDetailsIssuesTable
          filteredTasks={filteredTasks}
          projectSprints={projectSprints}
          getAvailableStatuses={getAvailableStatuses}
          workflowStatusByCode={workflowStatusByCode}
          issuePage={issuePage}
          issuePageSize={issuePageSize}
          issueRowStart={issueRowStart}
          issueRowEnd={issueRowEnd}
          issueTotal={issueTotal}
          visibleIssuePages={visibleIssuePages}
          onIssuePageChange={onIssuePageChange}
          onIssuePageSizeChange={onIssuePageSizeChange}
          taskPriorities={taskPriorities}
          taskPriorityByCode={taskPriorityByCode}
          assigneeOptions={assigneeOptions}
          resolveUserLabel={resolveUserLabel}
          onTaskEdit={openEditIssueDialog}
        />
      ) : (
        <TaskProjectDetailsIssuesBoard
          workflow={workflow}
          issueTasksByStatus={issueTasksByStatus}
          getAvailableStatuses={getAvailableStatuses}
          workflowStatusByCode={workflowStatusByCode}
          hasMoreKanbanTasks={hasMoreKanbanTasks}
          isLoadingMoreKanbanTasks={isLoadingMoreKanbanTasks}
          onLoadMoreKanbanTasks={onLoadMoreKanbanTasks}
          taskPriorities={taskPriorities}
          taskPriorityByCode={taskPriorityByCode}
          assigneeOptions={assigneeOptions}
          dragTaskId={dragTaskId}
          setDragTaskId={setDragTaskId}
          resolveUserLabel={resolveUserLabel}
          onTaskEdit={openEditIssueDialog}
        />
      )}

      <TaskDialog
        key={`${project.id}-${taskDialogMode}-${editingTask?.id || "new"}-${taskDialogOpen ? "open" : "closed"}`}
        open={taskDialogOpen}
        mode={taskDialogMode}
        task={taskDialogMode === "edit" ? editingTask : null}
        projects={[project]}
        defaultProjectId={project.id}
        lockProjectId={project.id}
        assigneeOptions={assigneeOptions}
        statusOptions={workflow}
        workflowStatusByCode={workflowStatusByCode}
        taskPriorities={taskPriorities}
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) {
            setEditingTask(null);
          }
        }}
      />
    </section>
  );
}
