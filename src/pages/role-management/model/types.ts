export type RoleType = "ADMIN" | "MANAGER" | "OPERATION" | "CUSTOM";
export type RoleScope = "GLOBAL" | "BUSINESS" | "CUSTOM";

export type RoleRecord = {
  id: string;
  roleName: string;
  type: RoleType;
  scope: RoleScope;
};
