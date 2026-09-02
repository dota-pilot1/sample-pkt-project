import { NextResponse } from "next/server";
import type { ApiErrorResponse } from "@/entities/equipment/model/equipment";

export function apiError(status: number, code: string, message: string) {
  return NextResponse.json<ApiErrorResponse>({ code, message }, { status });
}

