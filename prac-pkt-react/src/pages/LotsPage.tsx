import { useState } from "react";
import { LotTable } from "../features/lot/ui/LotTable";
import { useLots } from "../features/lot/model/useLots";
import type { Lot } from "../features/lot/model/lot.types";

export default function LotsPage() {
  const { data: rows = [], isLoading, isError } = useLots();
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);

  if (isLoading) return <p className="text-sm font-semibold text-slate-500">LOT 목록을 불러오는 중입니다.</p>;
  if (isError) return <p role="alert" className="text-sm font-semibold text-red-600">LOT 목록을 불러오지 못했습니다.</p>;

  return <div className="space-y-5">
    <header>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">PRACTICE 01</p>
      <h1 className="mt-2 text-2xl font-black">LOT 목록 테이블</h1>
      <p className="mt-1 text-sm font-semibold text-slate-500">행을 선택하면 선택 상태와 LOT 상세 정보가 표시됩니다.</p>
    </header>

    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <LotTable rows={rows} selectedLotId={selectedLot?.id} onSelect={setSelectedLot} />
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-live="polite">
        {selectedLot ? <>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-600">SELECTED LOT</p><h2 className="mt-2 text-xl font-black">{selectedLot.id}</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3"><dt className="font-semibold text-slate-500">제품</dt><dd className="font-black">{selectedLot.product}</dd></div>
            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3"><dt className="font-semibold text-slate-500">상태</dt><dd className="font-black text-sky-700">{selectedLot.status}</dd></div>
            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3"><dt className="font-semibold text-slate-500">공정</dt><dd className="font-black">{selectedLot.process}</dd></div>
            <div className="flex justify-between gap-4"><dt className="font-semibold text-slate-500">수정일</dt><dd className="font-black">{selectedLot.updatedAt}</dd></div>
          </dl>
          <button type="button" onClick={() => setSelectedLot(null)} className="mt-6 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">선택 해제</button>
        </> : <><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">LOT DETAIL</p><h2 className="mt-2 text-xl font-black">LOT를 선택하세요</h2><p className="mt-2 text-sm leading-6 text-slate-500">행을 클릭하거나 키보드로 선택하면 상세 정보가 여기에 표시됩니다.</p></>}
      </aside>
    </div>
  </div>;
}
