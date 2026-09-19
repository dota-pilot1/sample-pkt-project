import type { LoggedInUser, LoginRequest } from "@/entities/user/model/types";
import { apiRequest } from "@/shared/api/client";

/** 백엔드 POST /login 인증 계약을 호출한다. */
export async function login(payload: LoginRequest): Promise<LoggedInUser> {
  return apiRequest<LoggedInUser>("/login", {
    method: "POST",
    body: payload,
  });
}
