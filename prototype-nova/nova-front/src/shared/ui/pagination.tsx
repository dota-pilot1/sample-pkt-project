import { ChevronLeft, ChevronRight } from "lucide-react";

type PageItem = number | "left-ellipsis" | "right-ellipsis";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
};

/** 현재 페이지 주변 번호만 보여 주고, 먼 구간은 말줄임표로 줄인다. */
function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) return [1, 2, 3, 4, 5, "right-ellipsis", totalPages];
  if (currentPage >= totalPages - 3) {
    return [1, "left-ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "left-ellipsis", currentPage - 1, currentPage, currentPage + 1, "right-ellipsis", totalPages];
}

/** 목록 아래에서 이전·다음과 페이지 번호를 공통으로 보여 준다. */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
}: Readonly<PaginationProps>) {
  const canChangePageSize =
    pageSize !== undefined &&
    pageSizeOptions !== undefined &&
    onPageSizeChange !== undefined;

  if (totalPages <= 1 && !canChangePageSize) return null;

  return (
    <nav className="pagination" aria-label="페이지 이동">
      {canChangePageSize ? (
        <label className="pagination-size">
          <span>페이지당</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>{size}명</option>
            ))}
          </select>
        </label>
      ) : <span />}
      {totalPages > 1 ? (
        <div className="pagination-navigation">
          <button
            className="pagination-button pagination-control"
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft aria-hidden="true" size={16} />
            이전
          </button>
          <div className="pagination-pages">
            {getPageItems(currentPage, totalPages).map((item) =>
              typeof item === "number" ? (
                <button
                  key={item}
                  className={`pagination-button${item === currentPage ? " is-current" : ""}`}
                  type="button"
                  aria-current={item === currentPage ? "page" : undefined}
                  aria-label={`${item}페이지`}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </button>
              ) : (
                <span key={item} className="pagination-ellipsis" aria-hidden="true">…</span>
              ),
            )}
          </div>
          <button
            className="pagination-button pagination-control"
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            다음
            <ChevronRight aria-hidden="true" size={16} />
          </button>
        </div>
      ) : <span />}
      <span aria-hidden="true" />
    </nav>
  );
}
