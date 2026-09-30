"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useAuthStore } from "@/features/auth/login/model/auth-store";

/** 시스템 관리자에게만 관리자 영역으로 들어가는 빠른 버튼을 보여 준다. */
export function AdminLink() {
  const user = useAuthStore((state) => state.user);
  if (!user?.roleCodes.includes("SYSTEM_ADMIN")) return null;
  return <Link className="admin-link" href="/admin" aria-label="관리자 설정 열기" title="관리자 설정"><Settings aria-hidden="true" size={18} /></Link>;
}
