"use client";

import { useQuery } from "@tanstack/react-query";
import { userManagementApi } from "@/features/user-management/api";

/** 선택된 사용자 ID가 있을 때만 상세 역할·실효 권한을 조회하는 React Query 경계다. */
export function useUserAccessSummary(userId: number | null) {
  return useQuery({
    queryKey: ["admin-user-access-summary", userId],
    queryFn: () => userManagementApi.getAccessSummary(userId!),
    enabled: userId !== null,
  });
}
