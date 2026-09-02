import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import {
  deleteEquipment,
  getEquipmentById,
  updateEquipment,
} from "@/server/equipment/equipment-repository";
import { isUpdateEquipmentInput } from "@/server/equipment/equipment-validation";
import { apiError } from "@/server/http/api-response";

export const runtime = "nodejs";

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/equipment/[id]">,
) {
  if (!(await getCurrentUser())) {
    return apiError(401, "UNAUTHENTICATED", "로그인이 필요합니다.");
  }

  const id = parseId((await context.params).id);
  if (!id) return apiError(400, "INVALID_ID", "설비 ID가 올바르지 않습니다.");

  const body: unknown = await request.json().catch(() => null);
  if (!isUpdateEquipmentInput(body)) {
    return apiError(400, "INVALID_EQUIPMENT", "설비 입력값과 version을 확인해 주세요.");
  }

  const current = getEquipmentById(id);
  if (!current) return apiError(404, "EQUIPMENT_NOT_FOUND", "설비를 찾을 수 없습니다.");

  const equipment = updateEquipment({
    ...body,
    id,
    name: body.name.trim(),
    line: body.line.trim(),
  });
  if (!equipment) {
    return apiError(
      409,
      "VERSION_CONFLICT",
      "다른 사용자가 먼저 수정했습니다. 목록을 새로고침한 뒤 다시 시도해 주세요.",
    );
  }

  return NextResponse.json({ equipment, message: `${equipment.name} 설비를 수정했습니다.` });
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/equipment/[id]">,
) {
  if (!(await getCurrentUser())) {
    return apiError(401, "UNAUTHENTICATED", "로그인이 필요합니다.");
  }

  const id = parseId((await context.params).id);
  if (!id) return apiError(400, "INVALID_ID", "설비 ID가 올바르지 않습니다.");
  if (!deleteEquipment(id)) {
    return apiError(404, "EQUIPMENT_NOT_FOUND", "이미 삭제됐거나 존재하지 않는 설비입니다.");
  }

  return NextResponse.json({ deletedId: id, message: `#${id} 설비를 삭제했습니다.` });
}

