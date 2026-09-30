import { apiRequest } from "@/shared/api/client";

export type PermissionCategory = {
  id: number;
  categoryCode: string;
  name: string;
  description: string;
  sortOrder: number;
  enabled: boolean;
};

export type CreatePermissionCategoryRequest = Pick<PermissionCategory, "categoryCode" | "name" | "description" | "sortOrder">;
export type UpdatePermissionCategoryRequest = Pick<PermissionCategory, "name" | "description" | "sortOrder">;

export const permissionCategoryApi = {
  findAll: () => apiRequest<PermissionCategory[]>("/api/permission-categories"),
  create: (body: CreatePermissionCategoryRequest) => apiRequest<PermissionCategory>("/api/permission-categories", { method: "POST", body }),
  update: (id: number, body: UpdatePermissionCategoryRequest) => apiRequest<PermissionCategory>(`/api/permission-categories/${id}`, { method: "PATCH", body }),
  changeEnabled: (id: number, enabled: boolean) => apiRequest<PermissionCategory>(`/api/permission-categories/${id}/enabled`, { method: "PATCH", body: { enabled } }),
};
