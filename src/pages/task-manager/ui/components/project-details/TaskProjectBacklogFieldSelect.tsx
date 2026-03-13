import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  getWorkflowStatusMeta,
  getWorkflowStatusStyle,
} from "../../../model/helpers/workflowStatusHelpers";
import { updateTask as updateTaskApi } from "../../../model/projectManagement.api";
import type { TaskItem, TaskPriorityItem } from "../../../model/types";

type TaskProjectBacklogFieldSelectProps =
  | {
      kind: "priority";
      projectId: string;
      task: TaskItem;
      taskPriorities: TaskPriorityItem[];
    }
  | {
      kind: "status";
      projectId: string;
      task: TaskItem;
      workflow: string[];
      workflowStatusByCode: Map<string, { name: string; color: string }>;
    };

const TASK_PROJECT_BACKLOG_QUERY_KEY = "task-project-backlog-tasks";
const TASK_PROJECT_TASKS_QUERY_KEY = "task-project-tasks";
const TASK_PROJECT_KANBAN_TASKS_QUERY_KEY = "task-project-kanban-tasks";

export function TaskProjectBacklogFieldSelect(
  props: TaskProjectBacklogFieldSelectProps,
) {
  const { t } = useI18n();
  const appToast = useAppToast();
  const queryClient = useQueryClient();
  const updateTaskMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateTaskApi>[1]) =>
      updateTaskApi(props.task.id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [TASK_PROJECT_BACKLOG_QUERY_KEY, props.projectId],
      });
      await queryClient.invalidateQueries({
        queryKey: [TASK_PROJECT_TASKS_QUERY_KEY, props.projectId],
      });
      await queryClient.invalidateQueries({
        queryKey: [TASK_PROJECT_KANBAN_TASKS_QUERY_KEY, props.projectId],
      });
    },
  });

  const handleUpdate = async (nextValue: string) => {
    try {
      await updateTaskMutation.mutateAsync({
        title: props.task.title,
        description: props.task.description,
        projectId: props.task.projectId,
        assignee: props.task.assignee,
        status: props.kind === "status" ? nextValue : props.task.status,
        priority: props.kind === "priority" ? nextValue : props.task.priority,
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
  const selectedPriority =
    props.kind === "priority"
      ? props.taskPriorities.find(
          (priority) => priority.code === props.task.priority,
        ) || null
      : null;
  const selectedStatus =
    props.kind === "status"
      ? getWorkflowStatusMeta(props.workflowStatusByCode, props.task.status)
      : null;

  if (props.kind === "priority") {
    return (
      <Select
        value={props.task.priority}
        onValueChange={(value) => {
          void handleUpdate(value);
        }}
      >
        <SelectTrigger
          className="h-8 w-[118px] rounded-full border text-xs font-semibold"
          style={getPriorityStyle(selectedPriority?.color || "#6B7280")}
        >
          <SelectValue>
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: selectedPriority?.color || "#6B7280",
                }}
              />
              <span className="truncate">
                {selectedPriority?.name || props.task.priority}
              </span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {props.taskPriorities.map((priority) => (
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
    );
  }

  return (
    <Select
      value={props.task.status}
      onValueChange={(value) => {
        void handleUpdate(value);
      }}
    >
      <SelectTrigger
        className="h-8 w-[132px] rounded-full border-2 text-xs font-semibold"
        style={getWorkflowStatusStyle(
          props.workflowStatusByCode,
          props.task.status,
        )}
      >
        <SelectValue>
          <span className="flex min-w-0 items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{
                backgroundColor: selectedStatus?.color || "#6B7280",
              }}
            />
            <span className="truncate">
              {selectedStatus?.name || props.task.status}
            </span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {props.workflow.map((status) => {
          const statusMeta = getWorkflowStatusMeta(
            props.workflowStatusByCode,
            status,
          );

          return (
            <SelectItem key={status} value={status}>
              <span className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: statusMeta.color }}
                />
                {statusMeta.name}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function getPriorityStyle(color: string) {
  return {
    borderColor: color,
    color,
    backgroundColor: hexToRgba(color, 0.12),
  };
}

function hexToRgba(color: string, alpha: number) {
  const normalized = color.replace("#", "");

  if (!/^[\da-fA-F]{6}$/.test(normalized)) {
    return `rgba(107,114,128,${alpha})`;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
