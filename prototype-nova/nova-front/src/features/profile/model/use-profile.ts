"use client";

import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../api";

/** access token의 인증 주체를 기준으로 내 프로필을 조회한다. */
export function useProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: profileApi.get,
  });
}
