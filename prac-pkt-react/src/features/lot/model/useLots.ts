import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchLots } from "../api/lot.api";
import type { LotSort } from "./lot.types";

/** 정렬 조건까지 queryKey에 넣어야 정렬이 바뀔 때 캐시가 섞이지 않는다. */
export function lotsQueryKey(page: number, size: number, sort: LotSort) {
  return ["lots", page, size, sort.field, sort.direction] as const;
}

export function useLots(page: number, size: number, sort: LotSort) {
  return useQuery({
    queryKey: lotsQueryKey(page, size, sort),
    queryFn: () => fetchLots(page, size, sort),
    staleTime: 30_000,
    // 페이지를 넘길 때 표가 비어 보이지 않도록 이전 페이지를 유지한다.
    placeholderData: keepPreviousData,
  });
}
