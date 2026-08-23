import type { Lot, LotPage, LotSort } from "../model/lot.types";
import { apiFetch } from "../../../shared/api/http";

/** 서버가 반환하는 LOT 상태 코드다. 화면 라벨과 다르므로 mapLot에서 변환한다. */
type LotApiStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED" | "HOLD";

/** 서버 LOT 목록 한 건의 원본 응답 계약이다. */
type LotApiItem = {
  id: number;
  lotCode: string;
  productCode: string;
  productName: string;
  status: LotApiStatus;
  process: string;
  updatedAt: string;
};

/** 서버 페이지 메타데이터를 유지하면서 content만 원본 응답 타입으로 바꾼다. */
type LotApiPage = Omit<LotPage, "content"> & { content: LotApiItem[] };

/** 서버 상태 코드와 화면 표시 라벨 사이의 변환표다. */
const statusLabels: Record<LotApiStatus, Lot["status"]> = {
  WAITING: "대기",
  IN_PROGRESS: "진행 중",
  COMPLETED: "완료",
  HOLD: "이상",
};

/** 서버의 LOT 응답을 테이블과 상세 패널에서 사용하는 화면 모델로 변환한다. */
function mapLot(item: LotApiItem): Lot {
  return {
    id: item.lotCode,
    product: item.productName || item.productCode,
    status: statusLabels[item.status] ?? "이상",
    process: item.process,
    updatedAt: new Date(item.updatedAt).toLocaleDateString("ko-KR"),
  };
}

/** 로그인 토큰을 포함해 페이지·정렬 조건에 맞는 LOT 목록을 조회한다. */
export async function fetchLots(page: number, size: number, sort: LotSort): Promise<LotPage> {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: sort.field,
    direction: sort.direction,
  });
  const response = await apiFetch(`lots?${query}`);

  if (!response.ok) {
    throw new Error(`LOT 목록 조회에 실패했습니다. (${response.status})`);
  }

  const data = (await response.json()) as LotApiPage;
  return { ...data, content: data.content.map(mapLot) };
}
