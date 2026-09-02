import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  patchTaskStatus,
  postTask,
  removeTask,
} from "@/entities/task/api/task-api";

const taskQueryRootKey = ["tasks"] as const;

/** 작업 생성 성공 후 tasks 하위의 활성 목록·상세 캐시를 다시 조회한다. */
export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postTask,
    onSuccess: async () => {
      // Promise를 반환하면 invalidate에 따른 재조회가 끝날 때까지 mutation이 pending 상태를 유지한다.
      await queryClient.invalidateQueries({ queryKey: taskQueryRootKey });
    },
  });
}

/** 상태 변경 성공 후 목록과 해당 ID의 상세 캐시를 서버 값으로 동기화한다. */
export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchTaskStatus,
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...taskQueryRootKey, "list"],
        }),
        queryClient.invalidateQueries({
          queryKey: [...taskQueryRootKey, "detail", variables.taskId],
        }),
        // Level 1의 단일 tasks 쿼리도 같은 서버 데이터를 사용하므로 함께 갱신한다.
        queryClient.invalidateQueries({
          queryKey: taskQueryRootKey,
          exact: true,
        }),
      ]);
    },
  });
}

/** 삭제 성공 후 모든 tasks 캐시를 무효화해 남아 있는 목록과 상세를 재검증한다. */
export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskQueryRootKey });
    },
  });
}
