"use client";

import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../api";

/** 사용자 ID가 준비된 뒤에만 프로필을 조회하고, 사용자별 결과를 별도 캐시로 유지한다. */
export function useProfile(userId: number | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => profileApi.get(userId!),
    enabled: userId !== undefined,
  });
}
