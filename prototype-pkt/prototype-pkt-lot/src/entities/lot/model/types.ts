export type LotStatus = "WAIT" | "RUN" | "HOLD" | "DONE" | "FAIL";

/** PKT LOT 목록에서 표시하고 선택하는 화면 모델이다. */
export type Lot = {
  id: number;
  lotCode: string;
  productCode: string;
  productName: string;
  tester: string | null;
  quantity: number | null;
  goodQuantity: number | null;
  defectQuantity: number | null;
  yieldRate: number | null;
  process: string;
  status: LotStatus;
};
