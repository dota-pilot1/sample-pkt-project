import { apiRequest } from "@/shared/api/client";
import type { Permission } from "@/features/permission/api";

/** 역할 관리와 역할-권한 매핑 화면이 공유하는 서버 응답 모델이다. */
export type Role = {
  id: number;
  roleCode: string;
  name: string;
  enabled: boolean;
  createdAt: string;
};

export type RolePermissionMapping = {
  roleId: number;
  permissions: Permission[];
};

export const roleApi = {
  // 역할 선택 목록과 역할별 권한 체크 UI의 초기 데이터를 조회한다.
  findAll: () => apiRequest<Role[]>("/api/roles"),
  permissions: (roleId: number) =>
    apiRequest<RolePermissionMapping>(`/api/roles/${roleId}/permissions`),
  // 선택한 ID 배열 전체로 기존 역할 권한 집합을 교체한다.
  assignSelectedPermissionsToRole: (roleId: number, permissionIds: number[]) =>
    apiRequest<RolePermissionMapping>(`/api/roles/${roleId}/permissions`, {
      method: "PATCH",
      body: { permissionIds },
    }),
};
