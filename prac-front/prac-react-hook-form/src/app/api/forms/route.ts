import { NextResponse } from "next/server";
import { z } from "zod";
import { createSignupSubmission, isEmailAvailable, listSignupSubmissions } from "@/src/db/database";

export const runtime = "nodejs";

const requestSchema = z.object({ email: z.string().trim().email(), username: z.string().trim().min(2).max(50), password: z.string().min(8).regex(/[A-Za-z]/).regex(/\d/) });

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email");
  if (email) return NextResponse.json({ available: isEmailAvailable(email.trim().toLowerCase()) });
  return NextResponse.json({ submissions: listSignupSubmissions() });
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "입력값을 확인해 주세요.", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  const values = { ...parsed.data, email: parsed.data.email.toLowerCase() };
  if (!isEmailAvailable(values.email)) return NextResponse.json({ message: "이미 등록된 이메일입니다." }, { status: 409 });
  // 비밀번호 원문은 학습용 앱에서도 저장하지 않는다. 저장 여부만 기록한다.
  const submission = createSignupSubmission(values.email, values.username);
  return NextResponse.json({ submission }, { status: 201 });
}
