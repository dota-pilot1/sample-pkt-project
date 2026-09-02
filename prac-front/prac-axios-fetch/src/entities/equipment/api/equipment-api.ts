import { fetchJson } from "@/shared/api/fetch-json";
import type {
  CreateEquipmentInput,
  DeleteEquipmentResponse,
  EquipmentListResponse,
  EquipmentMutationResponse,
  UpdateEquipmentInput,
} from "../model/equipment";

/** 순수 fetch로 인증된 설비 목록을 조회하고 4xx·5xx를 명시적인 오류로 바꾼다. */
export async function fetchEquipmentList(
  simulateError = false,
  signal?: AbortSignal,
): Promise<EquipmentListResponse> {
  const query = simulateError ? "?scenario=error" : "";
  return fetchJson<EquipmentListResponse>(`/api/equipment${query}`, {
    cache: "no-store",
    signal,
    fallbackMessage: "설비 목록을 불러오지 못했습니다.",
    fallbackCode: "EQUIPMENT_READ_FAILED",
  });
}

/** JSON 본문으로 새 설비를 등록한다. */
export async function postEquipment(
  input: CreateEquipmentInput,
): Promise<EquipmentMutationResponse> {
  return fetchJson<EquipmentMutationResponse>("/api/equipment", {
    method: "POST",
    body: JSON.stringify(input),
    fallbackMessage: "설비를 등록하지 못했습니다.",
    fallbackCode: "EQUIPMENT_CREATE_FAILED",
  });
}

/** expectedVersion과 함께 설비를 수정해 409 동시성 충돌을 감지한다. */
export async function patchEquipment(
  input: UpdateEquipmentInput,
): Promise<EquipmentMutationResponse> {
  return fetchJson<EquipmentMutationResponse>(`/api/equipment/${input.id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    fallbackMessage: "설비를 수정하지 못했습니다.",
    fallbackCode: "EQUIPMENT_UPDATE_FAILED",
  });
}

/** 삭제 API의 JSON 확인 응답을 읽고 존재하지 않는 ID의 404도 보존한다. */
export async function removeEquipment(id: number): Promise<DeleteEquipmentResponse> {
  return fetchJson<DeleteEquipmentResponse>(`/api/equipment/${id}`, {
    method: "DELETE",
    fallbackMessage: "설비를 삭제하지 못했습니다.",
    fallbackCode: "EQUIPMENT_DELETE_FAILED",
  });
}
