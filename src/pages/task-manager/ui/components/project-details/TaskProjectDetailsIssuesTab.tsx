import type { Dispatch, SetStateAction } from "react";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { cn } from "@/shared/lib/utils";
import { StatusKanbanBoard } from "@/shared/ui/kanban/StatusKanbanBoard";
import { TASK_TABLE_MIN_WIDTH_CLASS } from "../../../model/constants";
import {
  type TaskItem,
  type TaskManagerUserOption,
  type TaskPriority,
  type TaskPriorityItem,
  type TaskProject,
  type SprintItem,
} from "../../../model/types";

type ViewMode = "LIST" | "KANBAN";

export interface TaskProjectDetailsIssuesTabProps {
  project: TaskProject;
  projectSprints: SprintItem[];
  filteredTasks: TaskItem[];
  workflow: string[];
  workflowStatusByCode: Map<string, { name: string; color: string }>;
  activeSprint: SprintItem | null;
  issueTasksByStatus: Map<string, TaskItem[]>;
  issueViewMode: ViewMode;
  setIssueViewMode: Dispatch<SetStateAction<ViewMode>>;
  taskPriorities: TaskPriorityItem[];
  taskPriorityByCode: Map<string, TaskPriorityItem>;
  assigneeOptions: TaskManagerUserOption[];
  dragTaskId: string | null;
  setDragTaskId: Dispatch<SetStateAction<string | null>>;
  resolveUserLabel: (value: string | null | undefined) => string;
  onTaskChangePriority: (taskId: string, priority: TaskPriority) => void;
  onTaskChangeStatus: (taskId: string, status: string) => void;
  onTaskChangeAssignee: (taskId: string, assignee: string | null) => void;
  onTaskEdit: (task: TaskItem) => void;
  onTaskDelete: (taskId: string) => void;
}

export function TaskProjectDetailsIssuesTab({
  project,
  projectSprints,
  filteredTasks,
  workflow,
  workflowStatusByCode,
  activeSprint,
  issueTasksByStatus,
  issueViewMode,
  setIssueViewMode,
  taskPriorities,
  taskPriorityByCode,
  assigneeOptions,
  dragTaskId,
  setDragTaskId,
  resolveUserLabel,
  onTaskChangePriority,
  onTaskChangeStatus,
  onTaskChangeAssignee,
  onTaskEdit,
  onTaskDelete,
}: TaskProjectDetailsIssuesTabProps) {
  const { t, tp } = useI18n();

  const projectIssueView =
    project.type === "SCRUM" ? "Issue board (Scrum)" : "Issue board (Kanban)";

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getPriorityStyle = (priorityCode: string) => {
    const item = taskPriorityByCode.get(priorityCode);
    const color = item?.color || "#6B7280";
    return {
      borderColor: color,
      backgroundColor: `${color}14`,
      color: color,
    };
  };

  const priorityBadgeClassName = () => {
    // Left for fallback mostly if needed in KANBAN view
    return "h-5 rounded-full px-2 text-[10px] border";
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
      </div>

      {issueViewMode === "LIST" ? (
        <Table className={TASK_TABLE_MIN_WIDTH_CLASS}>
          <TableHeader>
            <TableRow className="bg-muted/25">
              <TableHead>{t("tasks.projectDetails.table.issue")}</TableHead>
              <TableHead>{t("tasks.projectDetails.table.priority")}</TableHead>
              <TableHead>{t("tasks.projectDetails.table.status")}</TableHead>
              <TableHead>{t("tasks.projectDetails.table.assignee")}</TableHead>
              <TableHead>{t("tasks.projectDetails.table.sprint")}</TableHead>
              <TableHead>{t("tasks.projectDetails.table.updated")}</TableHead>
              <TableHead>{t("tasks.projectDetails.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-8 text-center"
                >
                  {t("tasks.projectDetails.emptyIssue")}
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <p className="text-foreground font-medium">{task.title}</p>
                    <p className="text-muted-foreground line-clamp-1 text-xs">
                      {task.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.priority}
                      onValueChange={(value) =>
                        onTaskChangePriority(task.id, value as TaskPriority)
                      }
                    >
                      <SelectTrigger
                        className="w-[130px] border hover:bg-muted font-medium"
                        style={getPriorityStyle(task.priority)}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taskPriorities.map((priority) => (
                          <SelectItem key={priority.code} value={priority.code}>
                            <span className="flex items-center gap-2">
                              <span
                                className="size-2 rounded-full"
                                style={{ backgroundColor: priority.color }}
                              />
                              {priority.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.status}
                      onValueChange={(value) =>
                        onTaskChangeStatus(task.id, value)
                      }
                    >
                      <SelectTrigger
                        className={cn("w-[165px] border-2 font-medium")}
                        style={{
                          borderColor:
                            workflowStatusByCode.get(task.status)?.color ||
                            "#6B7280",
                          backgroundColor: `${workflowStatusByCode.get(task.status)?.color || "#6B7280"}14`,
                        }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {workflow.map((status) => (
                          <SelectItem key={status} value={status}>
                            <span className="flex items-center gap-2">
                              <span
                                className="size-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    workflowStatusByCode.get(status)?.color ||
                                    "#6B7280",
                                }}
                              />
                              {workflowStatusByCode.get(status)?.name || status}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.assignee || "__UNASSIGNED__"}
                      onValueChange={(value) =>
                        onTaskChangeAssignee(
                          task.id,
                          value === "__UNASSIGNED__" ? null : value,
                        )
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__UNASSIGNED__">
                          {t("tasks.common.unassigned")}
                        </SelectItem>
                        {assigneeOptions.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {resolveUserLabel(member.id)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {task.sprintId ? (
                      <Badge variant="outline" className="h-6 rounded-full">
                        {projectSprints.find(
                          (sprint) => sprint.id === task.sprintId,
                        )?.name || t("tasks.projectDetails.defaultSprintLabel")}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        {t("tasks.projectDetails.backlogLabel")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{formatDateTime(task.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTaskEdit(task)}
                      >
                        {t("tasks.common.edit")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onTaskDelete(task.id)}
                      >
                        {t("tasks.common.delete")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      ) : (
        <StatusKanbanBoard
          columns={workflow.map((status) => ({
            id: status,
            label: workflowStatusByCode.get(status)?.name || status,
            color: workflowStatusByCode.get(status)?.color,
          }))}
          itemsByColumn={issueTasksByStatus}
          dragValue={dragTaskId}
          onDragValueChange={setDragTaskId}
          onDropToColumn={(taskId, status) => onTaskChangeStatus(taskId, status)}
          getItemKey={(task) => task.id}
          renderCard={(task) => (
            <>
              <p className="text-foreground line-clamp-2 text-sm font-medium">
                {task.title}
              </p>
              <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                {task.description || t("tasks.common.noDescription")}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <Badge
                  className={cn(priorityBadgeClassName(), "font-medium")}
                  style={getPriorityStyle(task.priority)}
                >
                  {task.priority}
                </Badge>
                <span className="text-muted-foreground truncate text-xs">
                  {task.assignee
                    ? resolveUserLabel(task.assignee)
                    : t("tasks.common.unassigned")}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTaskEdit(task)}
                >
                  {t("tasks.common.edit")}
                </Button>
                <Select
                  value={task.status}
                  onValueChange={(value) => onTaskChangeStatus(task.id, value)}
                >
                  <SelectTrigger className="h-7 w-[128px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workflow.map((workflowStatus) => (
                      <SelectItem key={workflowStatus} value={workflowStatus}>
                        {workflowStatusByCode.get(workflowStatus)?.name ||
                          workflowStatus}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        />
      )}
    </section>
  );
}
