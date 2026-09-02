import { NextResponse } from "next/server";
import { nicknameSchema } from "../../../../features/member/member-schema";
import { getNicknameAvailability } from "../../../../server/member-store";

export function GET(request: Request) {
  const nickname = new URL(request.url).searchParams.get("nickname") ?? "";
  const parsed = nicknameSchema.safeParse(nickname);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "닉네임을 확인하세요." },
      { status: 400 },
    );
  }

  // 중복 확인은 UX를 위한 사전 조회일 뿐, PATCH에서도 같은 검사를 다시 해야 한다.
  const status = getNicknameAvailability(parsed.data);
  if (status === "current") {
    return NextResponse.json({
      status,
      message: "현재 설정된 닉네임입니다.",
    });
  }

  if (status === "taken") {
    return NextResponse.json({
      status,
      message: "이미 사용 중인 닉네임입니다.",
    });
  }

  return NextResponse.json({
    status,
    message: "사용할 수 있는 닉네임입니다.",
  });
}
