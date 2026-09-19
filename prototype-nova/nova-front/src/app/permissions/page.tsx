"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import {
  permissionApi,
  type CreatePermissionRequest,
  type Permission,
} from "@/features/permission/api";
import { roleApi } from "@/features/role/api";
import { ApiError } from "@/shared/api/client";
import { AuthGate } from "@/features/auth/login/ui/auth-gate";

const emptyForm: CreatePermissionRequest = {
  permissionCode: "",
  name: "",
  description: "",
};

export default function PermissionsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const permissions = useQuery({ queryKey: ["permissions"], queryFn: permissionApi.findAll });
  const roles = useQuery({ queryKey: ["roles"], queryFn: roleApi.findAll });
  const selectedRole = selectedRoleId ?? roles.data?.[0]?.id ?? null;
  const rolePermissions = useQuery({
    queryKey: ["role-permissions", selectedRole],
    queryFn: () => roleApi.permissions(selectedRole!),
    enabled: selectedRole !== null,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["permissions"] });

  const createPermission = useMutation({
    mutationFn: permissionApi.create,
    onSuccess: () => {
      setForm(emptyForm);
      setMessage("권한을 등록했습니다.");
      refresh();
    },
    onError: (error) => setMessage(error instanceof ApiError ? error.message : "권한을 등록하지 못했습니다."),
  });
  const changeEnabled = useMutation({
    mutationFn: ({ id, enabled }: Pick<Permission, "id" | "enabled">) => permissionApi.changeEnabled(id, enabled),
    onSuccess: () => {
      setMessage("사용 여부를 변경했습니다.");
      refresh();
    },
    onError: () => setMessage("사용 여부를 변경하지 못했습니다."),
  });
  const assignSelectedPermissionsToRole = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
      roleApi.assignSelectedPermissionsToRole(roleId, permissionIds),
    onSuccess: () => {
      setMessage("역할 권한을 저장했습니다.");
      // 저장 후 서버 결과를 다시 조회해 화면과 DB 상태를 일치시킨다.
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
    },
    onError: (error) => setMessage(error instanceof ApiError ? error.message : "역할 권한을 저장하지 못했습니다."),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    createPermission.mutate(form);
  }

  /**
   * 체크박스를 눌렀을 때 선택한 역할의 권한 목록을 다시 만든 뒤 서버에 저장한다.
   * 체크하면 권한을 추가하고, 체크를 해제하면 권한을 제거한다.
   */
  function toggleRolePermission(permissionId: number) {
    if (selectedRole === null || !rolePermissions.data) return;
    // 현재 연결된 권한 목록을 가져온다.
    const currentIds = rolePermissions.data.permissions.map((permission) => permission.id);
    const permissionIds = currentIds.includes(permissionId)
      ? currentIds.filter((id) => id !== permissionId)
      : [...currentIds, permissionId];
    setMessage("");
    // 바뀐 권한 목록을 역할에 저장한다.
    assignSelectedPermissionsToRole.mutate({ roleId: selectedRole, permissionIds });
  }

  return (
    <AuthGate>
    <main className="page-body permission-page">
      <Link className="back-link" href="/"><ArrowLeft size={16} /> 상품·요금제 관리로 돌아가기</Link>
      <div className="page-heading">
        <h1>권한 관리</h1>
        <p>권한을 등록하고 사용 여부를 관리하며, 역할별 권한 연결을 편집합니다.</p>
      </div>
      <section className="permission-grid">
        <form className="permission-form" onSubmit={submit}>
          <h2>새 권한</h2>
          <label>권한 코드<input required pattern="[A-Z][A-Z0-9_]{2,99}" value={form.permissionCode} onChange={(event) => setForm({ ...form, permissionCode: event.target.value.toUpperCase() })} placeholder="PLAN_READ" /></label>
          <label>권한 이름<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="요금제 조회" /></label>
          <label>설명<textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="권한의 사용 목적을 작성하세요." /></label>
          <button type="submit" disabled={createPermission.isPending}>{createPermission.isPending ? "등록 중…" : "권한 등록"}</button>
          {message && <p className="permission-message" role="status">{message}</p>}
        </form>
        <section className="permission-list" aria-labelledby="permission-list-title">
          <div className="permission-list-heading"><ShieldCheck size={22} /><h2 id="permission-list-title">권한 목록</h2></div>
          {permissions.isLoading && <p>권한을 불러오는 중입니다.</p>}
          {permissions.isError && <p className="permission-error">권한 목록을 불러오지 못했습니다.</p>}
          {permissions.data?.length === 0 && <p>등록된 권한이 없습니다.</p>}
          {permissions.data?.map((permission) => (
            <article className="permission-card" key={permission.id}>
              <div><strong>{permission.name}</strong><code>{permission.permissionCode}</code><p>{permission.description}</p></div>
              <button className={permission.enabled ? "enabled-button" : "disabled-button"} onClick={() => changeEnabled.mutate({ id: permission.id, enabled: !permission.enabled })} disabled={changeEnabled.isPending}>
                {permission.enabled ? "사용 중" : "미사용"}
              </button>
            </article>
          ))}
        </section>
      </section>
      <section className="role-mapping" aria-labelledby="role-mapping-title">
        <div>
          <h2 id="role-mapping-title">역할별 권한 매핑</h2>
          <p>역할을 선택한 뒤 허용할 권한을 켜거나 끕니다. 저장 결과는 서버의 역할-권한 집합으로 즉시 교체됩니다.</p>
        </div>
        {roles.isLoading && <p>역할을 불러오는 중입니다.</p>}
        {roles.isError && <p className="permission-error">역할을 불러오지 못했습니다.</p>}
        {roles.data && roles.data.length === 0 && <p>등록된 역할이 없습니다.</p>}
        {roles.data && roles.data.length > 0 && (
          <>
            <label className="role-selector">
              역할
              <select value={selectedRole ?? ""} onChange={(event) => setSelectedRoleId(Number(event.target.value))}>
                {roles.data.map((role) => <option key={role.id} value={role.id}>{role.name} ({role.roleCode})</option>)}
              </select>
            </label>
            {rolePermissions.isLoading && <p>역할 권한을 불러오는 중입니다.</p>}
            {rolePermissions.isError && <p className="permission-error">역할 권한을 불러오지 못했습니다.</p>}
            {rolePermissions.data && (
              <div className="mapping-permissions">
                {permissions.data?.map((permission) => {
                  const checked = rolePermissions.data.permissions.some((mapped) => mapped.id === permission.id);
                  return (
                    <label className="mapping-permission" key={permission.id}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!permission.enabled || assignSelectedPermissionsToRole.isPending}
                        onChange={() => toggleRolePermission(permission.id)}
                      />
                      <span><strong>{permission.name}</strong><code>{permission.permissionCode}</code></span>
                    </label>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </main>
    </AuthGate>
  );
}
