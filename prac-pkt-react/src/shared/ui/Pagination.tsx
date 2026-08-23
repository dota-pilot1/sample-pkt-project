import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const DOTS = "dots";
type PageItem = number | typeof DOTS;

const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, index) => start + index);

/** 0-based 페이지 기준으로 [0, DOTS, 4, 5, 6, DOTS, 9] 형태의 표시 목록을 만든다. */
export function buildPageItems(page: number, totalPages: number, siblingCount = 1): PageItem[] {
  const maxSlots = siblingCount * 2 + 5;
  if (totalPages <= maxSlots) return range(0, totalPages - 1);

  const left = Math.max(page - siblingCount, 0);
  const right = Math.min(page + siblingCount, totalPages - 1);

  if (left <= 1) return [...range(0, siblingCount * 2 + 2), DOTS, totalPages - 1];
  if (right >= totalPages - 2) return [0, DOTS, ...range(totalPages - (siblingCount * 2 + 3), totalPages - 1)];
  return [0, DOTS, ...range(left, right), DOTS, totalPages - 1];
}

type PaginationProps = {
  /** 0-based 현재 페이지 */
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  /** 조회 중일 때 조작을 막는다. */
  disabled?: boolean;
  /** 요약 문구 단위. 기본값 "건" */
  unit?: string;
};

const stepButton =
  "grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40";

export function Pagination({
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  disabled = false,
  unit = "건",
}: PaginationProps) {
  const lastPage = Math.max(totalPages - 1, 0);
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalElements);
  const items = buildPageItems(page, totalPages);

  const move = (next: number) => {
    const target = Math.min(Math.max(next, 0), lastPage);
    if (target !== page) onPageChange(target);
  };

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-slate-500" aria-live="polite">
          전체 <span className="font-black text-slate-900">{totalElements.toLocaleString()}</span>
          {unit} 중 <span className="font-black text-slate-900">{from.toLocaleString()}–{to.toLocaleString()}</span>
        </p>
        {onPageSizeChange && (
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
            <span className="sr-only">페이지당 표시 개수</span>
            <select
              value={pageSize}
              disabled={disabled}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-1 text-sm font-bold text-slate-700 transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-40"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>{option}{unit}씩</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <nav aria-label="페이지네이션" className="flex items-center gap-1.5">
        <button type="button" aria-label="첫 페이지" disabled={disabled || page === 0} onClick={() => move(0)} className={stepButton}>
          <ChevronsLeft className="size-4" />
        </button>
        <button type="button" aria-label="이전 페이지" disabled={disabled || page === 0} onClick={() => move(page - 1)} className={stepButton}>
          <ChevronLeft className="size-4" />
        </button>

        <p className="px-2 text-sm font-bold text-slate-600 sm:hidden">{page + 1} / {Math.max(totalPages, 1)}</p>

        <ul className="hidden items-center gap-1.5 sm:flex">
          {items.map((item, index) =>
            item === DOTS ? (
              <li key={`${DOTS}-${index}`} aria-hidden="true" className="grid size-9 place-items-center text-sm font-black text-slate-300">…</li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  aria-label={`${item + 1} 페이지`}
                  aria-current={item === page ? "page" : undefined}
                  disabled={disabled}
                  onClick={() => move(item)}
                  className={`h-9 min-w-9 rounded-lg border px-2 text-sm font-black transition disabled:pointer-events-none disabled:opacity-40 ${
                    item === page
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item + 1}
                </button>
              </li>
            ),
          )}
        </ul>

        <button type="button" aria-label="다음 페이지" disabled={disabled || page >= lastPage} onClick={() => move(page + 1)} className={stepButton}>
          <ChevronRight className="size-4" />
        </button>
        <button type="button" aria-label="마지막 페이지" disabled={disabled || page >= lastPage} onClick={() => move(lastPage)} className={stepButton}>
          <ChevronsRight className="size-4" />
        </button>
      </nav>
    </div>
  );
}
