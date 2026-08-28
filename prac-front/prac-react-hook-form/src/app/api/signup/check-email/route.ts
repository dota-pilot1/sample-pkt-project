import { NextResponse } from "next/server";
import { z } from "zod";
import { isEmailAvailable } from "@/src/db/database";

export const runtime = "nodejs";

export function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase();
  const parsed = z.string().email().safeParse(email);

  if (!parsed.success) {
    return NextResponse.json({ message: "이메일 형식을 확인해 주세요." }, { status: 400 });
  }

  return NextResponse.json({ available: isEmailAvailable(parsed.data) });
}
