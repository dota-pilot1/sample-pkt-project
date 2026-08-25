import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchQualityInspections, saveInspectionResult } from "../api/quality-inspection.api";

/** 목록 조회와 결과 저장 후 캐시 무효화에 함께 쓰는 React Query 키다. */
export const qualityInspectionsQueryKey = ["quality-inspections"] as const;

/** 품질 검사 목록을 서버 상태로 관리한다. */
export function useQualityInspections() {
  return useQuery({
    queryKey: qualityInspectionsQueryKey,
    queryFn: fetchQualityInspections,
  });
}

/** 저장에 성공하면 목록 캐시를 무효화해 완료 상태와 사진을 즉시 다시 조회한다. */
export function useSaveInspectionResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveInspectionResult,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qualityInspectionsQueryKey }),
  });
}
