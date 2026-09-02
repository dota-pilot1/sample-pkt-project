import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchEquipmentList,
  patchEquipment,
  postEquipment,
  removeEquipment,
} from "../api/equipment-api";

export const equipmentQueryKey = ["equipment", "list"] as const;

/** 로그인된 화면의 설비 목록과 fetch 상태를 TanStack Query 캐시에 보관한다. */
export function useEquipmentQuery(enabled: boolean, simulateError: boolean) {
  return useQuery({
    queryKey: [...equipmentQueryKey, { simulateError }],
    // Query가 취소될 때 AbortSignal을 공통 fetch 래퍼까지 전달한다.
    queryFn: ({ signal }) => fetchEquipmentList(simulateError, signal),
    enabled,
    retry: false,
  });
}

function useInvalidatingMutation<TInput>(
  mutationFn: (input: TInput) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    // 서버가 저장을 확정한 뒤 목록 캐시를 무효화해 DB의 최신 version을 다시 읽는다.
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}

export function useCreateEquipmentMutation() {
  return useInvalidatingMutation(postEquipment);
}

export function useUpdateEquipmentMutation() {
  return useInvalidatingMutation(patchEquipment);
}

export function useDeleteEquipmentMutation() {
  return useInvalidatingMutation(removeEquipment);
}
