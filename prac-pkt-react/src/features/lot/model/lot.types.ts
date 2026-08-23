export type LotStatus = "대기" | "진행 중" | "완료" | "이상";

export type Lot = {
  id: string;
  product: string;
  status: LotStatus;
  process: string;
  updatedAt: string;
};
