export type SignUpRequest = {
  email: string;
  password: string;
  displayName: string;
};

export type SignUpResponse = {
  id: number;
  email: string;
  displayName: string;
  active: boolean;
  roleCode: string;
  createdAt: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

/** 로그인 성공 뒤 콘솔 화면에서 사용할 최소 사용자 정보다. */
export type LoggedInUser = {
  id: number;
  email: string;
  displayName: string;
  roleCodes: string[];
};
