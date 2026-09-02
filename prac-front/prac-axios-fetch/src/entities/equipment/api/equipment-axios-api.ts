import { axiosClient } from "@/shared/api/axios-client";
import type {
  CreateEquipmentInput,
  DeleteEquipmentResponse,
  EquipmentListResponse,
  EquipmentMutationResponse,
  UpdateEquipmentInput,
} from "../model/equipment";

/** Axios는 params를 쿼리 문자열로 만들고 JSON 응답을 response.data로 자동 변환한다. */
export async function fetchEquipmentListWithAxios(
  simulateError = false,
  signal?: AbortSignal,
): Promise<EquipmentListResponse> {
  const response = await axiosClient.get<EquipmentListResponse>("/equipment", {
    params: simulateError ? { scenario: "error" } : undefined,
    signal,
  });
  return response.data;
}

/** fetch의 JSON.stringify·Content-Type 설정 없이 객체를 data로 보내 새 설비를 등록한다. */
export async function postEquipmentWithAxios(
  input: CreateEquipmentInput,
): Promise<EquipmentMutationResponse> {
  const response = await axiosClient.post<EquipmentMutationResponse>("/equipment", input);
  return response.data;
}

/** expectedVersion을 포함한 객체를 보내며 409 응답은 공통 인터셉터가 ApiError로 정규화한다. */
export async function patchEquipmentWithAxios(
  input: UpdateEquipmentInput,
): Promise<EquipmentMutationResponse> {
  const response = await axiosClient.patch<EquipmentMutationResponse>(`/equipment/${input.id}`, input);
  return response.data;
}

/** Axios DELETE 응답의 data를 공통 삭제 결과로 반환한다. */
export async function removeEquipmentWithAxios(id: number): Promise<DeleteEquipmentResponse> {
  const response = await axiosClient.delete<DeleteEquipmentResponse>(`/equipment/${id}`);
  return response.data;
}
