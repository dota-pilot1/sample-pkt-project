import "server-only";

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { count } from "drizzle-orm";
import { hashPassword } from "@/server/auth/password";
import { equipmentTable, sessionsTable, usersTable } from "./schema";

const isNextBuild = process.env.NEXT_PHASE === "phase-production-build";
const dataDirectory = isNextBuild
  ? path.join(os.tmpdir(), `axios-fetch-build-${process.pid}`)
  : path.join(process.cwd(), ".data");

fs.mkdirSync(dataDirectory, { recursive: true });

export const databasePath = path.join(dataDirectory, "axios-fetch.db");
export const sqlite = new Database(databasePath);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("busy_timeout = 5000");

// 작은 학습 앱이므로 별도 migration 서버 없이 최초 접근 시 필요한 스키마를 준비한다.
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    line TEXT NOT NULL,
    status TEXT NOT NULL,
    temperature INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

export const db = drizzle(sqlite, {
  schema: { usersTable, sessionsTable, equipmentTable },
});

const userCount = db.select({ value: count() }).from(usersTable).get()?.value ?? 0;
if (userCount === 0) {
  db.insert(usersTable)
    .values({
      username: "operator",
      displayName: "PKT 설비 담당자",
      passwordHash: hashPassword("pkt1234!"),
    })
    .run();
}

const equipmentCount =
  db.select({ value: count() }).from(equipmentTable).get()?.value ?? 0;
if (equipmentCount === 0) {
  const now = new Date().toISOString();
  db.insert(equipmentTable)
    .values([
      { name: "충진기 A-01", line: "포장 1라인", status: "가동 중", temperature: 42, createdAt: now, updatedAt: now },
      { name: "라벨러 A-02", line: "포장 1라인", status: "점검 필요", temperature: 57, createdAt: now, updatedAt: now },
      { name: "혼합기 B-01", line: "배합 2라인", status: "대기", temperature: 24, createdAt: now, updatedAt: now },
    ])
    .run();
}

