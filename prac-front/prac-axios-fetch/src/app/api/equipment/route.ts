import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import {
  createEquipment,
  getEquipmentList,
} from "@/server/equipment/equipment-repository";
import { isCreateEquipmentInput } from "@/server/equipment/equipment-validation";
import { apiError } from "@/server/http/api-response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await getCurrentUser())) {
    return apiError(401, "UNAUTHENTICATED", "로그인이 필요합니다.");
  }

  // 실제 네트워크 성공 뒤 500 Response가 도착하는 흐름을 학습 화면에서 재현한다.
  if (new URL(request.url).searchParams.get("scenario") === "error") {
    return apiError(500, "EQUIPMENT_READ_FAILED", "설비 조회 중 서버 오류가 발생했습니다.");
  }

  await new Promise((resolve) => setTimeout(resolve, 350));
  return NextResponse.json({
    equipment: getEquipmentList(),
    fetchedAt: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  if (!(await getCurrentUser())) {
    return apiError(401, "UNAUTHENTICATED", "로그인이 필요합니다.");
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isCreateEquipmentInput(body)) {
    return apiError(
      400,
      "INVALID_EQUIPMENT",
      "설비명·라인·상태와 -20~150℃의 정수 온도를 확인해 주세요.",
    );
  }

  const equipment = createEquipment({
    ...body,
    name: body.name.trim(),
    line: body.line.trim(),
  });
  return NextResponse.json(
    { equipment, message: `${equipment.name} 설비를 등록했습니다.` },
    { status: 201 },
  );
}

