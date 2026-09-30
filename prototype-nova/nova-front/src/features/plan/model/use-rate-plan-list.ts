"use client";

import { useQuery } from "@tanstack/react-query";
import { ratePlanApi, type RatePlanListQuery } from "../api";

/** 요금제 목록 조건과 서버 조회 상태를 UI 컴포넌트에서 분리한다. */
export function useRatePlanList(query: RatePlanListQuery) {
  return useQuery({
    queryKey: ["rate-plans", query],
    queryFn: () => ratePlanApi.findPage(query),
  });
}
