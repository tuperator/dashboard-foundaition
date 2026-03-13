import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddCircleHalfDotIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  File01Icon,
  MoreHorizontalCircle01Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
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
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  addBacklogTaskToSprint,
  cloneBacklogTask,
  reorderBacklogTask,
} from "../../../model/backlogManagement.api";
import { archiveTask } from "../../../model/projectManagement.api";
import type { SprintItem, TaskItem } from "../../../model/types";

type TaskProjectBacklogRowActionsProps = {
  projectId: string;
  task: TaskItem;
  taskIds: string[];
  availableSprintTargets: SprintItem[];
  activeSprint: SprintItem | null;
  onEdit: (task: TaskItem) => void;
};

const TASK_PROJECT_BACKLOG_QUERY_KEY = "task-project-backlog-tasks";
const TASK_PROJECT_TASKS_QUERY_KEY = "task-project-tasks";
const TASK_PROJECT_KANBAN_TASKS_QUERY_KEY = "task-project-kanban-tasks";
const TASK_PROJECT_SPRINTS_QUERY_KEY = "task-project-sprints";

export function TaskProjectBacklogRowActions({
  projectId,
  task,
  taskIds,
  availableSprintTargets,
  activeSprint,
  onEdit,
}: TaskProjectBacklogRowActionsProps) {
  const { t } = useI18n();
  const appToast = useAppToast();
  const queryClient = useQueryClient();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false);
  const [targetSprintId, setTargetSprintId] = useState("__AUTO__");
  const currentIndex = taskIds.indexOf(task.id);
  const invalidateAll = async () => {
    await queryClient.invalidateQueries({
      queryKey: [TASK_PROJECT_BACKLOG_QUERY_KEY, projectId],
    });
    await queryClient.invalidateQueries({
      queryKey: [TASK_PROJECT_TASKS_QUERY_KEY, projectId],
    });
    await queryClient.invalidateQueries({
      queryKey: [TASK_PROJECT_KANBAN_TASKS_QUERY_KEY, projectId],
    });
    await queryClient.invalidateQueries({
      queryKey: [TASK_PROJECT_SPRINTS_QUERY_KEY, projectId],
    });
  };
  const archiveMutation = useMutation({
    mutationFn: () => archiveTask(task.id),
    onSuccess: invalidateAll,
  });
  const cloneMutation = useMutation({
    mutationFn: () =>
      cloneBacklogTask(task.id, {
        projectId,
      }),
    onSuccess: invalidateAll,
  });
  const reorderMutation = useMutation({
    mutationFn: ({
      beforeTaskId,
      afterTaskId,
    }: {
      beforeTaskId: string | null;
      afterTaskId: string | null;
    }) =>
      reorderBacklogTask(task.id, {
        projectId,
        beforeTaskId,
        afterTaskId,
      }),
    onSuccess: invalidateAll,
  });
  const addToSprintMutation = useMutation({
    mutationFn: (sprintId: string | null) =>
      addBacklogTaskToSprint(task.id, {
        projectId,
        sprintId,
      }),
    onSuccess: invalidateAll,
  });

  const moveUp = async () => {
    const previousId = currentIndex > 0 ? taskIds[currentIndex - 1] : null;
    const previousPreviousId =
      currentIndex > 1 ? taskIds[currentIndex - 2] : null;

    if (!previousId) {
      return;
    }

    try {
      await reorderMutation.mutateAsync({
        beforeTaskId: previousId,
        afterTaskId: previousPreviousId,
      });
    } catch (error: unknown) {
      appToast.warning({
        title: t("tasks.projectDetails.loadTasksFailedTitle"),
        description:
          error instanceof Error
            ? error.message
            : t("tasks.projectDetails.loadTasksFailedDescription"),
      });
    }
  };

  const moveDown = async () => {
    const nextId =
      currentIndex >= 0 && currentIndex < taskIds.length - 1
        ? taskIds[currentIndex + 1]
        : null;
    const nextNextId =
      currentIndex >= 0 && currentIndex < taskIds.length - 2
        ? taskIds[currentIndex + 2]
        : null;

    if (!nextId) {
      return;
    }

    try {
      await reorderMutation.mutateAsync({
        beforeTaskId: nextNextId,
        afterTaskId: nextId,
      });
    } catch (error: unknown) {
      appToast.warning({
        title: t("tasks.projectDetails.loadTasksFailedTitle"),
        description:
          error instanceof Error
            ? error.message
            : t("tasks.projectDetails.loadTasksFailedDescription"),
      });
    }
  };

  const handleAddToSprint = async () => {
    const targetSprint =
      targetSprintId !== "__AUTO__"
        ? availableSprintTargets.find((item) => item.id === targetSprintId)
        : activeSprint ||
          availableSprintTargets.find((item) => item.status === "PLANNED");

    if (!targetSprint) {
      appToast.warning({
        title: t("tasks.projectDetails.toast.noSprintAvailableTitle"),
        description: t("tasks.projectDetails.toast.noSprintAvailableDescription"),
      });
      return;
    }

    try {
      await addToSprintMutation.mutateAsync(targetSprint.id);
      appToast.success({
        title: t("tasks.projectDetails.sprintManagement"),
        description: "Đã thêm issue vào sprint.",
      });
      setTargetSprintId("__AUTO__");
      setSprintDialogOpen(false);
    } catch (error: unknown) {
      appToast.warning({
        title: t("tasks.projectDetails.toast.sprintRequestFailedTitle"),
        description:
          error instanceof Error
            ? error.message
            : t("tasks.projectDetails.toast.sprintRequestFailedDescription"),
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Backlog actions">
            <HugeiconsIcon
              icon={MoreHorizontalCircle01Icon}
              className="size-4"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => onEdit(task)}>
            <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 size-4" />
            Chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={cloneMutation.isPending}
            onClick={() => {
              void cloneMutation.mutateAsync().then(
                () => {
                  appToast.success({
                    title: t("tasks.projectDetails.tab.backlog"),
                    description: "Đã clone issue vào backlog.",
                  });
                },
                (error: unknown) => {
                  appToast.warning({
                    title: t("tasks.projectDetails.loadTasksFailedTitle"),
                    description:
                      error instanceof Error
                        ? error.message
                        : t("tasks.projectDetails.loadTasksFailedDescription"),
                  });
                },
              );
            }}
          >
            <HugeiconsIcon
              icon={AddCircleHalfDotIcon}
              className="mr-2 size-4"
            />
            Clone
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={currentIndex <= 0 || reorderMutation.isPending}
            onClick={() => {
              void moveUp();
            }}
          >
            <HugeiconsIcon icon={ArrowUp01Icon} className="mr-2 size-4" />
            Move up
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={
              currentIndex < 0 ||
              currentIndex >= taskIds.length - 1 ||
              reorderMutation.isPending
            }
            onClick={() => {
              void moveDown();
            }}
          >
            <HugeiconsIcon icon={ArrowDown01Icon} className="mr-2 size-4" />
            Move down
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSprintDialogOpen(true)}>
            <HugeiconsIcon
              icon={AddCircleHalfDotIcon}
              className="mr-2 size-4"
            />
            Đưa vào sprint
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
            <HugeiconsIcon icon={File01Icon} className="mr-2 size-4" />
            Lưu trữ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lưu trữ issue này?</AlertDialogTitle>
            <AlertDialogDescription>
              Issue sẽ bị ẩn khỏi backlog sau khi lưu trữ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiveMutation.isPending}>
              {t("tasks.common.close")}
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={archiveMutation.isPending}
              onClick={() => {
                void archiveMutation.mutateAsync().then(
                  () => {
                    setArchiveOpen(false);
                    appToast.success({
                      title: t("tasks.projectDetails.tab.backlog"),
                      description: "Đã lưu trữ issue khỏi backlog.",
                    });
                  },
                  (error: unknown) => {
                    appToast.warning({
                      title: t("tasks.projectDetails.loadTasksFailedTitle"),
                      description:
                        error instanceof Error
                          ? error.message
                          : t("tasks.projectDetails.loadTasksFailedDescription"),
                    });
                  },
                );
              }}
            >
              Lưu trữ
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={sprintDialogOpen} onOpenChange={setSprintDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đưa issue vào sprint</AlertDialogTitle>
            <AlertDialogDescription>
              Chọn sprint target cho issue này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Select value={targetSprintId} onValueChange={setTargetSprintId}>
              <SelectTrigger>
                <SelectValue placeholder="Sprint target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__AUTO__">
                  {t("tasks.projectDetails.sprintTargetAuto")}
                </SelectItem>
                {availableSprintTargets.map((sprint) => (
                  <SelectItem key={sprint.id} value={sprint.id}>
                    {sprint.name} ({sprint.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={addToSprintMutation.isPending}>
              {t("tasks.common.close")}
            </AlertDialogCancel>
            <Button
              disabled={addToSprintMutation.isPending}
              onClick={() => {
                void handleAddToSprint();
              }}
            >
              Add
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
