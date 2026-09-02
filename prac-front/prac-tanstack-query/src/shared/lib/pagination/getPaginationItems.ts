export type PaginationItem = number | "ellipsis";

/**
 * 전체 페이지가 많아도 첫·마지막과 현재 페이지 주변만 노출해 페이지 버튼 수를 제한한다.
 * 예: total=10, current=5 → [1, "ellipsis", 4, 5, 6, "ellipsis", 10]
 */
export function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  // 조회 결과가 0건이면 페이지 버튼을 만들지 않는다.
  if (totalPages < 1) return [];

  // URL 등 외부 입력이 범위를 벗어나도 항상 유효한 현재 페이지를 기준으로 계산한다.
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  // 페이지 수가 적을 때는 생략 기호 없이 전체 번호를 그대로 노출한다.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  // 첫·마지막 페이지는 별도로 추가하므로 현재 페이지 주변 번호에서 제외한다.
  const siblings = [
    safeCurrentPage - 1,
    safeCurrentPage,
    safeCurrentPage + 1,
  ].filter(
    (page) => page > 1 && page < totalPages,
  );

  // 첫 페이지는 어느 위치에서도 바로 이동할 수 있도록 항상 표시한다.
  const items: PaginationItem[] = [1];

  // 첫 페이지와 주변 번호 사이가 한 페이지보다 넓을 때만 왼쪽 생략 기호를 넣는다.
  if (siblings[0] > 2) items.push("ellipsis");
  items.push(...siblings);

  // 주변 번호와 마지막 페이지 사이가 한 페이지보다 넓을 때만 오른쪽 생략 기호를 넣는다.
  if (siblings.at(-1)! < totalPages - 1) items.push("ellipsis");

  // 마지막 페이지도 항상 표시해 전체 범위의 끝으로 바로 이동할 수 있게 한다.
  items.push(totalPages);

  return items;
}
