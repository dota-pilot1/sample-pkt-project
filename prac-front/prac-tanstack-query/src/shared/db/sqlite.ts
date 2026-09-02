import "server-only";

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const isNextBuild = process.env.NEXT_PHASE === "phase-production-build";
const dataDirectory = isNextBuild
  ? path.join(os.tmpdir(), `tanstack-query-build-${process.pid}`)
  : path.join(process.cwd(), ".data");

fs.mkdirSync(dataDirectory, { recursive: true });

export const databasePath = path.join(dataDirectory, "tanstack-query.db");
export const sqlite = new Database(databasePath);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("busy_timeout = 5000");

export const db = drizzle(sqlite);
