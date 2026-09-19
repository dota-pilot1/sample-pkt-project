import { apiRequest } from "@/shared/api/client";
import type { Profile } from "./model/types";

export type { Profile } from "./model/types";

/** 인증 토큰이 도입되기 전에는 탭 세션에 저장된 로그인 사용자 ID로 프로필을 조회한다. */
export const profileApi = {
  // 서버 인증 주체가 생기면 userId 인자 없이 현재 주체를 조회하는 API로 전환한다.
  get: (userId: number) => apiRequest<Profile>(`/api/users/${userId}/profile`),
};
