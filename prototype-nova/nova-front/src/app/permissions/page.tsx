"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Pencil, Plus, ShieldCheck, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import {
  permissionApi,
  type CreatePermissionRequest,
  type Permission,
} from "@/features/permission/api";
import { AdminShell } from "@/features/admin/ui/admin-shell";
import { ApiError } from "@/shared/api/client";
import { SideDrawer } from "@/shared/ui/side-drawer";
import { permissionCategoryApi, type CreatePermissionCategoryRequest } from "@/features/permission/category-api";
import { SearchInput } from "@/shared/ui/search-input";

const emptyForm: CreatePermissionRequest = {
  permissionCode: "",
  name: "",
  description: "",
  categoryId: 0,
};

type StatusFilter = "ALL" | "ENABLED" | "DISABLED";

/** 권한은 역할에 연결하기 전에 이 카탈로그에서 정의하고 관리한다. */
export default function PermissionsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingPermissionId, setEditingPermissionId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCategoryEditorOpen, setIsCategoryEditorOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CreatePermissionCategoryRequest>({ categoryCode: "", name: "", description: "", sortOrder: 100 });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<number | "ALL">("ALL");
  const [message, setMessage] = useState("");
  const permissions = useQuery({ queryKey: ["permissions"], queryFn: permissionApi.findAll });
  const categories = useQuery({ queryKey: ["permission-categories"], queryFn: permissionCategoryApi.findAll });

  const allPermissions = useMemo(() => permissions.data ?? [], [permissions.data]);
  const filteredPermissions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allPermissions.filter((permission) => {
      const matchesStatus = statusFilter === "ALL"
        || (statusFilter === "ENABLED" ? permission.enabled : !permission.enabled);
      const matchesCategory = categoryFilter === "ALL" || permission.category?.id === categoryFilter;
      const matchesQuery = !normalizedQuery || [
        permission.name,
        permission.permissionCode,
        permission.description,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesCategory && matchesQuery;
    });
  }, [allPermissions, categoryFilter, query, statusFilter]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["permissions"] });
  const closeEditor = () => setIsEditorOpen(false);
  const resetEditor = () => {
    setEditingPermissionId(null);
    setForm(emptyForm);
  };
  const refreshCategories = () => queryClient.invalidateQueries({ queryKey: ["permission-categories"] });

  const createPermission = useMutation({
    mutationFn: permissionApi.create,
    onSuccess: () => {
      setMessage("권한을 등록했습니다.");
      closeEditor();
      refresh();
    },
    onError: (error) => setMessage(error instanceof ApiError ? error.message : "권한을 등록하지 못했습니다."),
  });
  const updatePermission = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Pick<Permission, "name" | "description"> & { categoryId: number } }) =>
      permissionApi.update(id, body),
    onSuccess: () => {
      setMessage("권한 정보를 수정했습니다.");
      closeEditor();
      refresh();
    },
    onError: (error) => setMessage(error instanceof ApiError ? error.message : "권한 정보를 수정하지 못했습니다."),
  });
  const createCategory = useMutation({
    mutationFn: permissionCategoryApi.create,
    onSuccess: (category) => {
      setMessage("권한 분류를 등록했습니다.");
      setCategoryForm({ categoryCode: "", name: "", description: "", sortOrder: 100 });
      setIsCategoryEditorOpen(false);
      refreshCategories();
      setForm((current) => ({ ...current, categoryId: current.categoryId || category.id }));
    },
    onError: (error) => setMessage(error instanceof ApiError ? error.message : "권한 분류를 등록하지 못했습니다."),
  });
  const changeEnabled = useMutation({
    mutationFn: ({ id, enabled }: Pick<Permission, "id" | "enabled">) => permissionApi.changeEnabled(id, enabled),
    onSuccess: () => {
      setMessage("권한 사용 여부를 변경했습니다.");
      refresh();
    },
    onError: (error) => setMessage(error instanceof ApiError ? error.message : "권한 사용 여부를 변경하지 못했습니다."),
  });

  function openCreate() {
    resetEditor();
    const firstCategory = categories.data?.find((category) => category.enabled);
    if (!firstCategory) { setMessage("권한을 등록하려면 먼저 권한 분류를 등록해야 합니다."); return; }
    setForm((current) => ({ ...current, categoryId: firstCategory.id }));
    setMessage("");
    setIsEditorOpen(true);
  }

  function openEdit(permission: Permission) {
    setEditingPermissionId(permission.id);
    setForm({
      permissionCode: permission.permissionCode,
      name: permission.name,
      description: permission.description,
      categoryId: permission.category?.id ?? 0,
    });
    setMessage("");
    setIsEditorOpen(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (editingPermissionId === null) {
      createPermission.mutate(form);
      return;
    }
    updatePermission.mutate({
      id: editingPermissionId,
      body: { name: form.name, description: form.description, categoryId: form.categoryId },
    });
  }

  const isSaving = createPermission.isPending || updatePermission.isPending;
  return (
    <AdminShell activeSection="permissions" title="권한 관리">
      <section className="permission-catalog-page" aria-labelledby="permission-page-title">
        <header className="permission-catalog-header">
          <div>
            <p>ACCESS CONTROL</p>
            <h1 id="permission-page-title">권한 관리</h1>
            <span>역할에서 선택할 수 있는 시스템 동작을 관리합니다.</span>
          </div>
          <div className="permission-header-actions"><button type="button" className="secondary-action" onClick={() => setIsCategoryEditorOpen(true)}><Plus size={16} /> 새 분류</button><button type="button" className="primary-action" onClick={openCreate}><Plus size={17} /> 새 권한</button></div>
        </header>

        <section className="permission-catalog" aria-labelledby="permission-catalog-title">
          <div className="permission-catalog-heading">
            <div><ShieldCheck size={21} /><div><h2 id="permission-catalog-title">권한 분류</h2><p>분류를 선택해 권한을 빠르게 찾고, 역할 관리에서 연결합니다.</p></div></div>
            {message && <p className="permission-message" role="status">{message}</p>}
          </div>
          <div className="permission-category-toggles" role="tablist" aria-label="권한 분류">
            <button type="button" role="tab" aria-selected={categoryFilter === "ALL"} className={categoryFilter === "ALL" ? "is-selected" : undefined} onClick={() => setCategoryFilter("ALL")}>전체 <span>{allPermissions.length}</span></button>
            {categories.data?.map((category) => {
              const count = allPermissions.filter((permission) => permission.category?.id === category.id).length;
              return <button type="button" role="tab" aria-selected={categoryFilter === category.id} className={categoryFilter === category.id ? "is-selected" : undefined} key={category.id} onClick={() => setCategoryFilter(category.id)}>{category.name} <span>{count}</span></button>;
            })}
          </div>
          <div className="permission-filters">
            <SearchInput label="권한 검색" value={query} onChange={setQuery} placeholder="권한명, 권한 코드 또는 설명 검색" showEnterHint submitOnEnter />
            <label className="permission-status-filter">상태<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}><option value="ALL">전체</option><option value="ENABLED">사용 중</option><option value="DISABLED">미사용</option></select></label>
          </div>

          {permissions.isLoading && <p className="permission-catalog-state">권한 목록을 불러오는 중입니다.</p>}
          {permissions.isError && <p className="permission-catalog-state is-error">권한 목록을 불러오지 못했습니다.</p>}
          {!permissions.isLoading && !permissions.isError && (
            <div className="permission-table-wrap">
              <table className="permission-table">
                <thead><tr><th>분류</th><th>권한</th><th>권한 코드</th><th>설명</th><th>상태</th><th><span className="sr-only">작업</span></th></tr></thead>
                <tbody>
                  {filteredPermissions.map((permission) => (
                    <tr key={permission.id}>
                      <td><span className="permission-category-badge">{permission.category?.name ?? "미분류"}</span></td>
                      <td><strong>{permission.name}</strong></td>
                      <td><code>{permission.permissionCode}</code></td>
                      <td>{permission.description}</td>
                      <td><button type="button" className={`permission-status ${permission.enabled ? "is-enabled" : "is-disabled"}`} onClick={() => changeEnabled.mutate({ id: permission.id, enabled: !permission.enabled })} disabled={changeEnabled.isPending}>{permission.enabled ? "사용 중" : "미사용"}</button></td>
                      <td><button type="button" className="permission-edit-button" onClick={() => openEdit(permission)}><Pencil size={15} /> 수정</button></td>
                    </tr>
                  ))}
                  {filteredPermissions.length === 0 && <tr><td className="permission-empty" colSpan={6}>조건에 맞는 권한이 없습니다.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      <SideDrawer open={isEditorOpen} onClose={closeEditor} onExited={resetEditor} ariaLabel={editingPermissionId === null ? "새 권한" : "권한 정보 수정"}>
        <form className="permission-editor" onSubmit={submit}>
          <header className="permission-editor-header"><div><p>{editingPermissionId === null ? "CREATE PERMISSION" : "EDIT PERMISSION"}</p><h2>{editingPermissionId === null ? "새 권한" : "권한 정보 수정"}</h2></div><button type="button" aria-label="닫기" onClick={closeEditor}><X size={20} /></button></header>
          <div className="permission-editor-content">
            <p className="permission-editor-intro"><KeyRound size={17} /> 권한은 역할에 연결할 수 있는 최소 단위의 시스템 동작입니다.</p>
            <label>권한 코드<input required disabled={editingPermissionId !== null} pattern="[A-Z][A-Z0-9_]{2,99}" value={form.permissionCode} onChange={(event) => setForm({ ...form, permissionCode: event.target.value.toUpperCase() })} placeholder="RATE_PLAN_READ" />{editingPermissionId !== null && <small>권한 코드는 역할 연결의 기준이라 수정할 수 없습니다.</small>}</label>
            <label>권한 분류<select required value={form.categoryId || ""} onChange={(event) => setForm({ ...form, categoryId: Number(event.target.value) })}><option value="" disabled>분류를 선택하세요</option>{categories.data?.filter((category) => category.enabled || category.id === form.categoryId).map((category) => <option key={category.id} value={category.id}>{category.name} ({category.categoryCode})</option>)}</select><small>역할에서 권한을 이 분류 단위로 묶어 탐색합니다.</small></label>
            <label>권한 이름<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="요금제 조회" /></label>
            <label>설명<textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="권한의 사용 목적을 작성하세요." /></label>
          </div>
          <footer className="permission-editor-actions"><button type="button" className="secondary-action" onClick={closeEditor}>취소</button><button type="submit" className="primary-action" disabled={isSaving}>{isSaving ? "저장 중…" : editingPermissionId === null ? "권한 등록" : "변경 저장"}</button></footer>
        </form>
      </SideDrawer>
      <SideDrawer open={isCategoryEditorOpen} onClose={() => setIsCategoryEditorOpen(false)} ariaLabel="새 권한 분류">
        <form className="permission-editor" onSubmit={(event) => { event.preventDefault(); createCategory.mutate(categoryForm); }}>
          <header className="permission-editor-header"><div><p>CREATE CATEGORY</p><h2>새 권한 분류</h2></div><button type="button" aria-label="닫기" onClick={() => setIsCategoryEditorOpen(false)}><X size={20} /></button></header>
          <div className="permission-editor-content"><p className="permission-editor-intro"><ShieldCheck size={17} /> 업무 영역 단위로 권한을 묶습니다. 예: 요금제 관리, 사용자 관리</p><label>분류 코드<input required pattern="[A-Z][A-Z0-9_]{1,49}" value={categoryForm.categoryCode} onChange={(event) => setCategoryForm({ ...categoryForm, categoryCode: event.target.value.toUpperCase() })} placeholder="RATE_PLAN" /></label><label>분류 이름<input required value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} placeholder="요금제 관리" /></label><label>설명<textarea required value={categoryForm.description} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} placeholder="이 분류가 다루는 업무 영역을 작성하세요." /></label><label>정렬 순서<input required type="number" value={categoryForm.sortOrder} onChange={(event) => setCategoryForm({ ...categoryForm, sortOrder: Number(event.target.value) })} /></label></div>
          <footer className="permission-editor-actions"><button type="button" className="secondary-action" onClick={() => setIsCategoryEditorOpen(false)}>취소</button><button type="submit" className="primary-action" disabled={createCategory.isPending}>{createCategory.isPending ? "등록 중…" : "분류 등록"}</button></footer>
        </form>
      </SideDrawer>
    </AdminShell>
  );
}
