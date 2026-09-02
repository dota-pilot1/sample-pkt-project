/** 브라우저에 노출해도 되는 현재 로그인 사용자 정보다. */
export interface SessionUser {
  id: number;
  username: string;
  displayName: string;
}

export interface SessionResponse {
  user: SessionUser | null;
}

export interface LoginInput {
  username: string;
  password: string;
}

/** 회원가입 화면에서 서버로 전달하는 최소 계정 정보다. */
export interface RegisterInput {
  username: string;
  displayName: string;
  password: string;
}
