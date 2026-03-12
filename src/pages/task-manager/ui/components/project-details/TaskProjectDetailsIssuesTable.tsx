import {
  File01Icon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/shared/ui/pagination";
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
import {
  archiveTask as archiveTaskApi,
  updateTask as updateTaskApi,
} from "../../../model/projectManagement.api";
import {
  getWorkflowStatusMeta,
  getWorkflowStatusStyle,
} from "../../../model/helpers/workflowStatusHelpers";
import {
  TASK_ISSUE_PAGE_SIZE_OPTIONS,
  TASK_TABLE_MIN_WIDTH_CLASS,
} from "../../../model/constants";
import type {
  SprintItem,
  TaskItem,
  TaskManagerUserOption,
  TaskPriority,
  TaskPriorityItem,
} from "../../../model/types";

type TaskProjectDetailsIssuesTableProps = {
  filteredTasks: TaskItem[];
  projectSprints: SprintItem[];
  getAvailableStatuses: (task: TaskItem) => string[];
  workflowStatusByCode: Map<string, { name: string; color: string }>;
  issuePage: number;
  issuePageSize: number;
  issueRowStart: number;
  issueRowEnd: number;
  issueTotal: number;
  visibleIssuePages: number[];
  onIssuePageChange: (page: number) => void;
  onIssuePageSizeChange: (pageSize: number) => void;
  taskPriorities: TaskPriorityItem[];
  taskPriorityByCode: Map<string, TaskPriorityItem>;
  assigneeOptions: TaskManagerUserOption[];
  resolveUserLabel: (value: string | null | undefined) => string;
  onTaskEdit: (task: TaskItem) => void;
};

const TASK_PROJECT_TASKS_QUERY_KEY = "task-project-tasks";
const TASK_PROJECT_KANBAN_TASKS_QUERY_KEY = "task-project-kanban-tasks";

export function TaskProjectDetailsIssuesTable({
  filteredTasks,
  projectSprints,
  getAvailableStatuses,
  workflowStatusByCode,
  issuePage,
  issuePageSize,
  issueRowStart,
  issueRowEnd,
  issueTotal,
  visibleIssuePages,
  onIssuePageChange,
  onIssuePageSizeChange,
  taskPriorities,
  taskPriorityByCode,
  assigneeOptions,
  resolveUserLabel,
  onTaskEdit,
}: TaskProjectDetailsIssuesTableProps) {
  const { t, tp } = useI18n();
  const appToast = useAppToast();
  const queryClient = useQueryClient();
  const [archiveTarget, setArchiveTarget] = useState<TaskItem | null>(null);

  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: {
        title: string;
        description: string;
        projectId: string;
        assignee: string | null;
        status: string;
        priority: TaskPriority;
      };
    }) => updateTaskApi(taskId, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: [TASK_PROJECT_TASKS_QUERY_KEY, variables.payload.projectId],
      });
      await queryClient.invalidateQueries({
        queryKey: [TASK_PROJECT_KANBAN_TASKS_QUERY_KEY, variables.payload.projectId],
      });
    },
  });
  const archiveTaskMutation = useMutation({
    mutationFn: (taskId: string) => archiveTaskApi(taskId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [TASK_PROJECT_TASKS_QUERY_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [TASK_PROJECT_KANBAN_TASKS_QUERY_KEY],
      });
    },
  });

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
      color,
    };
  };

  const handleTaskFieldChange = async (
    task: TaskItem,
    nextValues: Partial<Pick<TaskItem, "priority" | "status" | "assignee">>,
  ) => {
    const nextTask = {
      priority: nextValues.priority ?? task.priority,
      status: nextValues.status ?? task.status,
      assignee:
        nextValues.assignee !== undefined ? nextValues.assignee : task.assignee,
    };

    if (
      nextTask.priority === task.priority &&
      nextTask.status === task.status &&
      nextTask.assignee === task.assignee
    ) {
      return;
    }

    try {
      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        payload: {
          title: task.title,
          description: task.description,
          projectId: task.projectId,
          assignee: nextTask.assignee,
          status: nextTask.status,
          priority: nextTask.priority,
        },
      });
    } catch (error: unknown) {
      appToast.warning({
        title: t("tasks.projectDetails.toast.taskRequestFailedTitle"),
        description:
          error instanceof Error
            ? error.message
            : t("tasks.projectDetails.toast.taskRequestFailedDescription"),
      });
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) {
      return;
    }

    try {
      await archiveTaskMutation.mutateAsync(archiveTarget.id);
      appToast.success({
        title: t("tasks.projectDetails.toast.issueArchivedTitle"),
        description: tp("tasks.projectDetails.toast.issueArchivedDescription", {
          name: archiveTarget.title,
        }),
      });
      setArchiveTarget(null);
    } catch (error: unknown) {
      appToast.warning({
        title: t("tasks.projectDetails.toast.taskRequestFailedTitle"),
        description:
          error instanceof Error
            ? error.message
            : t("tasks.projectDetails.toast.taskRequestFailedDescription"),
      });
    }
  };

  return (
    <>
      <Table className={TASK_TABLE_MIN_WIDTH_CLASS}>
        <TableHeader>
          <TableRow className="bg-muted/25">
            <TableHead className="w-[68px]">
              {t("tasks.projectDetails.table.actions")}
            </TableHead>
            <TableHead>{t("tasks.projectDetails.table.issue")}</TableHead>
            <TableHead>{t("tasks.projectDetails.table.priority")}</TableHead>
            <TableHead>{t("tasks.projectDetails.table.status")}</TableHead>
            <TableHead>{t("tasks.projectDetails.table.assignee")}</TableHead>
            <TableHead>{t("tasks.projectDetails.table.sprint")}</TableHead>
            <TableHead>{t("tasks.projectDetails.table.updated")}</TableHead>
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
            filteredTasks.map((task) => {
              const availableStatuses = getAvailableStatuses(task);

              return (
                <TableRow key={task.id}>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-8 rounded-full p-0"
                        >
                          <HugeiconsIcon
                            icon={MoreHorizontalIcon}
                            className="size-4"
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-40">
                        <DropdownMenuItem onClick={() => onTaskEdit(task)}>
                          <HugeiconsIcon
                            icon={PencilEdit01Icon}
                            className="size-4"
                          />
                          {t("tasks.common.details")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setArchiveTarget(task)}>
                          <HugeiconsIcon
                            icon={File01Icon}
                            className="size-4"
                          />
                          {t("tasks.common.archive")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>

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
                        void handleTaskFieldChange(task, {
                          priority: value as TaskPriority,
                        })
                      }
                    >
                      <SelectTrigger
                        className="hover:bg-muted/30 h-7 w-[110px] rounded-full border px-2 text-[11px] font-semibold shadow-none"
                        style={getPriorityStyle(task.priority)}
                      >
                        <SelectValue>
                          <span className="flex min-w-0 items-center gap-1 text-[11px] leading-none font-semibold">
                            <span
                              className="size-1.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  taskPriorityByCode.get(task.priority)?.color ||
                                  "#6B7280",
                              }}
                            />
                            <span className="truncate">
                              {taskPriorityByCode.get(task.priority)?.name ||
                                task.priority}
                            </span>
                          </span>
                        </SelectValue>
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
                        void handleTaskFieldChange(task, { status: value })
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "h-7 w-[132px] rounded-full border px-2 text-[11px] font-semibold shadow-none",
                        )}
                        style={getWorkflowStatusStyle(
                          workflowStatusByCode,
                          task.status,
                        )}
                      >
                        <SelectValue>
                          <span className="flex min-w-0 items-center gap-1 text-[11px] leading-none font-semibold">
                            <span
                              className="size-1.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor: getWorkflowStatusMeta(
                                  workflowStatusByCode,
                                  task.status,
                                ).color,
                              }}
                            />
                            <span className="truncate">
                              {
                                getWorkflowStatusMeta(
                                  workflowStatusByCode,
                                  task.status,
                                ).name
                              }
                            </span>
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {availableStatuses.map((status) => (
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
                              {
                                getWorkflowStatusMeta(
                                  workflowStatusByCode,
                                  status,
                                ).name
                              }
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
                        void handleTaskFieldChange(task, {
                          assignee: value === "__UNASSIGNED__" ? null : value,
                        })
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
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span>{t("tasks.projectDetails.pagination.rowsPerPage")}</span>
          <Select
            value={String(issuePageSize)}
            onValueChange={(value) => onIssuePageSizeChange(Number(value))}
          >
            <SelectTrigger size="sm" className="w-[88px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_ISSUE_PAGE_SIZE_OPTIONS.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>
            {tp("tasks.projectDetails.pagination.range", {
              start: issueRowStart,
              end: issueRowEnd,
              total: issueTotal,
            })}
          </span>
        </div>

        <Pagination className="mx-0 w-auto justify-start">
          <PaginationContent>
            {visibleIssuePages.map((value) => (
              <PaginationItem key={value}>
                <PaginationLink
                  href="#"
                  size="icon-sm"
                  isActive={value === issuePage}
                  onClick={(event) => {
                    event.preventDefault();
                    onIssuePageChange(value);
                  }}
                >
                  {value}
                </PaginationLink>
              </PaginationItem>
            ))}
          </PaginationContent>
        </Pagination>
      </div>

      <AlertDialog
        open={Boolean(archiveTarget)}
        onOpenChange={(open) => {
          if (!open && !archiveTaskMutation.isPending) {
            setArchiveTarget(null);
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <HugeiconsIcon icon={File01Icon} className="size-4" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {t("tasks.projectDetails.archive.confirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tp("tasks.projectDetails.archive.confirmDescription", {
                name: archiveTarget?.title || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiveTaskMutation.isPending}>
              {t("tasks.common.close")}
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={archiveTaskMutation.isPending}
              onClick={() => void handleArchiveConfirm()}
            >
              {t("tasks.common.archive")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
