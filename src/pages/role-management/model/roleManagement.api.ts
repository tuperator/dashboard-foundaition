import { listRoles } from "@/shared/api/roles";
import type { RoleRecord, RoleScope, RoleType } from "./types";

export async function getRoleCatalog(): Promise<RoleRecord[]> {
  const roles = await listRoles();

  return roles.map((role) => ({
    id: role.id,
    roleName: role.roleName,
    type: resolveRoleType(role.roleName),
    scope: resolveRoleScope(role.roleName),
  }));
}

function resolveRoleType(roleName: string): RoleType {
  const normalized = roleName.toUpperCase();

  if (normalized.includes("ADMIN")) {
    return "ADMIN";
  }
  if (normalized.includes("MANAGER")) {
    return "MANAGER";
  }
  if (normalized.startsWith("OPER_")) {
    return "OPERATION";
  }
  return "CUSTOM";
}

function resolveRoleScope(roleName: string): RoleScope {
  const normalized = roleName.toUpperCase();

  if (normalized.includes("ADMIN")) {
    return "GLOBAL";
  }
  if (normalized.startsWith("OPER_") || normalized.includes("MANAGER")) {
    return "BUSINESS";
  }
  return "CUSTOM";
}
