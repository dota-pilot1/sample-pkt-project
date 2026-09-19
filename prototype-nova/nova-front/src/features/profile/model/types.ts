export type ProfilePermission = {
  code: string;
  name: string;
  description: string;
};

/** 프로필 조회 API와 화면이 함께 사용하는 서버 응답 계약이다. */
export type Profile = {
  id: number;
  email: string;
  displayName: string;
  active: boolean;
  createdAt: string;
  roles: Array<{ code: string; name: string; permissions: ProfilePermission[] }>;
  permissions: ProfilePermission[];
};
