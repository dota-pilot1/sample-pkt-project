export type LotStatus = "WAIT" | "RUN" | "HOLD" | "DONE" | "FAIL";
export type ProductClassification = "MATERIAL" | "SEMI_FINISHED" | "FINISHED_GOOD";
export type LotQualityStatus = "WAITING" | "CRITERIA_MISSING" | "DATA_MISSING" | "PASS" | "FAIL";

/** PKT LOT 목록에서 표시하고 선택하는 화면 모델이다. */
export type Lot = {
  id: number;
  lotCode: string;
  workOrderCode: string | null;
  productCode: string;
  productName: string;
  productClassification: ProductClassification;
  tester: string | null;
  quantity: number | null;
  goodQuantity: number | null;
  defectQuantity: number | null;
  yieldRate: number | null;
  process: string;
  status: LotStatus;
  qualityStatus: LotQualityStatus | null;
  qualityMessage: string | null;
};
