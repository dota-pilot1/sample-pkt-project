import { useEffect, useState } from "react";
import { useWorkOrders, useUpdateWorkOrderStatus } from "../features/work-order/model/useWorkOrders";
import type { WorkOrder, WorkOrderStatus } from "../features/work-order/model/work-order.types";
import "./WorkOrdersPage.css";

type Status = WorkOrderStatus;
const labels: Record<WorkOrderStatus, string> = { READY: "대기", IN_PROGRESS: "진행 중", COMPLETED: "완료", HOLD: "보류" };
const colors: Record<WorkOrderStatus, string> = { READY: "bg-slate-100 text-slate-600", IN_PROGRESS: "bg-sky-100 text-sky-700", COMPLETED: "bg-emerald-100 text-emerald-700", HOLD: "bg-amber-100 text-amber-700" };
const actions: { status: WorkOrderStatus; label: string }[] = [
  { status: "IN_PROGRESS", label: "작업 시작" },
  { status: "HOLD", label: "보류 처리" },
  { status: "COMPLETED", label: "완료 처리" },
  { status: "READY", label: "대기로 변경" },
];

function WorkOrderDrawer({ order, onClose, onStatusChange, pending, error, success }: { order: WorkOrder; onClose: () => void; onStatusChange: (status: Status) => void; pending: boolean; error?: string; success: boolean }) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const closeDrawer = () => {
    setVisible(false);
    window.setTimeout(onClose, 220);
  };
  const chooseStatus = (status: Status) => { onStatusChange(status); setStatusDialogOpen(false); };
  return <>
    <div className="work-order-drawer-overlay" data-open={visible} onClick={closeDrawer} aria-hidden="true" />
    <aside className="work-order-drawer" data-open={visible}>
      <button type="button" onClick={closeDrawer} aria-label="상세 닫기" className="work-order-drawer__handle"><span /></button>
      <div className="work-order-drawer__header"><div><p className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-600">WORK ORDER DETAIL</p><div className="mt-2 flex items-center gap-2"><h2 className="text-2xl font-black tracking-tight text-slate-950">{order.code}</h2><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${colors[order.status]}`}>{labels[order.status]}</span></div><p className="mt-1 text-sm font-semibold text-slate-500">{order.itemName} · {order.workstation}</p></div><button type="button" onClick={closeDrawer} aria-label="상세 닫기" className="work-order-drawer__close">×</button></div>
      <div className="work-order-drawer__body"><div className="work-order-drawer__grid"><div className="work-order-drawer__card"><p>품목</p><strong>{order.itemName}</strong></div><div className="work-order-drawer__card"><p>수량</p><strong>{order.quantity.toLocaleString()}개</strong></div><div className="work-order-drawer__card"><p>작업장</p><strong>{order.workstation}</strong></div><div className="work-order-drawer__card"><p>담당자</p><strong>{order.assignee}</strong></div></div><div className="work-order-drawer__schedule"><p>SCHEDULE</p><div><span>납기일</span><strong>{order.dueDate}</strong></div></div></div>
      <div className="work-order-drawer__footer"><p>작업 상태</p><button type="button" disabled={pending} onClick={() => setStatusDialogOpen(true)}>{pending ? "저장 중…" : "상태 변경"}</button>{error && <p className="work-order-drawer__error">{error}</p>}{success && <p className="work-order-drawer__success">작업 상태가 저장되었습니다.</p>}</div>
    </aside>
    {statusDialogOpen && <div className="work-order-status-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setStatusDialogOpen(false); }}><div role="dialog" aria-modal="true" aria-labelledby="status-dialog-title" className="work-order-status-dialog"><p className="work-order-status-dialog__eyebrow">WORK ORDER ACTION</p><h2 id="status-dialog-title">{order.code} 상태 변경</h2><div className="work-order-status-dialog__current"><span>현재 상태</span><strong data-status={order.status}>{labels[order.status]}</strong></div><p className="work-order-status-dialog__description">변경할 작업 상태를 선택하세요.</p><div className="work-order-status-dialog__actions">{actions.map((action) => { const current = order.status === action.status; return <button key={action.status} type="button" data-status={action.status} data-current={current} disabled={current} onClick={() => chooseStatus(action.status)}>{action.label}{current && <span className="work-order-status-dialog__check" aria-hidden="true">✓</span>}</button>; })}</div><button type="button" onClick={() => setStatusDialogOpen(false)} className="work-order-status-dialog__cancel">취소</button></div></div>}
  </>;
}

export default function WorkOrdersPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const query = useWorkOrders();
  const updateMutation = useUpdateWorkOrderStatus();
  const rows = query.data ?? [];
  const selected = rows.find((row) => row.id === selectedId) ?? null;
  const changeStatus = (status: Status) => { if (selected && selected.status !== status) updateMutation.mutate({ order: selected, status }); };

  return <div className="space-y-5"><header><p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">PRACTICE 02</p><h1 className="mt-2 text-2xl font-black">작업 관리</h1><p className="mt-1 text-sm font-semibold text-slate-500">작업지시를 조회하고 작업 상태를 직접 업데이트합니다.</p></header>{query.isPending ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">작업지시를 불러오는 중입니다…</div> : query.isError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">{query.error.message}</div> : <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-black">작업지시 목록</h2><p className="mt-1 text-xs font-semibold text-slate-400">전체 {rows.length}건 · 행을 선택하면 상세 드로워가 열립니다.</p></div><span className="rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-black text-sky-700">실습 02</span></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs font-black text-slate-500"><tr><th className="px-5 py-3">작업지시</th><th className="px-5 py-3">품목</th><th className="px-5 py-3">수량</th><th className="px-5 py-3">작업장</th><th className="px-5 py-3">납기</th><th className="px-5 py-3">상태</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} onClick={() => setSelectedId(row.id)} className={`cursor-pointer border-t border-slate-100 transition hover:bg-sky-50 ${selected?.id === row.id ? "bg-sky-50" : ""}`}><td className="px-5 py-4 font-black">{row.code}</td><td className="px-5 py-4 font-bold text-slate-700">{row.itemName}</td><td className="px-5 py-4 font-bold text-slate-700">{row.quantity.toLocaleString()}</td><td className="px-5 py-4 font-semibold text-slate-500">{row.workstation}</td><td className="px-5 py-4 font-semibold text-slate-500">{row.dueDate}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${colors[row.status]}`}>{labels[row.status]}</span></td></tr>)}</tbody></table></div>{rows.length === 0 && <p className="p-8 text-center text-sm font-bold text-slate-500">등록된 작업지시가 없습니다.</p>}</section>}{selected && <WorkOrderDrawer order={selected} onClose={() => setSelectedId(null)} onStatusChange={changeStatus} pending={updateMutation.isPending} error={updateMutation.isError ? updateMutation.error.message : undefined} success={updateMutation.isSuccess} />}</div>;
}
