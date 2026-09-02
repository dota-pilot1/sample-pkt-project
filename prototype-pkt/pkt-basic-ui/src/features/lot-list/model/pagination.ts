/** 현재 페이지 주변 숫자와 생략 기호만 노출해 페이지 수가 커져도 컨트롤 폭을 유지한다. */
export function getPageItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index);
  if (currentPage <= 3) return [0, 1, 2, 3, 4, "ellipsis", totalPages - 1];
  if (currentPage >= totalPages - 4) return [0, "ellipsis", totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1];
  return [0, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages - 1];
}
