"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { lotApi, type LotStatus } from "@/entities/lot";

export function useLotList() {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<LotStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [productCode, setProductCode] = useState("");
  const [process, setProcess] = useState("");
  const [tester, setTester] = useState("");

  /** 모든 조회 조건을 키에 포함해 서로 다른 검색 결과가 섞이지 않게 한다. */
  const lotPageQuery = useQuery({
    queryKey: [
      "lots",
      page,
      pageSize,
      query,
      filterStatus,
      productCode,
      process,
      tester,
    ],
    queryFn: () =>
      lotApi.getPage({
        page,
        size: pageSize,
        keyword: query.trim(),
        status: filterStatus,
        productCode,
        process,
        tester,
      }),
    // 다음 페이지를 가져오는 동안 이전 행을 유지해 표가 빈 화면으로 깜빡이지 않게 한다.
    placeholderData: (previous) => previous,
  });

  /** 하드코딩된 선택지 대신 현재 서버 LOT 데이터에서 필터 값을 조회한다. */
  const filterOptionsQuery = useQuery({
    queryKey: ["lot-filter-options"],
    queryFn: lotApi.getFilterOptions,
    staleTime: 5 * 60 * 1000,
  });

  return {
    query,
    setQuery,
    filterStatus,
    setFilterStatus,
    productCode,
    setProductCode,
    process,
    setProcess,
    tester,
    setTester,
    page,
    setPage,
    pageSize,
    setPageSize,
    filterOptions: filterOptionsQuery.data,
    isFilterOptionsLoading: filterOptionsQuery.isLoading,
    ...lotPageQuery,
  };
}
