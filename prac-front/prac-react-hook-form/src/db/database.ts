import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDirectory = path.join(process.cwd(), ".data");
fs.mkdirSync(dataDirectory, { recursive: true });

const database = new Database(path.join(dataDirectory, "react-hook-form.db"));
database.pragma("journal_mode = WAL");
database.exec(`
  CREATE TABLE IF NOT EXISTS signup_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    password_set INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  )
`);

export type SignupSubmission = { id: number; email: string; username: string; createdAt: string };

export function createSignupSubmission(email: string, username: string): SignupSubmission {
  const createdAt = new Date().toISOString();
  const result = database.prepare(
    "INSERT INTO signup_submissions (email, username, password_set, created_at) VALUES (?, ?, 1, ?)",
  ).run(email, username, createdAt);
  return { id: Number(result.lastInsertRowid), email, username, createdAt };
}

export function listSignupSubmissions(): SignupSubmission[] {
  return database.prepare(
    "SELECT id, email, username, created_at AS createdAt FROM signup_submissions ORDER BY id DESC",
  ).all() as SignupSubmission[];
}

export function isEmailAvailable(email: string): boolean {
  return !database.prepare("SELECT 1 FROM signup_submissions WHERE email = ? LIMIT 1").get(email);
}
