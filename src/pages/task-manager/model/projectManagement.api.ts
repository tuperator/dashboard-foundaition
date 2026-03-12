import { API_ENDPOINTS } from "@/shared/api/endpoints";
import { apiClient } from "@/shared/api/http";
import { normalizeStatusCode } from "./helpers/workflowHelpers";
import type {
  CreateTaskPayload,
  CreateProjectPayload,
  ProjectType,
  TaskItem,
  TaskPriority,
  TaskProject,
  UpdateTaskPayload,
} from "./types";

type BackendProjectStats = {
  totalIssues: number | null;
  doneIssues: number | null;
  inProgressIssues: number | null;
  completionRate: number | null;
  updatedAt: string | null;
};

type BackendProjectListItem = {
  id: string;
  name: string;
  key: string;
  description: string | null;
  type: string;
  createdById: string;
  companyId: string;
  owner: string;
  memberCount: number | null;
  workflowId: string | null;
  stats: BackendProjectStats | null;
  createdAt: string;
  updatedAt: string;
};

type BackendProjectListResponse = {
  items: BackendProjectListItem[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

type BackendTaskListItem = {
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

type BackendTaskListResponse = {
  items: BackendTaskListItem[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

export type TaskProjectListItem = {
  id: string;
  name: string;
  key: string;
  description: string;
  type: ProjectType;
  createdById: string;
  companyId: string;
  ownerId: string;
  memberCount: number;
  workflowId: string | null;
  stats: {
    totalIssues: number;
    doneIssues: number;
    inProgressIssues: number;
    completionRate: number;
    updatedAt: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type TaskProjectDetail = TaskProject & {
  createdById: string;
  companyId: string;
  workflowId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListProjectsParams = {
  page?: number;
  size?: number;
  search?: string;
  type?: ProjectType | null;
  ownerId?: string | null;
  sortBy?: "UPDATED_AT" | "NAME" | "PROGRESS";
  sortDirection?: "ASC" | "DESC";
};

export type ListTasksParams = {
  projectId: string;
  page?: number;
  size?: number;
  search?: string;
  status?: string | null;
  assigneeId?: string | null;
  priority?: TaskPriority | null;
  sprintId?: string | null;
  sortBy?: "UPDATED_AT" | "PRIORITY" | "BACKLOG_ORDER";
  sortDirection?: "ASC" | "DESC";
};

type CreateProjectRequest = CreateProjectPayload & {
  createdById: string;
  companyId: string;
};

type CreateTaskRequest = CreateTaskPayload;
type UpdateTaskRequest = UpdateTaskPayload;

export async function listProjects(
  params: ListProjectsParams = {},
): Promise<Omit<BackendProjectListResponse, "items"> & { items: TaskProjectListItem[] }> {
  const response = await apiClient.get<BackendProjectListResponse>(
    API_ENDPOINTS.taskManagement.projects.list,
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
        search: params.search?.trim() || undefined,
        type: params.type || undefined,
        ownerId: params.ownerId || undefined,
        sortBy: params.sortBy ?? "UPDATED_AT",
        sortDirection: params.sortDirection ?? "DESC",
      },
    },
  );

  return {
    ...response.data,
    items: response.data.items.map(mapProjectListItem),
  };
}

export async function createProject(
  payload: CreateProjectRequest,
): Promise<TaskProjectListItem> {
  const response = await apiClient.post<BackendProjectListItem>(
    API_ENDPOINTS.taskManagement.projects.list,
    {
      name: payload.name.trim(),
      key: payload.key.trim().toUpperCase(),
      description: payload.description.trim(),
      type: payload.type,
      createdById: payload.createdById,
      companyId: payload.companyId,
      ownerId: payload.owner.trim(),
      memberIds: (payload.members || []).filter(
        (memberId) => memberId.trim() && memberId !== payload.owner,
      ),
      workflowId: payload.workflowId || undefined,
    },
  );

  return mapProjectListItem(response.data);
}

export async function getProjectDetail(
  projectId: string,
): Promise<TaskProjectDetail> {
  const response = await apiClient.get<{
    id: string;
    name: string;
    key: string;
    description: string | null;
    type: string;
    createdById: string;
    companyId: string;
    owner: string;
    members: string[] | null;
    workflowId: string | null;
    createdAt: string;
    updatedAt: string;
  }>(API_ENDPOINTS.taskManagement.projects.byId(projectId));

  return {
    id: response.data.id,
    name: response.data.name,
    key: response.data.key,
    description: response.data.description || "",
    type: normalizeProjectType(response.data.type),
    owner: response.data.owner,
    members: response.data.members || [],
    createdById: response.data.createdById,
    companyId: response.data.companyId,
    workflowId: response.data.workflowId ?? null,
    createdAt: response.data.createdAt,
    updatedAt: response.data.updatedAt,
  };
}

export async function createTask(
  payload: CreateTaskRequest,
): Promise<TaskItem> {
  const response = await apiClient.post<BackendTaskListItem>(
    API_ENDPOINTS.taskManagement.tasks.list,
    {
      title: payload.title.trim(),
      description: payload.description.trim(),
      projectId: payload.projectId,
      assigneeId: payload.assignee,
      status: payload.status,
      priority: payload.priority,
    },
  );

  return mapTaskListItem(response.data);
}

export async function updateTask(
  taskId: string,
  payload: UpdateTaskRequest,
): Promise<TaskItem> {
  const response = await apiClient.put<BackendTaskListItem>(
    API_ENDPOINTS.taskManagement.tasks.byId(taskId),
    {
      title: payload.title.trim(),
      description: payload.description.trim(),
      projectId: payload.projectId,
      assigneeId: payload.assignee,
      status: payload.status,
      priority: payload.priority,
    },
  );

  return mapTaskListItem(response.data);
}

export async function archiveTask(taskId: string): Promise<void> {
  await apiClient.post(API_ENDPOINTS.taskManagement.tasks.archive(taskId));
}

export async function listTasks(
  params: ListTasksParams,
): Promise<Omit<BackendTaskListResponse, "items"> & { items: TaskItem[] }> {
  const response = await apiClient.get<BackendTaskListResponse>(
    API_ENDPOINTS.taskManagement.tasks.list,
    {
      params: {
        projectId: params.projectId,
        page: params.page ?? 1,
        size: params.size ?? 200,
        search: params.search?.trim() || undefined,
        status: params.status ? normalizeStatusCode(params.status) : undefined,
        assigneeId: params.assigneeId || undefined,
        priority: params.priority || undefined,
        sprintId: params.sprintId || undefined,
        sortBy: params.sortBy ?? "UPDATED_AT",
        sortDirection: params.sortDirection ?? "DESC",
      },
    },
  );

  return {
    ...response.data,
    items: response.data.items.map(mapTaskListItem),
  };
}

function mapProjectListItem(item: BackendProjectListItem): TaskProjectListItem {
  return {
    id: item.id,
    name: item.name,
    key: item.key,
    description: item.description || "",
    type: normalizeProjectType(item.type),
    createdById: item.createdById,
    companyId: item.companyId,
    ownerId: item.owner,
    memberCount: item.memberCount ?? 0,
    workflowId: item.workflowId ?? null,
    stats: {
      totalIssues: item.stats?.totalIssues ?? 0,
      doneIssues: item.stats?.doneIssues ?? 0,
      inProgressIssues: item.stats?.inProgressIssues ?? 0,
      completionRate: item.stats?.completionRate ?? 0,
      updatedAt: item.stats?.updatedAt ?? null,
    },
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function normalizeProjectType(value: string): ProjectType {
  return value === "KANBAN" ? "KANBAN" : "SCRUM";
}

function mapTaskListItem(item: BackendTaskListItem): TaskItem {
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
