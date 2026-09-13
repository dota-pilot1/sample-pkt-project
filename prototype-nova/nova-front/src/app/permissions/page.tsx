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
import { ApiError } from "@/shared/api/client";

const emptyForm: CreatePermissionRequest = {
  permissionCode: "",
  name: "",
  description: "",
};

export default function PermissionsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const permissions = useQuery({ queryKey: ["permissions"], queryFn: permissionApi.findAll });
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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    createPermission.mutate(form);
  }

  return (
    <main className="page-body permission-page">
      <Link className="back-link" href="/"><ArrowLeft size={16} /> 상품·요금제 관리로 돌아가기</Link>
      <div className="page-heading">
        <h1>권한 관리</h1>
        <p>권한을 등록하고 사용 여부를 관리합니다. 역할 연결과 접근 제어는 다음 단계에서 진행합니다.</p>
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
    </main>
  );
}
