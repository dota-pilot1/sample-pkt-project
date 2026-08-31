"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, PackageSearch } from "lucide-react";
import { useAuth, authActions } from "@/entities/user/model/authStore";
import { LanguageSelect } from "@/shared/ui/LanguageSelect";
import { ThemeSwitcher } from "@/shared/ui/theme/ThemeSwitcher";

export function Header() {
  const { status, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await authActions.logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <nav className="flex min-w-0 items-center gap-1 sm:gap-4">
          <Link href="/main" className="mr-2 text-sm font-semibold tracking-tight hover:opacity-80">
            PKT LOT Lab
          </Link>
          {status === "authenticated" && (
            <>
              <Link href="/main" className="rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                홈
              </Link>
              <Link href="/lots" className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                <PackageSearch className="h-4 w-4" />
                LOT 목록
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSelect />
          <ThemeSwitcher />
          {status === "authenticated" ? (
            <>
              <span className="hidden max-w-40 truncate text-sm text-muted-foreground sm:block">
                {user?.username ?? user?.email}
              </span>
              <button type="button" onClick={handleLogout} className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-accent">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </>
          ) : status === "anonymous" ? (
            <Link href="/login" className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">로그인</span>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
