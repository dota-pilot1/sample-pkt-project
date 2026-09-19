"use client";

import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Popover } from "@/shared/ui/popover/popover";
import { useAuthStore } from "../model/auth-store";

const roleNames: Record<string, string> = {
  SYSTEM_ADMIN: "시스템 관리자",
  PRODUCT_OPERATOR: "상품 운영 담당자",
  CUSTOMER: "고객",
};

function roleLabel(roleCodes: string[]) {
  return roleCodes.map((code) => roleNames[code] ?? code).join(", ");
}

/** 상단 네비게이션에서 현재 로그인 사용자 정보와 로그아웃을 제공한다. */
export function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  if (!user) return null;

  const signOutAndRedirect = () => {
    signOut();
    router.replace("/login");
  };

  return (
    <Popover
      className="user-menu"
      panelClassName="user-menu-panel"
      trigger={
        <span className="user-menu-avatar" aria-hidden="true">
          {user.displayName.slice(0, 1)}
        </span>
      }
      triggerClassName="user-menu-trigger"
      triggerLabel={`${user.displayName} 사용자 메뉴`}
    >
      <div className="user-menu-profile">
        <span className="user-menu-profile-avatar" aria-hidden="true">
          <UserRound size={18} />
        </span>
        <div>
          <strong>{user.displayName}</strong>
          <span>{user.email}</span>
          <small>{roleLabel(user.roleCodes)}</small>
        </div>
      </div>
      <Link className="user-menu-profile-link" href="/profile">
        내 프로필 보기
      </Link>
      <button className="user-menu-sign-out" onClick={signOutAndRedirect} type="button">
        <LogOut size={16} />
        로그아웃
      </button>
    </Popover>
  );
}
