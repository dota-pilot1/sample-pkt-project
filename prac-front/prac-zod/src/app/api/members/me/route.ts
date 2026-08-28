import { NextResponse } from "next/server";
import { memberSchema } from "../../../../features/member/member-schema";
import { readMember, updateMember } from "../../../../server/member-store";

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

  // 실제 서비스라면 DB의 unique 제약 조건 오류를 이 응답으로 변환한다.
  if (parsed.data.email === "taken@example.com") {
    return NextResponse.json(
      {
        message: "이메일이 이미 사용 중입니다.",
        fieldErrors: {
          email: ["다른 사용자가 이미 이 이메일로 변경했습니다."],
        },
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ member: updateMember(parsed.data) });
}
