import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Camera, CheckCircle2, ChevronRight, ClipboardCheck, Loader2, Plus, Search, X } from "lucide-react";
import { useQualityInspections, useSaveInspectionResult } from "../features/quality-inspection/model/useQualityInspections";
import type { InspectionResult, InspectionStatus, QualityInspection, SaveInspectionParams } from "../features/quality-inspection/model/quality-inspection.types";

const statusStyle: Record<InspectionStatus, string> = {
  WAITING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

type InspectionFormValue = Omit<SaveInspectionParams, "id">;

function InspectionDrawer({ inspection, onClose, onSave, pending, serverError }: {
  inspection: QualityInspection;
  onClose: () => void;
  onSave: (value: InspectionFormValue) => Promise<void>;
  pending: boolean;
  serverError?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [dimension, setDimension] = useState(inspection.dimension ?? 50);
  const [appearanceIssue, setAppearanceIssue] = useState(inspection.appearanceIssue ?? false);
  const [result, setResult] = useState<InspectionResult>(inspection.result ?? "PASS");
  const [defectReason, setDefectReason] = useState(inspection.defectReason ?? "");
  const [savedPhotoUrls, setSavedPhotoUrls] = useState(inspection.photoUrls);
  const [newPhotos, setNewPhotos] = useState<Array<{ file: File; previewUrl: string }>>([]);
  const previewUrls = useRef(new Set<string>());
  const [validationError, setValidationError] = useState("");
  const dimensionValid = dimension >= 49.5 && dimension <= 50.5;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => () => previewUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const close = () => {
    if (pending) return;
    setVisible(false);
    window.setTimeout(onClose, 220);
  };

  /** 합격·불합격 규칙을 먼저 검사한 뒤 사진과 결과를 함께 저장한다. */
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setValidationError("");
    if (result === "PASS" && (!dimensionValid || appearanceIssue)) {
      setValidationError("치수 이탈 또는 외관 이상이 있으면 불합격으로 판정해야 합니다.");
      return;
    }
    if (result === "FAIL" && !defectReason.trim()) {
      setValidationError("불합격 사유를 입력해 주세요.");
      return;
    }
    try {
      await onSave({ dimension, appearanceIssue, result, defectReason: defectReason.trim() || null, photoUrls: savedPhotoUrls, photos: newPhotos.map((photo) => photo.file) });
      close();
    } catch {
      // 서버 오류는 Drawer 하단의 mutation 오류 메시지로 표시한다.
    }
  };

  /** 기존 사진을 포함해 최대 3장까지만 새 파일과 브라우저 미리보기 URL을 추가한다. */
  const addPhotos = (files: FileList | null) => {
    const remaining = 3 - savedPhotoUrls.length - newPhotos.length;
    if (!files || remaining <= 0) return;
    const additions = Array.from(files).slice(0, remaining).map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.add(previewUrl);
      return { file, previewUrl };
    });
    setNewPhotos((current) => [...current, ...additions]);
  };

  /** 선택 취소한 파일의 Object URL을 해제해 브라우저 메모리 누수를 막는다. */
  const removeNewPhoto = (previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    previewUrls.current.delete(previewUrl);
    setNewPhotos((current) => current.filter((photo) => photo.previewUrl !== previewUrl));
  };

  return <>
    <button type="button" aria-label="검사 입력 닫기" onClick={close} className={`fixed inset-0 z-40 bg-slate-950/40 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`} />
    <aside className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl transition-transform duration-300 ${visible ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-8">
        <div><p className="text-[11px] font-black tracking-[0.18em] text-sky-600">QUALITY INSPECTION</p><h2 className="mt-2 text-2xl font-black">검사 결과 입력</h2><p className="mt-1 text-sm font-semibold text-slate-500">{inspection.lotCode} · {inspection.itemName}</p></div>
        <button type="button" onClick={close} aria-label="닫기" className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="size-5" /></button>
      </div>

      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6 sm:px-8">
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-sm"><div><p className="text-xs font-bold text-slate-400">작업지시</p><p className="mt-1 font-black">{inspection.workOrderCode}</p></div><div><p className="text-xs font-bold text-slate-400">생산 수량</p><p className="mt-1 font-black">{inspection.quantity.toLocaleString()}개</p></div></div>

          <section><div className="flex items-center justify-between"><label htmlFor="dimension" className="text-sm font-black">제품 치수</label><span className="text-xs font-bold text-slate-400">허용 범위 49.5–50.5 mm</span></div><div className="relative mt-2"><input id="dimension" required type="number" min="0.01" step="0.01" value={dimension} onChange={(event) => setDimension(Number(event.target.value))} className={`w-full rounded-xl border px-4 py-3 pr-14 text-sm font-bold outline-none ${dimensionValid ? "border-slate-200 focus:border-sky-500" : "border-red-400 bg-red-50"}`} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">mm</span></div><p className={`mt-2 text-xs font-bold ${dimensionValid ? "text-emerald-600" : "text-red-600"}`}>{dimensionValid ? "허용 범위 이내입니다." : "치수가 허용 범위를 벗어났습니다."}</p></section>

          <section><p className="text-sm font-black">외관 검사</p><label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4"><div><p className="text-sm font-bold">긁힘·오염 등 외관 이상</p><p className="mt-1 text-xs font-semibold text-slate-400">이상이 발견되면 활성화하세요.</p></div><input type="checkbox" checked={appearanceIssue} onChange={(event) => setAppearanceIssue(event.target.checked)} className="size-5 accent-sky-600" /></label></section>

          <section><p className="text-sm font-black">최종 판정</p><div className="mt-3 grid grid-cols-2 gap-3"><button type="button" onClick={() => setResult("PASS")} className={`rounded-xl border px-4 py-3 text-sm font-black transition ${result === "PASS" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"}`}>합격</button><button type="button" onClick={() => setResult("FAIL")} className={`rounded-xl border px-4 py-3 text-sm font-black transition ${result === "FAIL" ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200 text-slate-500"}`}>불합격</button></div></section>

          {(appearanceIssue || result === "FAIL") && <section><label htmlFor="reason" className="text-sm font-black">불량 사유</label><textarea id="reason" rows={3} value={defectReason} onChange={(event) => setDefectReason(event.target.value)} placeholder="발견된 이상 내용을 입력하세요." className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-500" /></section>}

          <section><div className="flex items-center justify-between"><p className="text-sm font-black">검사 사진</p><span className="text-xs font-bold text-slate-400">최대 3장</span></div><div className="mt-3 grid grid-cols-3 gap-3">{savedPhotoUrls.map((url) => <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"><img src={url} alt="등록된 검사 사진" className="size-full object-cover" /><button type="button" onClick={() => setSavedPhotoUrls((current) => current.filter((photoUrl) => photoUrl !== url))} className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-slate-950/65 text-white opacity-0 transition group-hover:opacity-100" aria-label="등록된 사진 삭제"><X className="size-4" /></button></div>)}{newPhotos.map((photo) => <div key={photo.previewUrl} className="group relative aspect-square overflow-hidden rounded-xl border border-sky-200 bg-sky-50"><img src={photo.previewUrl} alt={photo.file.name} className="size-full object-cover" /><button type="button" onClick={() => removeNewPhoto(photo.previewUrl)} className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-slate-950/65 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100" aria-label={`${photo.file.name} 삭제`}><X className="size-4" /></button><p className="absolute inset-x-0 bottom-0 truncate bg-slate-950/60 px-2 py-1 text-[10px] font-bold text-white">{photo.file.name}</p></div>)}{savedPhotoUrls.length + newPhotos.length < 3 && <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-2 text-center transition hover:border-sky-400 hover:bg-sky-50"><input type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => { addPhotos(event.target.files); event.currentTarget.value = ""; }} /><span className="grid size-8 place-items-center rounded-full bg-white text-sky-600 shadow-sm"><Plus className="size-4" /></span><p className="mt-2 text-xs font-black text-slate-600">사진 추가</p><p className="mt-1 text-[10px] font-semibold text-slate-400">PNG, JPG, WEBP</p></label>}</div>{savedPhotoUrls.length + newPhotos.length === 0 && <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-400"><Camera className="size-3.5" />불량 부위와 전체 모습을 함께 등록할 수 있습니다.</p>}</section>
        </div>

        <div className="border-t border-slate-100 bg-white px-6 py-5 sm:px-8">
          {(validationError || serverError) && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{validationError || serverError}</p>}
          <div className="flex gap-3"><button type="button" disabled={pending} onClick={close} className="min-h-12 flex-1 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50">취소</button><button type="submit" disabled={pending} className="min-h-12 flex-[2] rounded-xl bg-sky-600 text-sm font-black text-white shadow-sm hover:bg-sky-700 disabled:cursor-wait disabled:opacity-60">{pending ? "저장 중…" : inspection.status === "COMPLETED" ? "검사 결과 수정" : "검사 결과 저장"}</button></div>
        </div>
      </form>
    </aside>
  </>;
}

export default function QualityInspectionsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"ALL" | InspectionStatus>("WAITING");
  const [keyword, setKeyword] = useState("");
  const query = useQualityInspections();
  const saveMutation = useSaveInspectionResult();
  const inspections = query.data ?? [];
  const selected = inspections.find((inspection) => inspection.id === selectedId) ?? null;
  const waitingCount = inspections.filter((inspection) => inspection.status === "WAITING").length;
  const filteredInspections = useMemo(() => inspections.filter((inspection) => (filter === "ALL" || inspection.status === filter) && `${inspection.lotCode} ${inspection.itemName} ${inspection.workOrderCode}`.toLowerCase().includes(keyword.toLowerCase())), [filter, keyword, inspections]);

  const openInspection = (id: number) => { saveMutation.reset(); setSelectedId(id); };
  const saveInspection = async (value: InspectionFormValue) => {
    if (selectedId == null) return;
    await saveMutation.mutateAsync({ id: selectedId, ...value });
  };

  return <div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">PRACTICE 03</p><h1 className="mt-2 text-2xl font-black">품질 검사 관리</h1><p className="mt-1 text-sm font-semibold text-slate-500">품질 검사를 실시하고 결과를 기록합니다.</p></div><div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"><ClipboardCheck className="size-5 text-amber-600" /><div><p className="text-[11px] font-black text-amber-600">검사 대기</p><p className="text-lg font-black text-amber-800">{query.isPending ? "-" : `${waitingCount}건`}</p></div></div></header>

    {query.isPending ? <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-sm font-bold text-slate-500"><Loader2 className="mr-2 size-4 animate-spin" />품질 검사 목록을 불러오는 중입니다…</div> : query.isError ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">{query.error.message}</div> : <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="font-black">검사 대상 LOT</h2><p className="mt-1 text-xs font-semibold text-slate-400">행을 선택하면 검사 결과 입력 화면이 열립니다.</p></div><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="LOT 또는 품목 검색" className="w-56 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-sky-500" /></div></div>
      <div className="flex gap-2 border-b border-slate-100 px-5 py-3">{([["WAITING", "검사 대기"], ["COMPLETED", "검사 완료"], ["ALL", "전체"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-lg px-3 py-1.5 text-xs font-black ${filter === value ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{label}</button>)}</div>
      <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-slate-50 text-xs font-black text-slate-500"><tr><th className="px-5 py-3">LOT 번호</th><th className="px-5 py-3">작업지시</th><th className="px-5 py-3">품목</th><th className="px-5 py-3">수량</th><th className="px-5 py-3">생산 완료</th><th className="px-5 py-3">상태 / 판정</th><th className="w-12 px-5 py-3" /></tr></thead><tbody>{filteredInspections.map((inspection) => <tr key={inspection.id} onClick={() => openInspection(inspection.id)} className="cursor-pointer border-t border-slate-100 transition hover:bg-sky-50"><td className="px-5 py-4 font-black">{inspection.lotCode}</td><td className="px-5 py-4 font-bold text-slate-500">{inspection.workOrderCode}</td><td className="px-5 py-4 font-bold text-slate-700">{inspection.itemName}</td><td className="px-5 py-4 font-bold text-slate-700">{inspection.quantity.toLocaleString()}개</td><td className="px-5 py-4 font-semibold text-slate-500">{dateTimeFormatter.format(new Date(inspection.producedAt))}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${inspection.status === "COMPLETED" && inspection.result === "FAIL" ? "bg-red-100 text-red-700" : statusStyle[inspection.status]}`}>{inspection.status === "WAITING" ? "검사 대기" : inspection.result === "PASS" ? "합격" : "불합격"}</span></td><td className="px-5 py-4"><ChevronRight className="size-4 text-slate-300" /></td></tr>)}</tbody></table></div>
      {filteredInspections.length === 0 && <div className="p-10 text-center"><CheckCircle2 className="mx-auto size-8 text-emerald-500" /><p className="mt-3 text-sm font-black">조건에 맞는 LOT가 없습니다.</p></div>}
    </section>}

    {selected && <InspectionDrawer key={selected.id} inspection={selected} onClose={() => setSelectedId(null)} onSave={saveInspection} pending={saveMutation.isPending} serverError={saveMutation.isError ? saveMutation.error.message : undefined} />}
  </div>;
}
