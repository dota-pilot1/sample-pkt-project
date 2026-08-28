import { NextResponse } from "next/server";
import { createSignupSubmission, isEmailAvailable, listSignupSubmissions } from "@/src/db/database";
import { signupSchema } from "@/src/features/signup/model/signupSchema";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ submissions: listSignupSubmissions() });
}

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { message: "입력값을 확인해 주세요.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();

  // 중복 확인 버튼을 통과했어도 저장 직전에 다시 검사한다.
  if (!isEmailAvailable(email)) {
    return NextResponse.json({ message: "이미 등록된 이메일입니다." }, { status: 409 });
  }

  // 학습용 앱에서도 비밀번호 원문은 저장하지 않는다.
  const submission = createSignupSubmission(email, parsed.data.username);
  return NextResponse.json({ submission }, { status: 201 });
}
