"use client";

import { useQuery } from "@tanstack/react-query";
import { KeyRound, ShieldCheck, X } from "lucide-react";
import { roleApi, type Role } from "@/features/role/api";
import { ApiError } from "@/shared/api/client";
import { SideDrawer } from "@/shared/ui/side-drawer";

export function RoleDetailDrawer({ role, open, onClose, onExited }: { role: Role; open: boolean; onClose: () => void; onExited: () => void }) {
  const permissions = useQuery({
    queryKey: ["role-permissions", role.id],
    queryFn: () => roleApi.permissions(role.id),
    enabled: open,
  });

  return (
    <SideDrawer ariaLabel={`${role.name} 역할 상세`} onClose={onClose} onExited={onExited} open={open}>
      <div className="role-detail-drawer">
        <header className="role-drawer-header">
          <div><p>ROLE DETAIL</p><h2>{role.name}</h2><code>{role.roleCode}</code></div>
          <button type="button" className="role-drawer-close" onClick={onClose} aria-label="역할 상세 닫기"><X aria-hidden="true" size={20} /></button>
        </header>
        <div className="role-detail-content">
          <div className="role-detail-summary"><span>상태</span><strong className={role.enabled ? "is-enabled" : "is-disabled"}>{role.enabled ? "사용 중" : "미사용"}</strong></div>
          <section className="role-detail-section" aria-labelledby="role-detail-permissions-title">
            <div className="role-drawer-section-heading"><ShieldCheck aria-hidden="true" size={17} /><h3 id="role-detail-permissions-title">연결된 권한</h3><span>{permissions.data?.permissions.length ?? 0}개</span></div>
            {permissions.isPending ? <p className="role-drawer-state">권한 정보를 불러오는 중입니다.</p> : permissions.isError ? <p className="role-drawer-state is-error" role="alert">{permissions.error instanceof ApiError ? permissions.error.message : "권한 정보를 불러오지 못했습니다."}</p> : permissions.data?.permissions.length ? <ul className="role-detail-permission-list">{permissions.data.permissions.map((permission) => <li key={permission.id}><KeyRound aria-hidden="true" size={16} /><span><strong>{permission.name}</strong><code>{permission.permissionCode}</code><small>{permission.description}</small></span></li>)}</ul> : <p className="role-drawer-state">연결된 권한이 없습니다.</p>}
          </section>
        </div>
      </div>
    </SideDrawer>
  );
}
