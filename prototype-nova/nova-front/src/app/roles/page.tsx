"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Pencil, Plus } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { permissionApi } from "@/features/permission/api";
import { roleApi, type CreateRoleRequest, type Role } from "@/features/role/api";
import { ApiError } from "@/shared/api/client";
import { AdminShell } from "@/features/admin/ui/admin-shell";
import { RoleDetailDrawer } from "@/features/role/ui/role-detail-drawer";
import { SideDrawer } from "@/shared/ui/side-drawer";
import { SearchInput } from "@/shared/ui/search-input";

const emptyForm: CreateRoleRequest = { roleCode: "", name: "" };
type StatusFilter = "ALL" | "ENABLED" | "DISABLED";

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [detailRole, setDetailRole] = useState<Role | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [permissionQuery, setPermissionQuery] = useState("");
  const [permissionCategoryFilter, setPermissionCategoryFilter] = useState<number | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [message, setMessage] = useState("");
  const roles = useQuery({ queryKey: ["roles"], queryFn: roleApi.findAll });
  const permissions = useQuery({
    queryKey: ["permissions"],
    queryFn: permissionApi.findAll,
    enabled: isEditorOpen && editingRoleId !== null,
  });
  const rolePermissions = useQuery({
    queryKey: ["role-permissions", editingRoleId],
    queryFn: () => roleApi.permissions(editingRoleId!),
    enabled: isEditorOpen && editingRoleId !== null,
  });

  const allRoles = useMemo(() => roles.data ?? [], [roles.data]);
  const permissionItems = useMemo(() => permissions.data ?? [], [permissions.data]);
  const activeCount = allRoles.filter((role) => role.enabled).length;
  const inactiveCount = allRoles.length - activeCount;
  const filteredRoles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allRoles.filter((role) => {
      const matchesStatus = statusFilter === "ALL"
        || (statusFilter === "ENABLED" && role.enabled)
        || (statusFilter === "DISABLED" && !role.enabled);
      const matchesQuery = !normalizedQuery
        || role.name.toLowerCase().includes(normalizedQuery)
        || role.roleCode.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [allRoles, query, statusFilter]);
  const permissionGroups = useMemo(() => {
    const normalizedQuery = permissionQuery.trim().toLowerCase();
    const groups = new Map<string, typeof permissionItems>();
    permissionItems.filter((permission) => {
      const matchesCategory = permissionCategoryFilter === "ALL" || permission.category?.id === permissionCategoryFilter;
      const matchesQuery = !normalizedQuery || [permission.name, permission.permissionCode, permission.description, permission.category?.name ?? ""].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesCategory && matchesQuery;
    }).forEach((permission) => {
      const categoryName = permission.category?.name ?? "미분류";
      groups.set(categoryName, [...(groups.get(categoryName) ?? []), permission]);
    });
    return [...groups.entries()];
  }, [permissionCategoryFilter, permissionItems, permissionQuery]);
  const permissionCategories = useMemo(() => {
    const categories = new Map<number, { id: number; name: string; count: number }>();
    permissionItems.forEach((permission) => {
      if (!permission.category) return;
      const current = categories.get(permission.category.id);
      categories.set(permission.category.id, { id: permission.category.id, name: permission.category.name, count: (current?.count ?? 0) + 1 });
    });
    return [...categories.values()];
  }, [permissionItems]);

  const refreshRoles = () => queryClient.invalidateQueries({ queryKey: ["roles"] });
  const closeEditor = () => {
    setEditorOpen(false);
  };
  const createRole = useMutation({
    mutationFn: roleApi.create,
    onSuccess: () => {
      closeEditor();
      setMessage("새 역할을 등록했습니다.");
      refreshRoles();
    },
    onError: (error) => setMessage(error instanceof ApiError ? error.message : "역할을 등록하지 못했습니다."),
  });
  useEffect(() => {
    if (editingRoleId !== null && rolePermissions.data) {
      setSelectedPermissionIds(rolePermissions.data.permissions.map((permission) => permission.id));
    }
  }, [editingRoleId, rolePermissions.data]);

  const updateRole = useMutation({
    mutationFn: async ({ roleId, name, permissionIds }: { roleId: number; name: string; permissionIds: number[] }) => {
      await roleApi.update(roleId, { name });
      return roleApi.assignSelectedPermissionsToRole(roleId, permissionIds);
    },
    onSuccess: () => {
      closeEditor();
      setMessage("역할 이름을 수정했습니다.");
      refreshRoles();
    },
    onError: (error) => setMessage(error instanceof ApiError ? error.message : "역할 이름을 수정하지 못했습니다."),
  });
  const changeEnabled = useMutation({
    mutationFn: ({ roleId, enabled }: { roleId: number; enabled: boolean }) => roleApi.changeEnabled(roleId, enabled),
    onSuccess: (_, variables) => {
      setMessage(variables.enabled ? "역할을 사용 상태로 변경했습니다." : "역할을 미사용 상태로 변경했습니다.");
      refreshRoles();
    },
    onError: (error) => setMessage(error instanceof ApiError ? error.message : "역할 사용 여부를 변경하지 못했습니다."),
  });

  function openCreate() {
    setEditingRoleId(null);
    setForm(emptyForm);
    setMessage("");
    setSelectedPermissionIds([]);
    setPermissionCategoryFilter("ALL");
    setEditorOpen(true);
  }

  function beginEdit(role: Role) {
    // 역할 코드는 권한·사용자 매핑의 식별자이므로 생성 뒤에는 변경하지 않는다.
    setEditingRoleId(role.id);
    setForm({ roleCode: role.roleCode, name: role.name });
    setSelectedPermissionIds([]);
    setPermissionCategoryFilter("ALL");
    setMessage("");
    setEditorOpen(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (editingRoleId !== null) {
      updateRole.mutate({ roleId: editingRoleId, name: form.name, permissionIds: selectedPermissionIds });
      return;
    }
    createRole.mutate(form);
  }

  function togglePermissionGroup(permissionIds: number[]) {
    const allSelected = permissionIds.every((id) => selectedPermissionIds.includes(id));
    setSelectedPermissionIds((current) => allSelected
      ? current.filter((id) => !permissionIds.includes(id))
      : [...new Set([...current, ...permissionIds])],
    );
  }

  return (
    <AdminShell activeSection="roles" title="역할 관리">
      <div className="role-page">
        <header className="role-page-header">
          <div>
            <p className="role-page-eyebrow">ACCESS CONTROL</p>
            <h1>역할 관리</h1>
            <p>역할을 만들고, 사용 여부와 권한 연결을 관리합니다.</p>
          </div>
          <button type="button" className="role-create-button" onClick={openCreate}>
            <Plus aria-hidden="true" size={18} /> 새 역할
          </button>
        </header>

        <section className="role-summary" aria-label="역할 현황">
          <div><span>전체 역할</span><strong>{allRoles.length}</strong></div>
          <div><span>사용 중</span><strong className="role-summary-active">{activeCount}</strong></div>
          <div><span>미사용</span><strong>{inactiveCount}</strong></div>
        </section>

        {message && <p className="role-feedback" role="status">{message}</p>}

        <section className="role-directory" aria-labelledby="role-list-title">
          <div className="role-directory-header">
            <div>
              <h2 id="role-list-title"><KeyRound aria-hidden="true" size={19} /> 역할 목록</h2>
              <p>역할을 선택해 이름과 연결된 권한을 함께 수정할 수 있습니다.</p>
            </div>
          </div>
          <div className="role-filters">
            <SearchInput label="역할 검색" value={query} onChange={setQuery} placeholder="역할명 또는 역할 코드 검색" showEnterHint submitOnEnter />
            <label className="role-status-filter">
              <span>상태</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
                <option value="ALL">전체</option>
                <option value="ENABLED">사용 중</option>
                <option value="DISABLED">미사용</option>
              </select>
            </label>
          </div>

          {roles.isLoading && <p className="role-directory-state">역할을 불러오는 중입니다.</p>}
          {roles.isError && <p className="role-directory-state role-directory-error">역할을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>}
          {!roles.isLoading && !roles.isError && allRoles.length === 0 && (
            <div className="role-empty"><KeyRound aria-hidden="true" size={24} /><p>등록된 역할이 없습니다.</p><button type="button" onClick={openCreate}>첫 역할 만들기</button></div>
          )}
          {!roles.isLoading && !roles.isError && allRoles.length > 0 && (
            <div className="role-table-wrap">
              <table className="role-table">
                <thead><tr><th scope="col">역할</th><th scope="col">역할 코드</th><th scope="col">상태</th><th scope="col"><span className="sr-only">관리</span></th></tr></thead>
                <tbody>
                  {filteredRoles.map((role) => (
                    <tr key={role.id}>
                      <td><strong>{role.name}</strong><span>{role.enabled ? "새 사용자에게 부여할 수 있습니다." : "새 사용자에게 부여할 수 없습니다."}</span></td>
                      <td><code>{role.roleCode}</code></td>
                      <td>
                        <button
                          type="button"
                          className={`role-status-button ${role.enabled ? "is-enabled" : "is-disabled"}`}
                          onClick={() => changeEnabled.mutate({ roleId: role.id, enabled: !role.enabled })}
                          disabled={changeEnabled.isPending}
                          title={role.enabled ? "클릭하여 미사용으로 변경" : "클릭하여 사용으로 변경"}
                        >
                          <span aria-hidden="true" />{role.enabled ? "사용 중" : "미사용"}
                        </button>
                      </td>
                      <td><div className="role-table-actions"><button type="button" onClick={() => setDetailRole(role)}>상세 보기</button><button type="button" onClick={() => beginEdit(role)}><Pencil aria-hidden="true" size={15} /> 수정</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRoles.length === 0 && <p className="role-directory-state">조건에 맞는 역할이 없습니다.</p>}
            </div>
          )}
        </section>

        <SideDrawer
          ariaLabel={editingRoleId === null ? "새 역할 만들기" : "역할 이름 수정"}
          onClose={closeEditor}
          onExited={() => {
            setEditingRoleId(null);
            setForm(emptyForm);
          }}
          open={isEditorOpen}
          size="extraWide"
        >
            <section className="role-editor" aria-labelledby="role-editor-title">
              <div className="role-editor-heading"><div><p>{editingRoleId === null ? "CREATE ROLE" : "EDIT ROLE"}</p><h2 id="role-editor-title">{editingRoleId === null ? "새 역할 만들기" : "역할 이름 수정"}</h2></div><button type="button" onClick={closeEditor} aria-label="닫기">×</button></div>
              <form onSubmit={submit}>
                <div className={editingRoleId === null ? "role-editor-fields" : "role-editor-layout"}>
                  <div className="role-editor-fields">
                    <label>역할 코드<input required disabled={editingRoleId !== null} pattern="[A-Z][A-Z0-9_]{2,49}" value={form.roleCode} onChange={(event) => setForm({ ...form, roleCode: event.target.value.toUpperCase() })} placeholder="CONTENT_MANAGER" />{editingRoleId !== null && <small>역할 코드는 권한과 사용자 연결의 기준이라 수정할 수 없습니다.</small>}</label>
                    <label>역할 이름<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="콘텐츠 관리자" /></label>
                  </div>
                {editingRoleId !== null && (
                  <section className="role-editor-permissions" aria-labelledby="role-editor-permissions-title">
                    <div className="role-editor-permissions-heading">
                      <div><h3 id="role-editor-permissions-title">권한 연결</h3><p>저장하면 선택한 권한 목록으로 역할 연결이 갱신됩니다.</p></div>
                      <span>{selectedPermissionIds.length}개 선택</span>
                    </div>
                    <SearchInput label="권한 검색" value={permissionQuery} onChange={setPermissionQuery} placeholder="권한명, 코드 또는 분류 검색" showEnterHint submitOnEnter />
                    <div className="role-permission-category-toggles" role="tablist" aria-label="권한 분류">
                      <button type="button" role="tab" aria-selected={permissionCategoryFilter === "ALL"} className={permissionCategoryFilter === "ALL" ? "is-selected" : undefined} onClick={() => setPermissionCategoryFilter("ALL")}>전체 <span>{permissionItems.length}</span></button>
                      {permissionCategories.map((category) => <button type="button" role="tab" aria-selected={permissionCategoryFilter === category.id} className={permissionCategoryFilter === category.id ? "is-selected" : undefined} key={category.id} onClick={() => setPermissionCategoryFilter(category.id)}>{category.name} <span>{category.count}</span></button>)}
                    </div>
                    {permissions.isPending || rolePermissions.isPending ? <p className="role-editor-state">권한 정보를 불러오는 중입니다.</p> : permissions.isError || rolePermissions.isError ? <p className="role-editor-state is-error">권한 정보를 불러오지 못했습니다.</p> : <div className="role-editor-permission-list">{permissionGroups.map(([categoryName, groupedPermissions]) => {
                      const enabledPermissionIds = groupedPermissions.filter((permission) => permission.enabled).map((permission) => permission.id);
                      const isGroupSelected = enabledPermissionIds.length > 0 && enabledPermissionIds.every((id) => selectedPermissionIds.includes(id));
                      return <section className="role-permission-group" key={categoryName}>
                        <div className="role-permission-group-heading"><h4>{categoryName}<span>{groupedPermissions.length}</span></h4><button type="button" onClick={() => togglePermissionGroup(enabledPermissionIds)} disabled={enabledPermissionIds.length === 0 || updateRole.isPending}>{isGroupSelected ? "선택 해제" : "전체 선택"}</button></div>
                        <div className="role-permission-table-wrap"><table className="role-permission-table"><thead><tr><th><span className="sr-only">선택</span></th><th>권한</th><th>권한 코드</th><th>설명</th></tr></thead><tbody>{groupedPermissions.map((permission) => {
                          const checked = selectedPermissionIds.includes(permission.id);
                          return <tr className={checked ? "is-selected" : undefined} key={permission.id}><td><input aria-label={`${permission.name} 선택`} type="checkbox" checked={checked} disabled={!permission.enabled || updateRole.isPending} onChange={() => setSelectedPermissionIds((current) => checked ? current.filter((id) => id !== permission.id) : [...current, permission.id])} /></td><td><strong>{permission.name}</strong>{!permission.enabled && <small>미사용</small>}</td><td><code>{permission.permissionCode}</code></td><td>{permission.description}</td></tr>;
                        })}</tbody></table></div>
                      </section>;
                    })}{permissionGroups.length === 0 && <p className="role-editor-state">조건에 맞는 권한이 없습니다.</p>}</div>}
                  </section>
                )}
                </div>
                <div className="role-editor-actions role-editor-global-actions"><button type="button" className="role-cancel-button" onClick={closeEditor}>취소</button><button type="submit" disabled={createRole.isPending || updateRole.isPending}>{editingRoleId === null ? (createRole.isPending ? "등록 중…" : "역할 등록") : (updateRole.isPending ? "저장 중…" : "변경 저장")}</button></div>
              </form>
            </section>
        </SideDrawer>
        {detailRole && <RoleDetailDrawer role={detailRole} open={detailRole !== null} onClose={() => setDetailRole(null)} onExited={() => setDetailRole(null)} />}
      </div>
    </AdminShell>
  );
}
