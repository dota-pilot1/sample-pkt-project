import type { Lot } from "../model/lot.types";

const mockLots: Lot[] = [
  { id: "LOT-2026-001", product: "PKT-A", status: "진행 중", process: "식각", updatedAt: "2026-08-22" },
  { id: "LOT-2026-002", product: "PKT-B", status: "대기", process: "세정", updatedAt: "2026-08-21" },
  { id: "LOT-2026-003", product: "PKT-A", status: "완료", process: "검사", updatedAt: "2026-08-20" },
];

export async function fetchLots(): Promise<Lot[]> {
  // 다음 실습에서 fetch("/api/lots")로 교체한다.
  return Promise.resolve(mockLots);
}
