import "server-only";

import { count, desc, eq } from "drizzle-orm";
import { db, sqlite } from "@/shared/db/sqlite";
import type {
  CreateTaskInput,
  TaskStatus,
} from "../model/task";
import { tasksTable } from "../model/task-schema";
import { taskSeed } from "./task-seed";

const defaultPageSize = 3;
const allowedPageSizes = [3, 5, 10];

// 샘플 앱은 별도 migration 서버 없이 최초 접근 시 필요한 테이블만 안전하게 준비한다.
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    owner TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    due_date TEXT NOT NULL,
    description TEXT NOT NULL
  )
`);

const existingTaskCount = db
  .select({ value: count() })
  .from(tasksTable)
  .get()?.value ?? 0;

// 사용자가 mutation으로 만든 데이터는 보존하고, 완전히 빈 DB에만 기준 20건을 시드한다.
if (existingTaskCount === 0) {
  db.insert(tasksTable).values(taskSeed).run();
}

/** SQLite에서 최신 작업부터 페이지 단위로 조회한다. */
export function getTaskPage(requestedPage: number, requestedPageSize: number) {
  const pageSize = allowedPageSizes.includes(requestedPageSize)
    ? requestedPageSize
    : defaultPageSize;
  const totalCount = db
    .select({ value: count() })
    .from(tasksTable)
    .get()?.value ?? 0;
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  const offset = (page - 1) * pageSize;
  const tasks = db
    .select()
    .from(tasksTable)
    .orderBy(desc(tasksTable.id))
    .limit(pageSize)
    .offset(offset)
    .all();

  return { tasks, page, pageSize, totalPages, totalCount };
}

/** 작업 ID 하나를 SQLite에서 조회한다. */
export function getTaskById(taskId: number) {
  return (
    db.select().from(tasksTable).where(eq(tasksTable.id, taskId)).get() ?? null
  );
}

/** 새 작업을 저장하고 SQLite가 발급한 ID가 포함된 행을 반환한다. */
export function createTask(input: CreateTaskInput) {
  return db
    .insert(tasksTable)
    .values({ ...input, status: "검토 대기" })
    .returning()
    .get();
}

/** 작업 상태를 변경하고 저장된 최신 행을 반환한다. */
export function updateTaskStatus(taskId: number, status: TaskStatus) {
  return (
    db
      .update(tasksTable)
      .set({ status })
      .where(eq(tasksTable.id, taskId))
      .returning()
      .get() ?? null
  );
}

/** 작업을 삭제하고 실제 삭제된 행이 있었는지 반환한다. */
export function deleteTask(taskId: number) {
  const deletedTask = db
    .delete(tasksTable)
    .where(eq(tasksTable.id, taskId))
    .returning({ id: tasksTable.id })
    .get();

  return Boolean(deletedTask);
}
