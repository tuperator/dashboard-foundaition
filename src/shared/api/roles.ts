import { API_ENDPOINTS } from "./endpoints";
import { apiClient } from "./http";

export type RoleItem = {
  id: string;
  roleName: string;
};

type BackendRolesResponse = {
  items: RoleItem[];
};

export async function listRoles() {
  const response = await apiClient.get<BackendRolesResponse>(API_ENDPOINTS.roles.list);

  return response.data.items
    .map((role) => ({
      id: role.id,
      roleName: role.roleName,
    }))
    .sort((a, b) => a.roleName.localeCompare(b.roleName));
}
