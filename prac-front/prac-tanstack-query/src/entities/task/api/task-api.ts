import type {
  CreateTaskInput,
  DeleteTaskResponse,
  TaskDetailResponse,
  TaskListResponse,
  TaskMutationResponse,
  UpdateTaskStatusInput,
} from "../model/task";

/** 작업 목록을 조회하고 HTTP 실패 응답을 TanStack Query가 처리할 Error로 변환한다. */
export async function fetchTasks(): Promise<TaskListResponse> {
  // entities API 계층만 HTTP 주소와 응답 파싱을 알고, UI는 TaskResponse만 사용한다.
  const response = await fetch("/api/tasks");
  const body = (await response.json()) as TaskListResponse & { message?: string };

  if (!response.ok) {
    // useQuery는 Promise reject를 isError 상태로 바꾸므로 서버 메시지를 Error로 전달한다.
    throw new Error(body.message ?? "작업 목록을 불러오지 못했습니다.");
  }

  return body;
}

/** 현재 페이지와 페이지 크기를 목록 API에 전달한다. */
export async function fetchTaskPage(
  page: number,
  pageSize: number,
): Promise<TaskListResponse> {
  const response = await fetch(`/api/tasks?page=${page}&size=${pageSize}`);
  const body = (await response.json()) as TaskListResponse & { message?: string };

  if (!response.ok) {
    throw new Error(body.message ?? "작업 목록을 불러오지 못했습니다.");
  }

  return body;
}

/** 작업 ID 하나의 상세 데이터를 요청한다. */
export async function fetchTaskDetail(taskId: number): Promise<TaskDetailResponse> {
  const response = await fetch(`/api/tasks/${taskId}`);
  const body = (await response.json()) as TaskDetailResponse & { message?: string };

  if (!response.ok) {
    throw new Error(body.message ?? "작업 상세 정보를 불러오지 못했습니다.");
  }

  return body;
}

/** 새 작업을 생성하고 서버가 확정한 ID와 기본 상태를 반환받는다. */
export async function postTask(
  input: CreateTaskInput,
): Promise<TaskMutationResponse> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = (await response.json()) as TaskMutationResponse & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(body.message ?? "작업을 등록하지 못했습니다.");
  }

  return body;
}

/** 작업 상태를 변경하고 서버가 저장한 최신 작업을 반환받는다. */
export async function patchTaskStatus({
  taskId,
  status,
}: UpdateTaskStatusInput): Promise<TaskMutationResponse> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const body = (await response.json()) as TaskMutationResponse & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(body.message ?? "작업 상태를 변경하지 못했습니다.");
  }

  return body;
}

/** 작업을 삭제하고 서버가 확정한 삭제 ID를 반환받는다. */
export async function removeTask(taskId: number): Promise<DeleteTaskResponse> {
  const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
  const body = (await response.json()) as DeleteTaskResponse & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(body.message ?? "작업을 삭제하지 못했습니다.");
  }

  return body;
}
