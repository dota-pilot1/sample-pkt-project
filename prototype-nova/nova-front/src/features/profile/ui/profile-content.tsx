"use client";

import { KeyRound, UserRound } from "lucide-react";
import { useId, useMemo, useState } from "react";
import type { Profile } from "../model/types";

type RoleSelection = "all" | string;

const roleOptionClassName = (active: boolean) =>
  [
    "inline-flex min-h-[42px] items-center justify-between gap-2 rounded-lg border px-[13px] py-[9px] text-left text-[calc(12px*var(--font-scale-factor))] font-extrabold transition-[border-color,background,color]",
    active
      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-deep)]"
      : "border-[var(--line)] bg-[var(--surface-raised)] text-[var(--muted)] hover:border-[#f5b5a7] hover:bg-[#fff8f6] hover:text-[var(--accent-deep)]",
  ].join(" ");

const roleCountClassName = (active: boolean) =>
  [
    "grid size-[22px] place-items-center rounded-full bg-[var(--surface-raised)] text-[calc(10px*var(--font-scale-factor))] text-[var(--muted)]",
    active && "bg-[rgba(240,90,60,.16)] text-[var(--accent-deep)]",
  ]
    .filter(Boolean)
    .join(" ");

/** 역할별 권한을 탐색하고 고정 계정 요약을 함께 보여 주는 프로필 표현 컴포넌트다. */
export function ProfileContent({ profile }: { profile: Profile }) {
  const [selectedRoleCode, setSelectedRoleCode] = useState<RoleSelection>("all");
  const listId = useId();
  const selectedRole = useMemo(
    () => profile.roles.find((role) => role.code === selectedRoleCode),
    [profile.roles, selectedRoleCode],
  );
  // 백엔드 재시작 전의 이전 응답에는 역할별 permissions가 없을 수 있어 빈 목록으로 보정한다.
  const selectedRolePermissions = selectedRole?.permissions ?? [];
  // 전체는 여러 역할의 권한을 중복 제거한 서버 응답을 그대로 사용한다.
  const visiblePermissions = selectedRole ? selectedRolePermissions : profile.permissions;
  const permissionTitle = selectedRole ? `${selectedRole.name} 권한` : "전체 권한";

  return (
    <div className="grid min-w-0 items-start gap-5 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
      <section
        className="order-1 min-h-[420px] min-w-0 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-6 min-[900px]:order-none"
        aria-labelledby="profile-permission-title"
      >
        <div>
          <h2 id="profile-permission-title" className="m-0 text-[calc(18px*var(--font-scale-factor))] text-[var(--ink)]">
            권한 정보
          </h2>
          <p className="mt-[7px] mb-0 text-[calc(12px*var(--font-scale-factor))] text-[var(--muted)]">
            역할을 선택하면 해당 역할에 직접 연결된 권한을 확인합니다.
          </p>
        </div>
        <div className="mt-6">
          <nav className="flex flex-wrap gap-2 border-b border-[var(--line)] pb-4 max-[600px]:gap-1.5" aria-label="역할 목록">
            <button
              aria-current={selectedRoleCode === "all" ? "true" : undefined}
              className={roleOptionClassName(selectedRoleCode === "all")}
              onClick={() => setSelectedRoleCode("all")}
              type="button"
            >
              전체
              <span className={roleCountClassName(selectedRoleCode === "all")}>
                {profile.permissions.length}
              </span>
            </button>
            {profile.roles.map((role) => {
              // 이전 API 응답과 호환하기 위해 역할별 권한이 없으면 0개로 표시한다.
              const rolePermissions = role.permissions ?? [];
              const isSelected = selectedRoleCode === role.code;
              return (
                <button
                  aria-current={isSelected ? "true" : undefined}
                  className={roleOptionClassName(isSelected)}
                  key={role.code}
                  onClick={() => setSelectedRoleCode(role.code)}
                  type="button"
                >
                  {role.name}
                  <span className={roleCountClassName(isSelected)}>
                    {rolePermissions.length}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="min-w-0 pt-[18px]" id={listId} aria-live="polite">
            <div className="flex items-center gap-2 text-[var(--accent-deep)]">
              <KeyRound aria-hidden="true" size={18} />
              <h3 className="m-0 text-[calc(15px*var(--font-scale-factor))] text-[var(--ink)]">
                {permissionTitle}
              </h3>
              <span className="ml-auto grid size-[22px] place-items-center rounded-full bg-[var(--surface-raised)] text-[calc(10px*var(--font-scale-factor))] text-[var(--muted)]">
                {visiblePermissions.length}개
              </span>
            </div>
            {visiblePermissions.length ? (
              <ul className="mt-5 grid list-none grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-2.5 p-0">
                {visiblePermissions.map((permission) => (
                  <li className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-raised)] p-3.5" key={permission.code}>
                    <strong className="block text-[calc(13px*var(--font-scale-factor))] text-[var(--ink)]">
                      {permission.name}
                    </strong>
                    <code className="mt-[5px] inline-block text-[calc(11px*var(--font-scale-factor))] text-[var(--accent-deep)]">
                      {permission.code}
                    </code>
                    <p className="mt-[7px] mb-0 text-[calc(12px*var(--font-scale-factor))] leading-[1.55] text-[var(--muted)]">
                      {permission.description}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-[7px] mb-0 text-[calc(12px*var(--font-scale-factor))] leading-[1.55] text-[var(--muted)]">
                선택한 범위에 사용 가능한 활성 권한이 없습니다.
              </p>
            )}
          </div>
        </div>
      </section>

      <aside
        className="order-0 grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-6 min-[900px]:sticky min-[900px]:top-6 min-[900px]:order-none"
        aria-labelledby="profile-summary-title"
      >
        <div className="grid size-[58px] place-items-center rounded-[18px] bg-[var(--accent-soft)] text-[var(--accent-deep)]" aria-hidden="true">
          <UserRound size={30} />
        </div>
        <div>
          <p className="mt-0 mb-[5px] text-[calc(10px*var(--font-scale-factor))] font-extrabold tracking-[.12em] text-[var(--muted)]">ACCOUNT</p>
          <h2 id="profile-summary-title" className="m-0 text-[calc(18px*var(--font-scale-factor))] text-[var(--ink)]">{profile.displayName}</h2>
          <p className="mt-1.5 mb-0 text-[calc(12px*var(--font-scale-factor))] text-[var(--muted)]">{profile.email}</p>
        </div>
        <span className={profile.active
          ? "whitespace-nowrap rounded-full bg-[#edf8f0] px-[9px] py-[6px] text-[calc(11px*var(--font-scale-factor))] font-extrabold text-[#27733c]"
          : "whitespace-nowrap rounded-full bg-[#fff1ef] px-[9px] py-[6px] text-[calc(11px*var(--font-scale-factor))] font-extrabold text-[var(--accent-deep)]"}>
          {profile.active ? "활성 계정" : "비활성 계정"}
        </span>
        <dl className="col-span-full mt-2 grid grid-cols-2 gap-3 border-t border-[var(--line)] pt-[18px]">
          <div className="grid gap-1">
            <dt className="text-[calc(11px*var(--font-scale-factor))] text-[var(--muted)]">사용자 ID</dt>
            <dd className="m-0 text-[calc(13px*var(--font-scale-factor))] font-bold text-[var(--ink)]">{profile.id}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-[calc(11px*var(--font-scale-factor))] text-[var(--muted)]">가입일</dt>
            <dd className="m-0 text-[calc(13px*var(--font-scale-factor))] font-bold text-[var(--ink)]">
              {new Intl.DateTimeFormat("ko-KR", { dateStyle: "long" }).format(new Date(profile.createdAt))}
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
