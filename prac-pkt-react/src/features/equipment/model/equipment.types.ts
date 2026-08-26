export type EquipmentStatus = "RUNNING" | "IDLE" | "MAINTENANCE";

// 서버가 반환하는 상태 변경 이력 중 화면 타임라인에 필요한 필드만 표현한다.
export type EquipmentStatusHistory = {
  id: number;
  status: EquipmentStatus;
  reason: string | null;
  changedAt: string;
};

// 설비 API 응답과 상세 Drawer가 공유하는 화면 도메인 모델이다.
export type Equipment = {
  id: number;
  code: string;
  name: string;
  processName: string;
  location: string;
  status: EquipmentStatus;
  currentLotNumber: string | null;
  statusChangedAt: string;
  statusReason: string | null;
  statusHistory: EquipmentStatusHistory[];
};

// 목록 검색·상태·공정 필터를 한 곳에서 관리하기 위한 화면 상태다.
export type EquipmentFilters = {
  keyword: string;
  status: EquipmentStatus | "ALL";
  processName: string;
};
