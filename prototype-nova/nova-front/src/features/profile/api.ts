import { apiRequest } from "@/shared/api/client";
import type { Profile } from "./model/types";

export type { Profile } from "./model/types";

/** Bearer token의 인증 주체를 기준으로 자기 자신의 프로필만 조회한다. */
export const profileApi = {
  get: () => apiRequest<Profile>("/api/users/me/profile"),
};
