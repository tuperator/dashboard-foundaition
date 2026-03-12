import { cn } from "@/shared/lib/utils";
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
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { StatusKanbanBoard } from "@/shared/ui/kanban/StatusKanbanBoard";
import { SearchableSelect } from "@/shared/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  File01Icon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { getInitials } from "../../../model/helpers/userHelpers";
import {
  archiveTask as archiveTaskApi,
  updateTask as updateTaskApi,
} from "../../../model/projectManagement.api";
import type {
  TaskItem,
  TaskManagerUserOption,
  TaskPriority,
  TaskPriorityItem,
} from "../../../model/types";

type TaskProjectDetailsIssuesBoardProps = {
  workflow: string[];
  issueTasksByStatus: Map<string, TaskItem[]>;
  getAvailableStatuses: (task: TaskItem) => string[];
  workflowStatusByCode: Map<string, { name: string; color: string }>;
  hasMoreKanbanTasks: boolean;
  isLoadingMoreKanbanTasks: boolean;
  onLoadMoreKanbanTasks: () => void;
  taskPriorities: TaskPriorityItem[];
  taskPriorityByCode: Map<string, TaskPriorityItem>;
  assigneeOptions: TaskManagerUserOption[];
  dragTaskId: string | null;
  setDragTaskId: Dispatch<SetStateAction<string | null>>;
  resolveUserLabel: (value: string | null | undefined) => string;
  onTaskEdit: (task: TaskItem) => void;
};

const TASK_PROJECT_TASKS_QUERY_KEY = "task-project-tasks";
const TASK_PROJECT_KANBAN_TASKS_QUERY_KEY = "task-project-kanban-tasks";
const UNASSIGNED_VALUE = "__UNASSIGNED__";

export function TaskProjectDetailsIssuesBoard({
  workflow,
  issueTasksByStatus,
  getAvailableStatuses,
  workflowStatusByCode,
  hasMoreKanbanTasks,
  isLoadingMoreKanbanTasks,
  onLoadMoreKanbanTasks,
  taskPriorities,
  taskPriorityByCode,
  assigneeOptions,
  dragTaskId,
  setDragTaskId,
  resolveUserLabel,
  onTaskEdit,
}: TaskProjectDetailsIssuesBoardProps) {
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
        queryKey: [
          TASK_PROJECT_KANBAN_TASKS_QUERY_KEY,
          variables.payload.projectId,
        ],
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

  const taskById = useMemo(() => {
    const nextMap = new Map<string, TaskItem>();

    for (const tasks of issueTasksByStatus.values()) {
      for (const task of tasks) {
        nextMap.set(task.id, task);
      }
    }

    return nextMap;
  }, [issueTasksByStatus]);

  const assignableUsers = useMemo(
    () => [
      {
        id: UNASSIGNED_VALUE,
        label: t("tasks.common.unassigned"),
        email: "",
        status: "UNKNOWN",
        initials: "--",
      },
      ...assigneeOptions,
    ],
    [assigneeOptions, t],
  );

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
    nextValues: Partial<Pick<TaskItem, "status" | "assignee" | "priority">>,
  ) => {
    const nextTask = {
      status: nextValues.status ?? task.status,
      priority: nextValues.priority ?? task.priority,
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

  const handleDropToColumn = (taskId: string, nextStatus: string) => {
    const task = taskById.get(taskId);
    if (!task) {
      return;
    }

    const availableStatuses = getAvailableStatuses(task);
    if (!availableStatuses.includes(nextStatus)) {
      appToast.warning({
        title: t("tasks.projectDetails.toast.transitionNotAllowedTitle"),
        description: t(
          "tasks.projectDetails.toast.transitionNotAllowedDescription",
        ),
      });
      return;
    }

    void handleTaskFieldChange(task, { status: nextStatus });
  };

  const formatUpdatedLabel = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
    }).format(date);
  };

  return (
    <>
      <StatusKanbanBoard
        columns={workflow.map((status) => ({
          id: status,
          label: workflowStatusByCode.get(status)?.name || status,
          color: workflowStatusByCode.get(status)?.color,
        }))}
        itemsByColumn={issueTasksByStatus}
        dragValue={dragTaskId}
        onDragValueChange={setDragTaskId}
        onDropToColumn={handleDropToColumn}
        getItemKey={(task) => task.id}
        hasMore={hasMoreKanbanTasks}
        isLoadingMore={isLoadingMoreKanbanTasks}
        onLoadMore={onLoadMoreKanbanTasks}
        loadMoreLabel={t("tasks.projectDetails.kanban.loadMore")}
        loadingMoreLabel={t("tasks.projectDetails.kanban.loadingMore")}
        renderCard={(task) => {
          const priority = taskPriorityByCode.get(task.priority);
          return (
            <div
              role="button"
              tabIndex={0}
              onClick={() => onTaskEdit(task)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onTaskEdit(task);
                }
              }}
              className="focus-visible:ring-ring/40 -m-2.5 rounded-[22px] p-2.5 text-left outline-none focus-visible:ring-2"
            >
              <div className="bg-card hover:border-primary/20 hover:shadow-primary/5 border-border/80 rounded-[20px] border p-3.5 shadow-sm transition duration-150">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex min-w-0 flex-1 items-center gap-1.5"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Select
                      value={task.priority}
                      onValueChange={(value) =>
                        void handleTaskFieldChange(task, {
                          priority: value as TaskPriority,
                        })
                      }
                    >
                      <SelectTrigger
                        className="h-8 min-w-[86px] rounded-full border px-2.5 text-[11px] font-semibold shadow-none"
                        style={getPriorityStyle(task.priority)}
                      >
                        <SelectValue>
                          <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold">
                            <span
                              className="size-1.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor: priority?.color || "#6B7280",
                              }}
                            />
                            <span className="truncate">
                              {priority?.name || task.priority}
                            </span>
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {taskPriorities.map((item) => (
                          <SelectItem key={item.code} value={item.code}>
                            <span className="flex items-center gap-2">
                              <span
                                className="size-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div onClick={(event) => event.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground size-8 rounded-full p-0"
                        >
                          <HugeiconsIcon
                            icon={MoreHorizontalIcon}
                            className="size-4"
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => onTaskEdit(task)}>
                          <HugeiconsIcon
                            icon={PencilEdit01Icon}
                            className="size-4"
                          />
                          {t("tasks.common.details")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setArchiveTarget(task)}
                        >
                          <HugeiconsIcon icon={File01Icon} className="size-4" />
                          {t("tasks.common.archive")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="text-foreground line-clamp-2 text-lg font-semibold tracking-tight">
                    {task.title}
                  </h3>
                  <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-5">
                    {task.description || t("tasks.common.noDescription")}
                  </p>
                </div>

                <div className="mt-4 flex items-end gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div onClick={(event) => event.stopPropagation()}>
                      <SearchableSelect
                        value={task.assignee || UNASSIGNED_VALUE}
                        options={assignableUsers}
                        onValueChange={(value) =>
                          void handleTaskFieldChange(task, {
                            assignee: value === UNASSIGNED_VALUE ? null : value,
                          })
                        }
                        getOptionValue={(user) => user.id}
                        getOptionLabel={(user) => user.label}
                        getOptionDescription={(user) => user.email}
                        placeholder={t("tasks.common.unassigned")}
                        searchPlaceholder={t("tasks.projectDetails.assignee")}
                        emptyLabel={t("tasks.common.none")}
                        triggerClassName="size-9 min-h-9 w-9 rounded-full border-0 bg-transparent p-0 shadow-none hover:bg-muted/50"
                        contentClassName="w-[320px]"
                        renderTrigger={({ selectedOption }) => {
                          if (
                            !selectedOption ||
                            selectedOption.id === UNASSIGNED_VALUE
                          ) {
                            return (
                              <span className="bg-muted text-muted-foreground inline-flex size-9 items-center justify-center rounded-full">
                                <HugeiconsIcon
                                  icon={UserCircleIcon}
                                  className="size-5"
                                />
                              </span>
                            );
                          }

                          return (
                            <span className="bg-primary/10 text-primary inline-flex size-9 items-center justify-center rounded-full text-[11px] font-semibold">
                              {selectedOption.initials}
                            </span>
                          );
                        }}
                        renderOption={(user) => (
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={cn(
                                "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                                user.id === UNASSIGNED_VALUE
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-primary/10 text-primary",
                              )}
                            >
                              {user.id === UNASSIGNED_VALUE ? (
                                <HugeiconsIcon
                                  icon={UserCircleIcon}
                                  className="size-4"
                                />
                              ) : (
                                user.initials || getInitials(user.label)
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {user.label}
                              </p>
                              {user.email ? (
                                <p className="text-muted-foreground truncate text-xs">
                                  {user.email}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        )}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-foreground truncate text-sm font-medium">
                        {task.assignee
                          ? resolveUserLabel(task.assignee)
                          : t("tasks.common.unassigned")}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        {formatUpdatedLabel(task.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      />

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
