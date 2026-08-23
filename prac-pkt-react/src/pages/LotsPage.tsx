import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LotTable } from "../features/lot/ui/LotTable";
import { LotTableSkeleton } from "../features/lot/ui/LotTableSkeleton";
import { useLots } from "../features/lot/model/useLots";
import type { Lot, LotSort } from "../features/lot/model/lot.types";
import { DEFAULT_LOT_SORT, isLotSortField } from "../features/lot/model/lot.types";
import { Pagination } from "../shared/ui/Pagination";

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;

/** 쿼리스트링은 사용자 기준 1-based, API는 0-based를 쓴다. */
function readPage(params: URLSearchParams) {
  const parsed = Number(params.get("page"));
  return Number.isInteger(parsed) && parsed > 0 ? parsed - 1 : 0;
}

/** 허용된 페이지 크기만 사용해 잘못된 URL 입력을 기본값으로 보정한다. */
function readSize(params: URLSearchParams) {
  const parsed = Number(params.get("size"));
  return PAGE_SIZE_OPTIONS.includes(parsed) ? parsed : DEFAULT_PAGE_SIZE;
}

/** 서버 화이트리스트에 없는 정렬 값이 들어오면 기본 정렬로 되돌린다. */
function readSort(params: URLSearchParams): LotSort {
  const field = params.get("sort") ?? "";
  const direction = params.get("dir");
  if (!isLotSortField(field)) return DEFAULT_LOT_SORT;
  return { field, direction: direction === "asc" ? "asc" : "desc" };
}

export default function LotsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams);
  const pageSize = readSize(searchParams);
  const sort = readSort(searchParams);
  const { data, isPending, isError, error, isFetching, refetch } = useLots(page, pageSize, sort);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);

  /**
   * 페이지·크기·정렬을 URL에 기록해 새로고침과 링크 공유에서 목록 조건이 유지되게 한다.
   * page를 함께 넘기지 않으면 1페이지로 돌아간다. 크기나 정렬이 바뀌면 기존 페이지 번호가 의미를 잃기 때문이다.
   */
  const updateQuery = (next: { page?: number; size?: number; sort?: LotSort }) =>
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        params.set("page", String((next.page ?? 0) + 1));
        if (next.size !== undefined) params.set("size", String(next.size));
        if (next.sort !== undefined) {
          params.set("sort", next.sort.field);
          params.set("dir", next.sort.direction);
        }
        return params;
      },
      { replace: true },
    );

  const rows = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  useEffect(() => setSelectedLot(null), [page, pageSize, sort.field, sort.direction]);

  // 삭제나 페이지 크기 변경으로 범위를 벗어난 페이지 번호를 되돌린다.
  useEffect(() => {
    if (totalPages > 0 && page >= totalPages) updateQuery({ page: totalPages - 1 });
  }, [page, totalPages]);

  return <div className="space-y-5">
    <header>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">PRACTICE 01</p>
      <h1 className="mt-2 text-2xl font-black">LOT 목록 테이블</h1>
      <p className="mt-1 text-sm font-semibold text-slate-500">행을 선택하면 선택 상태와 LOT 상세 정보가 표시됩니다.</p>
    </header>

    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-busy={isFetching}>
        {isPending ? <LotTableSkeleton rows={pageSize > 10 ? 10 : pageSize} /> : isError ? (
          <div role="alert" className="space-y-3 p-5">
            <p className="text-sm font-bold text-red-700">{error.message}</p>
            <button type="button" onClick={() => void refetch()} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-bold text-red-700 transition hover:bg-red-100">다시 시도</button>
          </div>
        ) : <>
          <div className={isFetching ? "opacity-50 transition-opacity" : "transition-opacity"}>
            <LotTable
              rows={rows}
              selectedLotId={selectedLot?.id}
              onSelect={setSelectedLot}
              sort={sort}
              onSortChange={(next) => updateQuery({ sort: next })}
            />
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            disabled={isFetching}
            onPageChange={(next) => updateQuery({ page: next })}
            onPageSizeChange={(size) => updateQuery({ page: 0, size })}
          />
        </>}
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-live="polite">
        {selectedLot ? <>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-600">SELECTED LOT</p><h2 className="mt-2 text-xl font-black">{selectedLot.id}</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3"><dt className="font-semibold text-slate-500">제품</dt><dd className="font-black">{selectedLot.product}</dd></div>
            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3"><dt className="font-semibold text-slate-500">상태</dt><dd className="font-black text-sky-700">{selectedLot.status}</dd></div>
            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3"><dt className="font-semibold text-slate-500">공정</dt><dd className="font-black">{selectedLot.process}</dd></div>
            <div className="flex justify-between gap-4"><dt className="font-semibold text-slate-500">수정일</dt><dd className="font-black">{selectedLot.updatedAt}</dd></div>
          </dl>
          <button type="button" onClick={() => setSelectedLot(null)} className="mt-6 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">선택 해제</button>
        </> : <><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">LOT DETAIL</p><h2 className="mt-2 text-xl font-black">LOT를 선택하세요</h2><p className="mt-2 text-sm leading-6 text-slate-500">행을 클릭하거나 키보드로 선택하면 상세 정보가 여기에 표시됩니다.</p></>}
      </aside>
    </div>
  </div>;
}
