import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { taskPriorities, taskStatuses } from "./task";

/** 앱 내부 SQLite에 영속 저장되는 작업 테이블이다. */
export const tasksTable = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  owner: text("owner").notNull(),
  status: text("status", { enum: taskStatuses }).notNull(),
  priority: text("priority", { enum: taskPriorities }).notNull(),
  dueDate: text("due_date").notNull(),
  description: text("description").notNull(),
});
