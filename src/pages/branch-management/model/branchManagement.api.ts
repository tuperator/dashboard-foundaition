import { API_ENDPOINTS } from "@/shared/api/endpoints";
import { apiClient } from "@/shared/api/http";
import type {
  BranchItem,
  BranchStatus,
  CreateBranchPayload,
  UpdateBranchPayload,
} from "./types";

type BackendMyProfile = {
  companyId: string | null;
};

type BackendBranchItem = {
  id: string;
  name: string;
  address: string | null;
  companyId: string | null;
  status: string | null;
  agentId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type BackendBranchListResponse = {
  items: BackendBranchItem[];
};

export async function getCurrentProfile() {
  const response = await apiClient.get<BackendMyProfile>(API_ENDPOINTS.users.me);
  return response.data;
}

export async function listBranchesByCompany(companyId: string): Promise<BranchItem[]> {
  const response = await apiClient.get<BackendBranchListResponse>(
    API_ENDPOINTS.branches.byCompany(companyId),
  );

  return response.data.items.map(mapBranchItem);
}

export async function createBranch(companyId: string, payload: CreateBranchPayload) {
  const response = await apiClient.post<BackendBranchItem>(
    API_ENDPOINTS.branches.byCompany(companyId),
    {
      name: payload.name.trim(),
      address: payload.address?.trim() || null,
      status: payload.status,
      agentId: payload.agentId?.trim() || null,
    },
  );

  return mapBranchItem(response.data);
}

export async function updateBranch(branchId: string, payload: UpdateBranchPayload) {
  const response = await apiClient.put<BackendBranchItem>(API_ENDPOINTS.branches.byId(branchId), {
    name: payload.name.trim(),
    address: payload.address?.trim() || null,
    agentId: payload.agentId?.trim() || null,
  });

  return mapBranchItem(response.data);
}

export async function updateBranchStatus(branchId: string, status: BranchStatus) {
  const response = await apiClient.patch<BackendBranchItem>(API_ENDPOINTS.branches.status(branchId), {
    status,
  });

  return mapBranchItem(response.data);
}

function mapBranchItem(item: BackendBranchItem): BranchItem {
  return {
    id: item.id,
    name: item.name,
    address: item.address,
    companyId: item.companyId,
    status: normalizeStatus(item.status),
    agentId: item.agentId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function normalizeStatus(status: string | null): BranchStatus {
  if (status === "INACTIVE") {
    return "INACTIVE";
  }
  if (status === "DELETED") {
    return "DELETED";
  }
  return "ACTIVE";
}
