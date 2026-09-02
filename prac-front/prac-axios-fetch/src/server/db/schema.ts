import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { equipmentStatuses } from "@/entities/equipment/model/equipment";

/** 로그인 계정과 비밀번호 해시를 저장하는 사용자 테이블이다. */
export const usersTable = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

/** HttpOnly 쿠키의 불투명 토큰과 만료 시간을 서버에서 관리하는 세션 테이블이다. */
export const sessionsTable = sqliteTable("sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

/** CRUD와 낙관적 동시성 제어를 연습하는 설비 테이블이다. */
export const equipmentTable = sqliteTable("equipment", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  line: text("line").notNull(),
  status: text("status", { enum: equipmentStatuses }).notNull(),
  temperature: integer("temperature").notNull(),
  version: integer("version").notNull().default(1),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

