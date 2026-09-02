import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchEquipmentListWithAxios,
  patchEquipmentWithAxios,
  postEquipmentWithAxios,
  removeEquipmentWithAxios,
} from "../api/equipment-axios-api";

export const axiosEquipmentQueryKey = ["equipment", "axios-list"] as const;

/** Level 3 목록은 fetch 래퍼를 거치지 않고 Axios API 함수만 호출한다. */
export function useAxiosEquipmentQuery(enabled: boolean, simulateError: boolean) {
  return useQuery({
    queryKey: [...axiosEquipmentQueryKey, { simulateError }],
    // Axios도 AbortSignal을 지원하므로 TanStack Query의 취소 신호를 그대로 전달한다.
    queryFn: ({ signal }) => fetchEquipmentListWithAxios(simulateError, signal),
    enabled,
    retry: false,
  });
}

/** Axios mutation 성공 후 설비 캐시 전체를 무효화해 SQLite 최신 값을 다시 조회한다. */
function useInvalidatingAxiosMutation<TInput>(
  mutationFn: (input: TInput) => Promise<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}

export function useCreateEquipmentWithAxiosMutation() {
  return useInvalidatingAxiosMutation(postEquipmentWithAxios);
}

export function useUpdateEquipmentWithAxiosMutation() {
  return useInvalidatingAxiosMutation(patchEquipmentWithAxios);
}

export function useDeleteEquipmentWithAxiosMutation() {
  return useInvalidatingAxiosMutation(removeEquipmentWithAxios);
}
