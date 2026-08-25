export type InspectionStatus = "WAITING" | "COMPLETED";
export type InspectionResult = "PASS" | "FAIL";

export type QualityInspection = {
  id: number;
  lotCode: string;
  workOrderCode: string;
  itemName: string;
  quantity: number;
  producedAt: string;
  status: InspectionStatus;
  result: InspectionResult | null;
  dimension: number | null;
  appearanceIssue: boolean | null;
  defectReason: string | null;
  photoUrls: string[];
  inspectedAt: string | null;
};

export type RecordInspectionResult = {
  dimension: number;
  appearanceIssue: boolean;
  result: InspectionResult;
  defectReason: string | null;
  photoUrls: string[];
};

export type SaveInspectionParams = RecordInspectionResult & {
  id: number;
  photos?: File[];
};
