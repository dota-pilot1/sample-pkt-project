export const equipmentStatuses = ["가동 중", "점검 필요", "대기"] as const;

export type EquipmentStatus = (typeof equipmentStatuses)[number];

export interface Equipment {
  id: number;
  name: string;
  line: string;
  status: EquipmentStatus;
  temperature: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/** 설비 목록 Route Handler가 성공 시 반환하는 JSON 계약이다. */
export interface EquipmentListResponse {
  equipment: Equipment[];
  fetchedAt: string;
}

export interface CreateEquipmentInput {
  name: string;
  line: string;
  status: EquipmentStatus;
  temperature: number;
}

export interface UpdateEquipmentInput extends CreateEquipmentInput {
  id: number;
  expectedVersion: number;
}

export interface EquipmentMutationResponse {
  equipment: Equipment;
  message: string;
}

export interface DeleteEquipmentResponse {
  deletedId: number;
  message: string;
}

/** 실패 응답에서 사용자 메시지와 서버 오류 코드를 전달하는 JSON 계약이다. */
export interface ApiErrorResponse {
  code: string;
  message: string;
}
