import { NextResponse } from "next/server";
import { memberSchema } from "../../../../features/member/member-schema";
import {
  getNicknameAvailability,
  readMember,
  updateMember,
} from "../../../../server/member-store";

export function GET() {
  // 조회 API는 학습용 서버 메모리에 있는 현재 회원 정보를 JSON으로 반환한다.
  return NextResponse.json({ member: readMember() });
}

export async function PATCH(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  // 학습 포인트: 프론트와 같은 Zod 스키마로 서버에서도 신뢰 경계의 입력값을 검증한다.
  const parsed = memberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "입력값을 다시 확인하세요.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // 실제 서비스라면 DB의 unique 제약 조건 오류를 이 필드 오류 응답으로 변환한다.
  if (getNicknameAvailability(parsed.data.nickname) === "taken") {
    return NextResponse.json(
      {
        message: "닉네임이 이미 사용 중입니다.",
        fieldErrors: {
          nickname: ["다른 회원이 이미 사용하는 닉네임입니다."],
        },
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ member: updateMember(parsed.data) });
}
