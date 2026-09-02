import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/sqlite";
import { equipmentTable } from "@/server/db/schema";
import type {
  CreateEquipmentInput,
  UpdateEquipmentInput,
} from "@/entities/equipment/model/equipment";

/** SQLite에 저장된 설비를 최신 수정 순서로 조회한다. */
export function getEquipmentList() {
  return db
    .select()
    .from(equipmentTable)
    .orderBy(desc(equipmentTable.updatedAt), desc(equipmentTable.id))
    .all();
}

/** 새 설비를 저장하고 DB가 확정한 ID·version·시간을 반환한다. */
export function createEquipment(input: CreateEquipmentInput) {
  const now = new Date().toISOString();
  return db
    .insert(equipmentTable)
    .values({ ...input, version: 1, createdAt: now, updatedAt: now })
    .returning()
    .get();
}

/** expectedVersion이 일치할 때만 설비를 수정해 오래된 화면의 덮어쓰기를 막는다. */
export function updateEquipment(input: UpdateEquipmentInput) {
  return (
    db
      .update(equipmentTable)
      .set({
        name: input.name,
        line: input.line,
        status: input.status,
        temperature: input.temperature,
        version: sql`${equipmentTable.version} + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(equipmentTable.id, input.id),
          eq(equipmentTable.version, input.expectedVersion),
        ),
      )
      .returning()
      .get() ?? null
  );
}

export function getEquipmentById(id: number) {
  return db.select().from(equipmentTable).where(eq(equipmentTable.id, id)).get() ?? null;
}

/** 요청한 ID의 설비를 삭제하고 실제 삭제 여부를 반환한다. */
export function deleteEquipment(id: number) {
  return Boolean(
    db
      .delete(equipmentTable)
      .where(eq(equipmentTable.id, id))
      .returning({ id: equipmentTable.id })
      .get(),
  );
}

