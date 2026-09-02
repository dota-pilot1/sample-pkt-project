import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchTaskDetail, fetchTaskPage, fetchTasks } from "../api/task-api";

/** 작업 목록의 조회·캐시·재시도 상태를 화면에 제공한다. */
export function useTaskQuery() {
  // Level 1은 조회 조건이 없으므로 짧고 명확한 단일 캐시 키를 사용한다.
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });
}

/** page와 pageSize를 캐시 키에 포함해 서로 다른 목록 조건을 분리한다. */
export function useTaskListQuery(page: number, pageSize: number) {
  return useQuery({
    queryKey: ["tasks", "list", { page, pageSize }],
    queryFn: () => fetchTaskPage(page, pageSize),
    // 다음 페이지 요청 중에도 직전 목록을 남겨 페이지 영역이 비는 것을 막는다.
    placeholderData: keepPreviousData,
  });
}

/** 목록 캐시와 충돌하지 않도록 상세 조회는 taskId를 포함한 별도 키를 사용한다. */
export function useTaskDetailQuery(taskId: number) {
  return useQuery({
    queryKey: ["tasks", "detail", taskId],
    queryFn: () => fetchTaskDetail(taskId),
  });
}
