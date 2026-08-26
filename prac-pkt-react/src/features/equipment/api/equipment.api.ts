import { apiFetch } from "../../../shared/api/http";
import type { Equipment, EquipmentStatus, EquipmentStatusHistory } from "../model/equipment.types";

async function parseError(response: Response, fallback: string) {
  // 공통 HTTP 오류를 설비 화면에서 이해할 수 있는 메시지로 변환한다.
  if (response.status === 403) return "관리자만 설비 상태를 변경할 수 있습니다.";
  if (response.status === 400) return "입력값을 확인해 주세요.";
  return fallback;
}

export async function fetchEquipments(): Promise<Equipment[]> {
  // 목록 화면의 최초 데이터와 상태 변경 후 재조회에 사용하는 API다.
  const response = await apiFetch("/equipments");
  if (!response.ok) throw new Error(await parseError(response, "설비 목록을 불러오지 못했습니다."));
  return (await response.json()) as Equipment[];
}

export async function fetchEquipment(id: number): Promise<Equipment> {
  // 행을 선택했을 때 최신 설비 정보와 최근 이력을 함께 가져온다.
  const response = await apiFetch(`/equipments/${id}`);
  if (!response.ok) throw new Error(await parseError(response, "설비 상세 정보를 불러오지 못했습니다."));
  return (await response.json()) as Equipment;
}

export async function fetchEquipmentHistory(id: number): Promise<EquipmentStatusHistory[]> {
  // 상세 화면에서 이력만 다시 확인해야 할 때 사용하는 조회 API다.
  const response = await apiFetch(`/equipments/${id}/status-history`);
  if (!response.ok) throw new Error(await parseError(response, "설비 상태 이력을 불러오지 못했습니다."));
  return (await response.json()) as EquipmentStatusHistory[];
}

export async function updateEquipmentStatus(id: number, status: EquipmentStatus, reason: string): Promise<Equipment> {
  // 관리자 상태 변경 요청을 서버에 보내고, 서버가 저장한 최신 설비를 반환받는다.
  const response = await apiFetch(`/equipments/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, reason: reason.trim() || "관리자 수동 상태 변경" }),
  });
  if (!response.ok) throw new Error(await parseError(response, "설비 상태를 변경하지 못했습니다."));
  return (await response.json()) as Equipment;
}
