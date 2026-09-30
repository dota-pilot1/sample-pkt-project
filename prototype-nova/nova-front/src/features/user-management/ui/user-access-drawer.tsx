"use client";

import { KeyRound, ShieldCheck, UserRound, X } from "lucide-react";
import type { ManagedUser } from "@/features/user-management/api";
import { useUserAccessSummary } from "@/features/user-management/model/use-user-access-summary";
import { ApiError } from "@/shared/api/client";
import { SideDrawer } from "@/shared/ui/side-drawer";

type UserAccessDrawerProps = {
  isOpen: boolean;
  user: ManagedUser | null;
  onClose: () => void;
  onExited: () => void;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { dateStyle: "long" }).format(
    new Date(value),
  );

/** 관리자 목록에서 선택한 사용자의 활성 역할과 실효 권한을 보여 준다. */
export function UserAccessDrawer({
  isOpen,
  user,
  onClose,
  onExited,
}: UserAccessDrawerProps) {
  const accessSummary = useUserAccessSummary(user?.id ?? null);

  if (user === null) return null;

  return (
    <SideDrawer
      ariaLabel={`${user.displayName} 사용자 상세`}
      onClose={onClose}
      onExited={onExited}
      open={isOpen}
    >
      <div className="user-access-drawer">
        <header className="user-drawer-header">
          <div>
            <p>USER ACCESS</p>
            <h2>{user.displayName} 상세</h2>
          </div>
          <button aria-label="상세 닫기" className="user-drawer-close" onClick={onClose} type="button">
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <div className="user-drawer-content">
          <section className="user-access-summary" aria-label="계정 정보">
            <div className="user-access-avatar" aria-hidden="true">
              <UserRound size={24} />
            </div>
            <div>
              <strong>{user.displayName}</strong>
              <span>{user.email}</span>
            </div>
            <span className={`user-status ${user.active ? "is-active" : "is-inactive"}`}>
              {user.active ? "활성" : "비활성"}
            </span>
            <dl>
              <div>
                <dt>사용자 ID</dt>
                <dd>#{user.id}</dd>
              </div>
              <div>
                <dt>가입일</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="user-access-section" aria-labelledby="user-access-role-title">
            <div className="user-access-heading">
              <ShieldCheck aria-hidden="true" size={19} />
              <div>
                <h3 id="user-access-role-title">역할과 권한</h3>
                <p>활성 역할과 현재 적용되는 권한을 확인합니다.</p>
              </div>
            </div>
            {accessSummary.isPending ? (
              <p className="user-access-state">권한 정보를 불러오는 중입니다.</p>
            ) : accessSummary.isError ? (
              <p className="user-access-state is-error" role="alert">
                {accessSummary.error instanceof ApiError
                  ? accessSummary.error.message
                  : "권한 정보를 불러오지 못했습니다."}
              </p>
            ) : (
              <>
                <div className="user-permission-list">
                  <div className="user-permission-list-heading">
                    <KeyRound aria-hidden="true" size={17} />
                    <h4>역할별 권한</h4>
                    <span>{accessSummary.data?.permissions.length ?? 0}개</span>
                  </div>
                  {accessSummary.data?.roles.length ? (
                    <div className="user-role-permission-groups">
                      {accessSummary.data.roles.map((role) => (
                        <section className="user-role-permission-group" key={role.code} aria-labelledby={`user-role-${role.code}`}>
                          <div className="user-role-permission-group-heading">
                            <div><strong id={`user-role-${role.code}`}>{role.name}</strong><code>{role.code}</code></div>
                            <span>{role.permissions.length}개</span>
                          </div>
                          {role.permissions.length ? (
                            <ul>
                              {role.permissions.map((permission) => (
                                <li key={permission.code}>
                                  <strong>{permission.name}</strong>
                                  <code>{permission.code}</code>
                                  <p>{permission.description}</p>
                                </li>
                              ))}
                            </ul>
                          ) : <p className="user-access-state">연결된 권한이 없습니다.</p>}
                        </section>
                      ))}
                    </div>
                  ) : (
                    <p className="user-access-state">연결된 역할이 없습니다.</p>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </SideDrawer>
  );
}
