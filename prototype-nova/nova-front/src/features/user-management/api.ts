import { apiRequest } from "@/shared/api/client";

export type UserRoleSummary = {
  id: number;
  roleCode: string;
  name: string;
  enabled: boolean;
};

export type UserAccessPermission = {
  code: string;
  name: string;
  description: string;
};

/** 관리자 상세 조회 응답은 선택한 역할의 권한과 전체 실효 권한을 함께 반환한다. */
export type UserAccessSummary = {
  id: number;
  email: string;
  displayName: string;
  active: boolean;
  createdAt: string;
  roles: Array<{
    code: string;
    name: string;
    permissions: UserAccessPermission[];
  }>;
  permissions: UserAccessPermission[];
};

/** 관리자 화면에 노출해도 되는 사용자 정보다. 비밀번호 정보는 절대 포함하지 않는다. */
export type ManagedUser = {
  id: number;
  email: string;
  displayName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  // 서버 재시작 전의 목록 응답에는 roles가 없을 수 있어 화면에서 빈 배열로 보정한다.
  roles?: UserRoleSummary[];
};

export type UserPage = {
  items: ManagedUser[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type UserSearch = { keyword?: string; active?: boolean; page?: number; size?: number };

/** 사용자 목록 API는 사람이 보는 것처럼 1페이지부터 받는다. */
function toSearchParams(search: UserSearch) {
  const params = new URLSearchParams();
  if (search.keyword?.trim()) params.set("keyword", search.keyword.trim());
  if (search.active !== undefined) params.set("active", String(search.active));
  params.set("page", String(search.page ?? 1));
  params.set("size", String(search.size ?? 10));
  return params.toString();
}

export const userManagementApi = {
  findPage: (search: UserSearch) => apiRequest<UserPage>(`/api/users?${toSearchParams(search)}`),
  /** 관리자 상세 Drawer는 사용자·활성 역할·실효 권한을 한 번에 조회한다. */
  getAccessSummary: (userId: number) =>
    apiRequest<UserAccessSummary>(`/api/users/${userId}/access-summary`),
  changeActive: (userId: number, active: boolean) => apiRequest<ManagedUser>(`/api/users/${userId}/active`, { method: "PATCH", body: { active } }),
};
