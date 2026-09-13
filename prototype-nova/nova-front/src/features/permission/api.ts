import { apiRequest } from "@/shared/api/client";

/** 권한 관리 화면과 백엔드가 공유하는 권한 API 응답 모델이다. */
export type Permission = {
  id: number;
  permissionCode: string;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: string;
};

export type CreatePermissionRequest = Pick<Permission, "permissionCode" | "name" | "description">;
export type UpdatePermissionRequest = Pick<Permission, "name" | "description">;

export const permissionApi = {
  findAll: () => apiRequest<Permission[]>("/api/permissions"),
  create: (body: CreatePermissionRequest) =>
    apiRequest<Permission>("/api/permissions", { method: "POST", body }),
  update: (id: number, body: UpdatePermissionRequest) =>
    apiRequest<Permission>(`/api/permissions/${id}`, { method: "PATCH", body }),
  changeEnabled: (id: number, enabled: boolean) =>
    apiRequest<Permission>(`/api/permissions/${id}/enabled`, { method: "PATCH", body: { enabled } }),
};
