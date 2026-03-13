import { apiClient } from "@/shared/api/http";
import { normalizeStatusCode } from "./helpers/workflowHelpers";
import { listTasks, type ListTasksParams } from "./projectManagement.api";
import type { TaskItem, TaskPriority } from "./types";

const TASKS_BASE_PATH = "/task-management-service/api/v1/tasks";

type BackendTaskItem = {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  assignee: string | null;
  status: string;
  priority: string;
  sprintId: string | null;
  backlogOrder: number | null;
  updatedAt: string;
};

type ListBacklogTasksParams = Omit<ListTasksParams, "sprintId">;

export async function listBacklogTasks(
  params: ListBacklogTasksParams,
): Promise<Awaited<ReturnType<typeof listTasks>>> {
  const response = await listTasks({
    ...params,
    sortBy: params.sortBy ?? "BACKLOG_ORDER",
    sortDirection: params.sortDirection ?? "ASC",
    page: params.page ?? 1,
    size: params.size ?? 200,
  });

  return {
    ...response,
    items: response.items.filter((task) => !task.sprintId),
    total: response.items.filter((task) => !task.sprintId).length,
    totalPages: 1,
    page: 1,
    size: params.size ?? 200,
  };
}

export async function reorderBacklogTask(
  taskId: string,
  payload: {
    projectId: string;
    beforeTaskId: string | null;
    afterTaskId: string | null;
  },
): Promise<TaskItem> {
  const response = await apiClient.patch<BackendTaskItem>(
    `${TASKS_BASE_PATH}/${taskId}/backlog-order`,
    payload,
  );

  return mapTaskItem(response.data);
}

export async function addBacklogTaskToSprint(
  taskId: string,
  payload: {
    projectId: string;
    sprintId: string | null;
  },
): Promise<TaskItem> {
  const response = await apiClient.patch<BackendTaskItem>(
    `${TASKS_BASE_PATH}/${taskId}/sprint`,
    payload,
  );

  return mapTaskItem(response.data);
}

export async function bulkAssignBacklogTasks(
  payload: {
    projectId: string;
    taskIds: string[];
    assigneeId: string | null;
  },
): Promise<void> {
  await apiClient.patch(`${TASKS_BASE_PATH}/bulk/assignee`, payload);
}

export async function bulkChangeBacklogPriority(
  payload: {
    projectId: string;
    taskIds: string[];
    priority: TaskPriority;
  },
): Promise<void> {
  await apiClient.patch(`${TASKS_BASE_PATH}/bulk/priority`, payload);
}

export async function bulkAddBacklogTasksToSprint(
  payload: {
    projectId: string;
    taskIds: string[];
    sprintId: string;
  },
): Promise<void> {
  await apiClient.patch(`${TASKS_BASE_PATH}/bulk/sprint`, payload);
}

export async function bulkArchiveBacklogTasks(payload: {
  projectId: string;
  taskIds: string[];
}): Promise<void> {
  await apiClient.post(`${TASKS_BASE_PATH}/bulk/archive`, payload);
}

export async function cloneBacklogTask(
  taskId: string,
  payload: {
    projectId: string;
  },
): Promise<TaskItem> {
  const response = await apiClient.post<BackendTaskItem>(
    `${TASKS_BASE_PATH}/${taskId}/clone`,
    payload,
  );

  return mapTaskItem(response.data);
}

function mapTaskItem(item: BackendTaskItem): TaskItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description || "",
    projectId: item.projectId,
    assignee: item.assignee,
    status: normalizeStatusCode(item.status),
    priority: item.priority,
    sprintId: item.sprintId,
    backlogOrder: item.backlogOrder ?? 0,
    updatedAt: item.updatedAt,
  };
}
