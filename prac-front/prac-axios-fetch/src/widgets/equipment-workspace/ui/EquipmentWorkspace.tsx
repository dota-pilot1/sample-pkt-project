"use client";

import type { SessionUser } from "@/entities/session/model/session";
import { useLogoutMutation } from "@/entities/session/model/useSessionQuery";
import {
  useDeleteEquipmentMutation,
  useEquipmentQuery,
} from "@/entities/equipment/model/useEquipmentQuery";
import { useEquipmentUiStore } from "@/features/equipment-editor/model/equipment-ui-store";
import EquipmentForm from "@/features/equipment-editor/ui/EquipmentForm";
import StatusBadge from "@/shared/ui/status-badge/StatusBadge";

export default function EquipmentWorkspace({ user }: { user: SessionUser }) {
  const ui = useEquipmentUiStore();
  const equipmentQuery = useEquipmentQuery(true, ui.simulateReadError);
  const deleteMutation = useDeleteEquipmentMutation();
  const logoutMutation = useLogoutMutation();
  const equipment = equipmentQuery.data?.equipment ?? [];
  const editingEquipment =
    ui.editorMode === "edit"
      ? equipment.find((item) => item.id === ui.editingId) ?? null
      : null;
  const deleteCandidate = equipment.find((item) => item.id === ui.deleteCandidateId) ?? null;

  function handleLogout() {
    logoutMutation.mutate(undefined, { onSuccess: ui.reset });
  }

  function handleDelete() {
    if (!deleteCandidate) return;
    deleteMutation.mutate(deleteCandidate.id, { onSuccess: ui.cancelDelete });
  }

  return (
    <>
      <section className="session-strip">
        <div>
          <span className="session-dot" />
          <strong>{user.displayName}</strong>
          <small>@{user.username} · SQLite session</small>
        </div>
        <button type="button" className="ghost-button" onClick={handleLogout} disabled={logoutMutation.isPending}>
          {logoutMutation.isPending ? "로그아웃 중…" : "로그아웃"}
        </button>
      </section>

      <section className="workspace-grid">
        <article className="data-panel">
          <div className="panel-heading list-panel-heading">
            <div>
              <p className="lesson-label">AUTHENTICATED CRUD</p>
              <h2>설비 목록 <span className="count-chip">{equipment.length}</span></h2>
            </div>
            <div className="panel-actions">
              <button
                type="button"
                className="error-test-button"
                onClick={() => ui.setSimulateReadError(!ui.simulateReadError)}
              >
                {ui.simulateReadError ? "정상 조회 복원" : "500 오류 재현"}
              </button>
              <button type="button" onClick={ui.openCreate}>+ 설비 등록</button>
            </div>
          </div>

          {equipmentQuery.isPending ? (
            <div className="panel-state" role="status"><span className="spinner" />SQLite 설비를 조회하는 중…</div>
          ) : equipmentQuery.isError ? (
            <div className="panel-state error-state" role="alert">
              <strong>조회에 실패했습니다.</strong>
              <p>{equipmentQuery.error.message}</p>
              <button type="button" onClick={() => ui.setSimulateReadError(false)}>정상 조회로 복구</button>
            </div>
          ) : (
            <div className="equipment-table-wrap">
              <div className="equipment-table-head">
                <span>설비</span><span>상태</span><span>온도</span><span>버전</span><span>관리</span>
              </div>
              <ul className="crud-equipment-list">
                {equipment.map((item) => (
                  <li key={item.id}>
                    <div className="equipment-main"><strong>{item.name}</strong><small>{item.line} · #{item.id}</small></div>
                    <StatusBadge tone={item.status}>{item.status}</StatusBadge>
                    <span className="table-value">{item.temperature}℃</span>
                    <span className="version-chip">v{item.version}</span>
                    <div className="row-actions">
                      <button type="button" className="row-edit-button" onClick={() => ui.openEdit(item.id)}>수정</button>
                      <button type="button" className="row-delete-button" onClick={() => ui.askDelete(item.id)}>삭제</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <aside className="side-stack">
          {ui.editorMode ? (
            <EquipmentForm equipment={editingEquipment} onClose={ui.closeEditor} />
          ) : (
            <section className="editor-panel empty-editor">
              <p className="lesson-label">ZUSTAND UI STATE</p>
              <h2>편집 대기</h2>
              <p>등록 또는 수정 버튼을 누르면 Zustand가 패널 모드와 대상 ID를 관리합니다.</p>
            </section>
          )}

          <section className="query-observer">
            <p className="lesson-label">QUERY OBSERVATION</p>
            <div className="query-values">
              <span><b>session</b>authenticated</span>
              <span><b>query</b>{equipmentQuery.status}</span>
              <span><b>fetchStatus</b>{equipmentQuery.fetchStatus}</span>
              <span><b>source</b>Drizzle + SQLite</span>
            </div>
          </section>
        </aside>
      </section>

      {deleteCandidate ? (
        <section className="delete-confirm" role="alertdialog" aria-modal="true" aria-label="설비 삭제 확인">
          <div>
            <p className="lesson-label">DELETE CONFIRMATION</p>
            <h2>{deleteCandidate.name} 삭제</h2>
            <p>SQLite에서 실제 행을 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
            {deleteMutation.isError ? <p className="form-notice error">{deleteMutation.error.message}</p> : null}
            <div className="form-actions">
              <button type="button" className="ghost-button" onClick={ui.cancelDelete}>취소</button>
              <button type="button" className="danger-button" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "삭제 중…" : "삭제 확정"}
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
