export type LotStatus = "대기" | "진행 중" | "완료" | "이상";

export type Lot = {
  id: string;
  product: string;
  status: LotStatus;
  process: string;
  updatedAt: string;
};

export type LotPage = {
  content: Lot[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

/** 서버가 허용하는 정렬 컬럼. LotSortField 화이트리스트와 값이 같아야 한다. */
export const LOT_SORT_FIELDS = ["lotCode", "productName", "status", "process", "updatedAt"] as const;

export type LotSortField = (typeof LOT_SORT_FIELDS)[number];
export type SortDirection = "asc" | "desc";
export type LotSort = { field: LotSortField; direction: SortDirection };

export const DEFAULT_LOT_SORT: LotSort = { field: "updatedAt", direction: "desc" };

export function isLotSortField(value: string): value is LotSortField {
  return (LOT_SORT_FIELDS as readonly string[]).includes(value);
}
