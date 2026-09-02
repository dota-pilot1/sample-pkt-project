export const taskStatuses = ["진행 중", "검토 대기", "완료"] as const;
export const taskPriorities = ["높음", "보통", "낮음"] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];

/** 작업 목록 API와 화면이 함께 사용하는 서버 상태 계약이다. */
export type Task = {
  id: number;
  title: string;
  owner: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  description: string;
};

export type CreateTaskInput = Pick<
  Task,
  "title" | "owner" | "priority" | "dueDate" | "description"
>;

export type UpdateTaskStatusInput = {
  taskId: number;
  status: TaskStatus;
};

export type TaskListResponse = {
  tasks: Task[];
  fetchedAt: string;
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
};

export type TaskDetailResponse = {
  task: Task;
  fetchedAt: string;
};

export type TaskMutationResponse = {
  task: Task;
  message: string;
};

export type DeleteTaskResponse = {
  deletedTaskId: number;
  message: string;
};
