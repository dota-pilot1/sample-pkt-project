"use client";

import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
} from "ag-grid-community";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ListFilter,
  PackageSearch,
  Plus,
  RefreshCw,
  Rows3,
} from "lucide-react";
import type { Lot, LotQualityStatus, LotStatus, ProductClassification } from "@/entities/lot";
import { Select } from "@/shared/ui/Select";
import { getPageItems } from "../model/pagination";
import { useLotList } from "../model/useLotList";
import { LotDetailDrawer } from "./LotDetailDrawer";
import { LotCreateDialog } from "./LotCreateDialog";

ModuleRegistry.registerModules([AllCommunityModule]);

const statusMeta: Record<LotStatus, { label: string; className: string }> = {
  WAIT: { label: "대기", className: "bg-slate-100 text-slate-700" },
  RUN: { label: "진행", className: "bg-sky-100 text-sky-700" },
  HOLD: { label: "보류", className: "bg-amber-100 text-amber-800" },
  DONE: { label: "완료", className: "bg-emerald-100 text-emerald-700" },
  FAIL: { label: "실패", className: "bg-rose-100 text-rose-700" },
};

const statusOptions = [
  { value: "ALL", label: "모든 상태" },
  ...Object.entries(statusMeta).map(([value, meta]) => ({
    value,
    label: meta.label,
  })),
];
const pageSizeOptions = [20, 50, 100].map((size) => ({
  value: size,
  label: `${size}건`,
}));
const classificationMeta: Record<ProductClassification, { label: string; className: string }> = {
  MATERIAL: { label: "자재", className: "bg-slate-100 text-slate-700" },
  SEMI_FINISHED: { label: "반제품", className: "bg-sky-50 text-sky-700" },
  FINISHED_GOOD: { label: "완제품", className: "bg-emerald-50 text-emerald-700" },
};
const qualityMeta: Record<LotQualityStatus, { label: string; className: string }> = {
  WAITING: { label: "판정 대기", className: "bg-slate-100 text-slate-600" },
  CRITERIA_MISSING: { label: "기준 미등록", className: "bg-amber-100 text-amber-800" },
  DATA_MISSING: { label: "데이터 없음", className: "bg-amber-100 text-amber-800" },
  PASS: { label: "통과 · 출하 가능", className: "bg-emerald-100 text-emerald-700" },
  FAIL: { label: "실패", className: "bg-rose-100 text-rose-700" },
};

function EmptyCellValue() {
  return <span className="block w-full text-center text-muted-foreground">-</span>;
}

export function LotAgGrid() {
  const [activeLot, setActiveLot] = useState<Lot | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const {
    data,
    isFetching,
    isError,
    refetch,
    page,
    pageSize,
    query,
    setPage,
    setPageSize,
    setQuery,
    setFilterStatus,
    filterStatus,
    productCode,
    setProductCode,
    process,
    setProcess,
    filterOptions,
    isFilterOptionsLoading,
  } = useLotList();
  const productOptions = [
    { value: "", label: "전체 제품" },
    ...(filterOptions?.productCodes ?? []).map((value) => ({ value, label: value })),
  ];
  const processOptions = [
    { value: "", label: "전체 공정" },
    ...(filterOptions?.processes ?? []).map((value) => ({ value, label: value })),
  ];
  /** 서버 페이지 응답을 AG Grid 행과 화면용 페이지 범위로 변환한다. */
  const rows = data?.content ?? [];
  const totalPages = Math.max(data?.totalPages ?? 0, 1);
  const startRow = data?.totalElements ? page * pageSize + 1 : 0;
  const endRow = Math.min((page + 1) * pageSize, data?.totalElements ?? 0);
  const pageItems = getPageItems(page, totalPages);

  /** 선택 LOT을 먼저 렌더링한 뒤, 다음 프레임에 슬라이드 인 전환을 시작한다. */
  const openDetail = (lot: Lot) => {
    setActiveLot(lot);
    window.requestAnimationFrame(() => setIsDetailOpen(true));
  };

  /** 슬라이드 아웃이 끝날 때까지 대상 데이터를 유지한 뒤 화면 트리에서 제거한다. */
  const closeDetail = () => {
    setIsDetailOpen(false);
    window.setTimeout(() => setActiveLot(null), 300);
  };

  /** Escape도 버튼·배경 클릭과 같은 닫기 경로를 사용하게 한다. */
  useEffect(() => {
    if (!activeLot) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetail();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeLot]);

  /** 렌더링마다 Grid 컬럼 정의가 다시 만들어지는 것을 방지한다. */
  const columnDefs = useMemo<ColDef<Lot>[]>(
    () => [
      {
        field: "lotCode",
        headerName: "LOT 번호",
        minWidth: 170,
        pinned: "left",
        headerClass: "lot-plan-header",
        cellClass: "lot-plan-cell",
      },
      {
        field: "productCode",
        headerName: "제품 코드",
        minWidth: 150,
        pinned: "left",
        headerClass: "lot-plan-header",
        cellClass: "lot-plan-cell",
      },
      {
        field: "productClassification",
        headerName: "제품 구분",
        width: 105,
        headerClass: "lot-plan-header",
        cellClass: "lot-plan-cell",
        cellRenderer: ({ value }: { value: ProductClassification }) => {
          // 새 필드는 서버 재시작 전 기존 응답에 없을 수 있어 P&T LOT 기본값으로 안전하게 표시한다.
          const meta = classificationMeta[value] ?? classificationMeta.SEMI_FINISHED;
          return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>;
        },
      },
      { field: "process", headerName: "현재 공정", minWidth: 135, headerClass: "lot-plan-header", cellClass: "lot-plan-cell" },
      {
        field: "quantity",
        headerName: "계획 수량",
        width: 115,
        headerClass: "lot-plan-header",
        cellClass: "lot-plan-cell",
        cellRenderer: ({ value }: { value: number | null | undefined }) =>
          value == null ? (
            <EmptyCellValue />
          ) : (
            <span className="block text-right">{value.toLocaleString()} EA</span>
          ),
      },
      {
        field: "status",
        headerName: "상태",
        width: 105,
        cellRenderer: ({ value }: { value: LotStatus }) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta[value].className}`}
          >
            {statusMeta[value].label}
          </span>
        ),
      },
      {
        headerName: "정상 / 불량",
        width: 130,
        headerClass: "test-data-header test-data-divider",
        cellClass: "test-data-cell test-data-divider",
        cellRenderer: ({ data }: { data?: Lot }) =>
          data?.goodQuantity == null || data.defectQuantity == null ? (
            <EmptyCellValue />
          ) : (
            <span className="block text-right">
              {data.goodQuantity.toLocaleString()} / {data.defectQuantity.toLocaleString()}
            </span>
          ),
      },
      {
        field: "yieldRate",
        headerName: "수율",
        width: 95,
        headerClass: "test-data-header",
        cellClass: "test-data-cell",
        cellRenderer: ({ value }: { value: number | null | undefined }) =>
          value == null ? (
            <EmptyCellValue />
          ) : (
            <span className="block text-right">{value.toFixed(1)}%</span>
          ),
      },
      { field: "qualityStatus", headerName: "품질 상태", minWidth: 160, headerClass: "test-data-header", cellClass: "test-data-cell", cellRenderer: ({ data }: { data?: Lot }) => { const status = data?.qualityStatus; if (!status) return <EmptyCellValue />; const meta = qualityMeta[status]; return <span title={data?.qualityMessage ?? undefined} className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>{status === "FAIL" && data?.qualityMessage ? data.qualityMessage : meta.label}</span>; } },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef<Lot>>(
    () => ({ sortable: true, filter: true, resizable: true }),
    [],
  );

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-muted/20 px-4 py-4 sm:px-8 sm:py-5">
      <section className="mx-auto max-w-none">
        <div className="flex flex-col gap-3 py-1 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-baseline gap-3">
            <p className="text-xs font-bold tracking-[0.16em] text-primary">LOT OPERATIONS</p>
            <h1 className="text-xl font-bold tracking-tight">LOT 관리</h1>
            <p className="hidden text-sm text-muted-foreground sm:block">입고 · 테스트 대상 LOT</p>
          </div>
          <div className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                LOT 등록
              </button>
            </div>
          </div>
        </div>

        <section className="mt-3 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-[minmax(300px,2fr)_repeat(3,minmax(140px,1fr))_auto]">
            <label className="relative block">
              <PackageSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => {
                  setPage(0);
                  setQuery(event.target.value);
                }}
                placeholder="LOT 번호, 제품 코드, 공정 검색"
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="relative block [&>span]:w-full">
              <ListFilter className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Select
                value={filterStatus}
                onChange={(event) => {
                  setPage(0);
                  setFilterStatus(event.target.value as LotStatus | "ALL");
                }}
                options={statusOptions}
                className="pl-9"
              />
            </label>
            {/* 조건이 바뀌면 기존 페이지 경계를 벗어날 수 있어 첫 페이지부터 다시 조회한다. */}
            <Select
              aria-label="제품 코드 필터"
              value={productCode}
              disabled={isFilterOptionsLoading}
              onChange={(event) => {
                // 새 필터 결과에서 기존 페이지 번호가 유효하지 않을 수 있어 첫 페이지로 되돌린다.
                setPage(0);
                // 이 값이 useLotList의 Query Key를 바꿔 새 조건으로 서버 재조회를 시작한다.
                setProductCode(event.target.value);
              }}
              options={productOptions}
            />
            <Select
              aria-label="현재 공정 필터"
              value={process}
              disabled={isFilterOptionsLoading}
              onChange={(event) => {
                setPage(0);
                setProcess(event.target.value);
              }}
              options={processOptions}
            />
            <button
              type="button"
              onClick={() => {
                setPage(0);
                setQuery("");
                setFilterStatus("ALL");
                setProductCode("");
                setProcess("");
                refetch();
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-accent"
            >
              <RefreshCw className="h-4 w-4" />
              초기화
            </button>
          </div>
          <section className="relative border-t border-border p-4">
            {isFetching && (
              <div
                className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-primary/10"
                role="status"
              >
                <span className="sr-only">LOT 목록을 새로 불러오는 중입니다.</span>
                <div className="lot-fetch-progress h-full w-[42%] bg-primary" />
              </div>
            )}
            {isError && (
              <p className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                LOT 목록을 불러오지 못했습니다. 백엔드(4201) 실행과 로그인
                상태를 확인하세요.
              </p>
            )}
            <div className="ag-theme-quartz h-[clamp(420px,calc(100vh-22rem),620px)] min-w-0 w-full">
              <AgGridReact<Lot>
                theme="legacy"
                rowData={rows}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                /* 행 클릭은 상세 드로워, 체크박스는 일괄 작업 대상 선택으로 역할을 분리한다. */
                onRowClicked={(event) => event.data && openDetail(event.data)}
                animateRows
              />
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 text-sm lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>
                  총{" "}
                  <strong className="font-semibold text-foreground">
                    {(data?.totalElements ?? 0).toLocaleString()}
                  </strong>
                  건 중{" "}
                  <strong className="font-semibold text-foreground">
                    {startRow.toLocaleString()}–{endRow.toLocaleString()}
                  </strong>
                  번째
                </span>
                <label className="inline-flex items-center gap-1.5">
                  표시{" "}
                  <Select
                    aria-label="페이지당 LOT 표시 개수"
                    value={pageSize}
                    onChange={(event) => {
                      setPage(0);
                      setPageSize(Number(event.target.value));
                    }}
                    options={pageSizeOptions}
                    className="h-8 w-[82px] py-1 text-xs"
                  />
                </label>
              </div>
              <nav
                aria-label="LOT 목록 페이지"
                className="flex items-center justify-between gap-1 lg:justify-end"
              >
                <button
                  type="button"
                  aria-label="첫 페이지"
                  disabled={page === 0 || isFetching}
                  onClick={() => setPage(0)}
                  className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="이전 페이지"
                  disabled={page === 0 || isFetching}
                  onClick={() => setPage((current) => current - 1)}
                  className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="hidden items-center gap-1 sm:flex">
                  {pageItems.map((item, index) =>
                    item === "ellipsis" ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="grid h-9 w-7 place-items-center text-muted-foreground"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        aria-current={item === page ? "page" : undefined}
                        onClick={() => setPage(item)}
                        className={`grid h-9 min-w-9 place-items-center rounded-md px-2 text-sm font-medium ${item === page ? "bg-primary text-primary-foreground" : "border border-border hover:bg-accent"}`}
                      >
                        {item + 1}
                      </button>
                    ),
                  )}
                </div>
                <span className="text-xs text-muted-foreground sm:hidden">
                  {page + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  aria-label="다음 페이지"
                  disabled={!data || page >= totalPages - 1 || isFetching}
                  onClick={() => setPage((current) => current + 1)}
                  className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="마지막 페이지"
                  disabled={!data || page >= totalPages - 1 || isFetching}
                  onClick={() => setPage(totalPages - 1)}
                  className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">
              <Rows3 className="mt-0.5 h-4 w-4 shrink-0" />품질 상태는 저장된 LOT 상태·수율·정상 수량을 현재 제품의 LOT 품질 기준과 즉시 비교한 결과입니다.
            </div>
          </section>
        </section>
      </section>
      <LotDetailDrawer
        lot={activeLot}
        isOpen={isDetailOpen}
        onClose={closeDetail}
        onUpdated={setActiveLot}
      />
      <LotCreateDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </main>
  );
}
