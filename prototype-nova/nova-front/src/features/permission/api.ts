import { apiRequest } from "@/shared/api/client";
import type { PermissionCategory } from "./category-api";

/** 권한 관리 화면과 백엔드가 공유하는 권한 API 응답 모델이다. */
export type Permission = {
  id: number;
  permissionCode: string;
  name: string;
  description: string;
  category: PermissionCategory | null;
  enabled: boolean;
  createdAt: string;
};

export type CreatePermissionRequest = Pick<Permission, "permissionCode" | "name" | "description"> & { categoryId: number };
export type UpdatePermissionRequest = Pick<Permission, "name" | "description"> & { categoryId: number };

export const permissionApi = {
  findAll: () => apiRequest<Permission[]>("/api/permissions"),
  create: (body: CreatePermissionRequest) =>
    apiRequest<Permission>("/api/permissions", { method: "POST", body }),
  update: (id: number, body: UpdatePermissionRequest) =>
    apiRequest<Permission>(`/api/permissions/${id}`, { method: "PATCH", body }),
  changeEnabled: (id: number, enabled: boolean) =>
    apiRequest<Permission>(`/api/permissions/${id}/enabled`, { method: "PATCH", body: { enabled } }),
};
