import { API_ENDPOINTS } from "@/shared/api/endpoints";
import { apiClient } from "@/shared/api/http";
import { normalizeSprintStatus } from "./helpers/taskHelpers";
import type {
  CreateSprintPayload,
  SprintItem,
  SprintStatus,
  UpdateSprintPayload,
} from "./types";

type BackendSprintItem = {
  id: string;
  projectId: string;
  name: string | null;
  goal: string | null;
  startDate: string;
  endDate: string;
  status: string | null;
  createdAt: string | null;
};

type BackendSprintListResponse = {
  items: BackendSprintItem[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

type ListSprintsParams = {
  projectId: string;
  page?: number;
  size?: number;
  status?: SprintStatus | null;
  sortBy?: "CREATED_AT" | "START_DATE" | "END_DATE";
  sortDirection?: "ASC" | "DESC";
};

export async function listSprints(
  params: ListSprintsParams,
): Promise<Omit<BackendSprintListResponse, "items"> & { items: SprintItem[] }> {
  const response = await apiClient.get<BackendSprintListResponse>(
    API_ENDPOINTS.taskManagement.sprints.list,
    {
      params: {
        projectId: params.projectId,
        page: params.page ?? 1,
        size: params.size ?? 100,
        status: params.status || undefined,
        sortBy: params.sortBy ?? "START_DATE",
        sortDirection: params.sortDirection ?? "DESC",
      },
    },
  );

  return {
    ...response.data,
    items: response.data.items.map(mapSprintItem),
  };
}

export async function createSprint(
  payload: CreateSprintPayload,
): Promise<SprintItem> {
  const response = await apiClient.post<BackendSprintItem>(
    API_ENDPOINTS.taskManagement.sprints.list,
    {
      projectId: payload.projectId,
      name: payload.name.trim(),
      goal: payload.goal.trim(),
      startDate: payload.startDate,
      endDate: payload.endDate,
    },
  );

  return mapSprintItem(response.data);
}

export async function updateSprint(
  sprintId: string,
  payload: UpdateSprintPayload,
): Promise<SprintItem> {
  const response = await apiClient.put<BackendSprintItem>(
    API_ENDPOINTS.taskManagement.sprints.byId(sprintId),
    {
      name: payload.name.trim(),
      goal: payload.goal.trim(),
      startDate: payload.startDate,
      endDate: payload.endDate,
    },
  );

  return mapSprintItem(response.data);
}

export async function changeSprintStatus(
  sprintId: string,
  status: SprintStatus,
): Promise<SprintItem> {
  const response = await apiClient.patch<BackendSprintItem>(
    API_ENDPOINTS.taskManagement.sprints.status(sprintId),
    { status },
  );

  return mapSprintItem(response.data);
}

export async function archiveSprint(sprintId: string): Promise<void> {
  await apiClient.post(API_ENDPOINTS.taskManagement.sprints.archive(sprintId));
}

function mapSprintItem(item: BackendSprintItem): SprintItem {
  return {
    id: item.id,
    projectId: item.projectId,
    name: item.name?.trim() || "Sprint",
    goal: item.goal?.trim() || "",
    startDate: item.startDate,
    endDate: item.endDate,
    status: normalizeSprintStatus(item.status || ""),
    createdAt: item.createdAt || new Date().toISOString(),
  };
}
