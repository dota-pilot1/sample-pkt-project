import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchEquipment, fetchEquipments, updateEquipmentStatus } from "../api/equipment.api";
import type { EquipmentStatus } from "./equipment.types";

export const equipmentQueryKey = ["equipments"] as const;

// 설비 목록을 캐시해 화면 재진입과 상태 변경 후 갱신에 재사용한다.
export function useEquipments() {
  return useQuery({ queryKey: equipmentQueryKey, queryFn: fetchEquipments });
}

// 선택된 설비가 있을 때만 상세 API를 호출하도록 enabled로 요청 시점을 제어한다.
export function useEquipment(id: number | null) {
  return useQuery({
    queryKey: [...equipmentQueryKey, id],
    queryFn: () => fetchEquipment(id!),
    enabled: id !== null,
  });
}

// 상태 변경 성공 시 목록 캐시를 무효화하고 상세 캐시는 즉시 최신 응답으로 교체한다.
export function useUpdateEquipmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: EquipmentStatus; reason: string }) => updateEquipmentStatus(id, status, reason),
    onSuccess: (equipment) => {
      queryClient.invalidateQueries({ queryKey: equipmentQueryKey });
      queryClient.setQueryData([...equipmentQueryKey, equipment.id], equipment);
    },
  });
}
