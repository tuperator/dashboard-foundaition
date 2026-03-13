import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  bulkAddBacklogTasksToSprint,
  bulkArchiveBacklogTasks,
  bulkAssignBacklogTasks,
  bulkChangeBacklogPriority,
} from "../../../model/backlogManagement.api";
import type {
  SprintItem,
  TaskManagerUserOption,
  TaskPriorityItem,
} from "../../../model/types";

type TaskProjectBacklogBulkActionsProps = {
  projectId: string;
  selectedTaskIds: string[];
  assigneeOptions: TaskManagerUserOption[];
  taskPriorities: TaskPriorityItem[];
  availableSprintTargets: SprintItem[];
  onCompleted: () => void;
};

const TASK_PROJECT_BACKLOG_QUERY_KEY = "task-project-backlog-tasks";
const TASK_PROJECT_TASKS_QUERY_KEY = "task-project-tasks";
const TASK_PROJECT_KANBAN_TASKS_QUERY_KEY = "task-project-kanban-tasks";
const TASK_PROJECT_SPRINTS_QUERY_KEY = "task-project-sprints";

export function TaskProjectBacklogBulkActions({
  projectId,
  selectedTaskIds,
  assigneeOptions,
  taskPriorities,
  availableSprintTargets,
  onCompleted,
}: TaskProjectBacklogBulkActionsProps) {
  const { t } = useI18n();
  const appToast = useAppToast();
  const queryClient = useQueryClient();
  const [assigneeId, setAssigneeId] = useState("__UNASSIGNED__");
  const [priorityCode, setPriorityCode] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [archiveOpen, setArchiveOpen] = useState(false);

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

  const assignMutation = useMutation({
    mutationFn: () =>
      bulkAssignBacklogTasks({
        projectId,
        taskIds: selectedTaskIds,
        assigneeId: assigneeId === "__UNASSIGNED__" ? null : assigneeId,
      }),
    onSuccess: invalidateAll,
  });
  const priorityMutation = useMutation({
    mutationFn: () =>
      bulkChangeBacklogPriority({
        projectId,
        taskIds: selectedTaskIds,
        priority: priorityCode,
      }),
    onSuccess: invalidateAll,
  });
  const sprintMutation = useMutation({
    mutationFn: () =>
      bulkAddBacklogTasksToSprint({
        projectId,
        taskIds: selectedTaskIds,
        sprintId,
      }),
    onSuccess: invalidateAll,
  });
  const archiveMutation = useMutation({
    mutationFn: () =>
      bulkArchiveBacklogTasks({
        projectId,
        taskIds: selectedTaskIds,
      }),
    onSuccess: invalidateAll,
  });

  const withFeedback = async (action: () => Promise<void>, success: string) => {
    try {
      await action();
      appToast.success({
        title: t("tasks.projectDetails.sprintManagement"),
        description: success,
      });
      onCompleted();
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

  if (selectedTaskIds.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-muted/35 rounded-xl border p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-foreground text-sm font-medium">
            {selectedTaskIds.length} issue được chọn
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setArchiveOpen(true)}
            disabled={archiveMutation.isPending}
          >
            Lưu trữ hàng loạt
          </Button>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="flex items-center gap-2">
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Gán người phụ trách" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__UNASSIGNED__">Unassigned</SelectItem>
                {assigneeOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              disabled={assignMutation.isPending}
              onClick={() => {
                void withFeedback(
                  () => assignMutation.mutateAsync(),
                  "Đã cập nhật assignee cho các issue đã chọn.",
                );
              }}
            >
              Gán
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Select value={priorityCode} onValueChange={setPriorityCode}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Đổi độ ưu tiên" />
              </SelectTrigger>
              <SelectContent>
                {taskPriorities.map((priority) => (
                  <SelectItem key={priority.code} value={priority.code}>
                    {priority.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              disabled={!priorityCode || priorityMutation.isPending}
              onClick={() => {
                void withFeedback(
                  () => priorityMutation.mutateAsync(),
                  "Đã cập nhật priority cho các issue đã chọn.",
                );
              }}
            >
              Đổi
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Select value={sprintId} onValueChange={setSprintId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Đưa vào sprint" />
              </SelectTrigger>
              <SelectContent>
                {availableSprintTargets.map((sprint) => (
                  <SelectItem key={sprint.id} value={sprint.id}>
                    {sprint.name} ({sprint.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              disabled={!sprintId || sprintMutation.isPending}
              onClick={() => {
                void withFeedback(
                  () => sprintMutation.mutateAsync(),
                  "Đã thêm các issue đã chọn vào sprint.",
                );
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lưu trữ các issue đã chọn?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ lưu trữ {selectedTaskIds.length} issue khỏi backlog
              hiện tại.
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
                void withFeedback(
                  async () => {
                    await archiveMutation.mutateAsync();
                    setArchiveOpen(false);
                  },
                  "Đã lưu trữ các issue đã chọn.",
                );
              }}
            >
              Lưu trữ
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
