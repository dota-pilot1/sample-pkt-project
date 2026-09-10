import type { SignUpRequest, SignUpResponse } from "@/entities/user/model/types";
import { apiRequest } from "@/shared/api/client";

export async function signUp(payload: SignUpRequest): Promise<SignUpResponse> {
  return apiRequest<SignUpResponse>("/signup", {
    method: "POST",
    body: payload,
  });
}
