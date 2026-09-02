"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, Pencil, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { productApi, type CreateProductInput, type Product, type ProductClassification, type ProductInput } from "@/entities/product";
import { getErrorMessage } from "@/shared/api/errors";

const createInitial: CreateProductInput = { productCode: "", productName: "", packageType: "", classification: "SEMI_FINISHED", active: true };
const packageTypes = ["FBGA", "BGA", "WLCSP", "QFN", "LGA"];
const classificationLabels: Record<ProductClassification, string> = { MATERIAL: "자재", SEMI_FINISHED: "반제품", FINISHED_GOOD: "완제품" };

export function ProductManagement() {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [formTarget, setFormTarget] = useState<Product | "new" | null>(null);
  const { data: products = [], isLoading, isError } = useQuery({ queryKey: ["products"], queryFn: productApi.getProducts });

  const filteredProducts = useMemo(() => products.filter((product) => {
    const query = keyword.trim().toLowerCase();
    const matchesKeyword = !query || product.productCode.toLowerCase().includes(query) || product.productName.toLowerCase().includes(query);
    const matchesActive = activeFilter === "ALL" || (activeFilter === "ACTIVE" ? product.active : !product.active);
    return matchesKeyword && matchesActive;
  }), [activeFilter, keyword, products]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["products"] });
  const createMutation = useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: async () => { await refresh(); setFormTarget(null); toast.success("제품을 등록했습니다."); },
    onError: (error) => toast.error(getErrorMessage(error, "제품을 등록하지 못했습니다.")),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: ProductInput }) => productApi.updateProduct(id, request),
    onSuccess: async () => { await refresh(); setFormTarget(null); toast.success("제품 정보를 저장했습니다."); },
    onError: (error) => toast.error(getErrorMessage(error, "제품 정보를 저장하지 못했습니다.")),
  });

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-muted/20 px-4 py-8 sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold tracking-[0.18em] text-primary">P&amp;T MASTER · PRODUCT</p><h1 className="mt-3 text-3xl font-bold tracking-tight">제품 관리</h1><p className="mt-2 text-sm text-muted-foreground">LOT와 테스트 스펙에서 공통으로 사용하는 P&amp;T 제품 기준정보입니다.</p></div>
          <button type="button" onClick={() => setFormTarget("new")} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground"><Plus className="h-4 w-4" />제품 등록</button>
        </header>

        <section className="mt-6 rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row"><label className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary" placeholder="제품 코드 또는 제품명 검색" /></label><select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value as typeof activeFilter)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm"><option value="ALL">전체 상태</option><option value="ACTIVE">활성</option><option value="INACTIVE">비활성</option></select></div></section>

        <section className="mt-5 overflow-hidden rounded-xl border border-border bg-card shadow-sm"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 className="font-bold">P&amp;T 제품 목록</h2><p className="mt-1 text-xs text-muted-foreground">총 {products.length}개 · 표시 {filteredProducts.length}개</p></div></div>{isLoading ? <p className="p-8 text-sm text-muted-foreground">제품 정보를 불러오는 중입니다.</p> : isError ? <p className="p-8 text-sm text-destructive">제품 정보를 불러오지 못했습니다.</p> : filteredProducts.length === 0 ? <EmptyProducts onCreate={() => setFormTarget("new")} /> : <div className="overflow-x-auto"><table className="w-full min-w-[48rem] text-sm"><thead><tr className="border-b border-border bg-muted/20 text-left text-xs text-muted-foreground"><Th>제품 코드</Th><Th>제품명</Th><Th>분류</Th><Th>패키지</Th><Th>상태</Th><Th>수정 시각</Th><Th /></tr></thead><tbody>{filteredProducts.map((product) => <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/20"><Td className="font-mono font-bold">{product.productCode}</Td><Td className="font-semibold">{product.productName}</Td><Td><ClassificationBadge classification={product.classification} /></Td><Td>{product.packageType ?? "-"}</Td><Td><StatusBadge active={product.active} /></Td><Td className="text-muted-foreground">{formatDate(product.updatedAt)}</Td><Td><button type="button" onClick={() => setFormTarget(product)} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-bold hover:bg-accent"><Pencil className="h-3.5 w-3.5" />수정</button></Td></tr>)}</tbody></table></div>}</section>
      </section>
      <ProductFormDialog target={formTarget} pending={createMutation.isPending || updateMutation.isPending} onClose={() => setFormTarget(null)} onCreate={(request) => createMutation.mutate(request)} onUpdate={(id, request) => updateMutation.mutate({ id, request })} />
    </main>
  );
}

function ProductFormDialog({ target, pending, onClose, onCreate, onUpdate }: { target: Product | "new" | null; pending: boolean; onClose: () => void; onCreate: (request: CreateProductInput) => void; onUpdate: (id: number, request: ProductInput) => void }) {
  const isNew = target === "new";
  const [form, setForm] = useState<CreateProductInput>(createInitial);
  const visible = target !== null;

  useEffect(() => {
    if (target === "new") {
      setForm(createInitial);
      return;
    }
    if (target) {
      setForm({ productCode: target.productCode, productName: target.productName, packageType: target.packageType ?? "", classification: target.classification, active: target.active });
    }
  }, [target]);

  if (!visible || !target) return null;
  const setField = <K extends keyof CreateProductInput>(key: K, value: CreateProductInput[K]) => setForm((previous) => ({ ...previous, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (isNew) {
      if (!form.productCode.trim() || !form.productName.trim()) return;
      onCreate({ ...form, productCode: form.productCode.trim().toUpperCase(), productName: form.productName.trim(), packageType: form.packageType.trim() });
      return;
    }
    onUpdate(target.id, { productName: form.productName.trim(), packageType: form.packageType.trim(), classification: form.classification, active: form.active });
  };

  return <div className="fixed inset-0 z-[60] grid place-items-center p-4"><button type="button" aria-label="제품 편집 닫기" onClick={onClose} className="absolute inset-0 bg-foreground/30" /><form onSubmit={submit} className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl"><header className="flex items-start justify-between border-b border-border px-5 py-4"><div><p className="text-xs font-bold tracking-[0.16em] text-primary">P&amp;T PRODUCT</p><h2 className="mt-1 text-xl font-bold">{isNew ? "제품 등록" : "제품 수정"}</h2></div><button type="button" onClick={onClose} disabled={pending} className="rounded-md p-2 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button></header><div className="space-y-4 p-5"><Field label="제품 코드"><input disabled={!isNew} value={form.productCode} onChange={(event) => setField("productCode", event.target.value)} className="field disabled:cursor-not-allowed disabled:bg-muted" placeholder="PKT-A" /></Field><Field label="제품명"><input value={form.productName} onChange={(event) => setField("productName", event.target.value)} className="field" placeholder="DDR Memory Package" /></Field><Field label="제품 분류"><select value={form.classification} onChange={(event) => setField("classification", event.target.value as ProductClassification)} className="field">{(Object.keys(classificationLabels) as ProductClassification[]).map((classification) => <option key={classification} value={classification}>{classificationLabels[classification]}</option>)}</select></Field><Field label="패키지 타입"><select value={form.packageType} onChange={(event) => setField("packageType", event.target.value)} className="field"><option value="">선택 안 함</option>{packageTypes.map((packageType) => <option key={packageType} value={packageType}>{packageType}</option>)}</select></Field>{!isNew && <label className="flex items-center justify-between rounded-lg border border-border px-3 py-3 text-sm"><span><strong>제품 사용 여부</strong><span className="mt-1 block text-xs text-muted-foreground">비활성 제품은 신규 LOT와 스펙에 선택할 수 없습니다.</span></span><input type="checkbox" checked={form.active} onChange={(event) => setField("active", event.target.checked)} className="h-4 w-4 accent-primary" /></label>}</div><footer className="flex justify-end gap-2 border-t border-border px-5 py-4"><button type="button" onClick={onClose} disabled={pending} className="h-10 rounded-lg border border-border px-4 text-sm font-bold">취소</button><button disabled={pending} className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground">{pending ? "저장 중…" : "저장"}</button></footer></form></div>;
}

function EmptyProducts({ onCreate }: { onCreate: () => void }) { return <div className="grid min-h-72 place-items-center p-8 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground"><Boxes className="h-6 w-6" /></span><p className="mt-4 font-bold">등록된 제품이 없습니다.</p><button type="button" onClick={onCreate} className="mt-4 text-sm font-bold text-primary">첫 제품 등록하기</button></div></div>; }
function StatusBadge({ active }: { active: boolean }) { return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${active ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{active ? "활성" : "비활성"}</span>; }
function ClassificationBadge({ classification }: { classification: ProductClassification }) { const styles: Record<ProductClassification, string> = { MATERIAL: "bg-slate-100 text-slate-700", SEMI_FINISHED: "bg-sky-50 text-sky-700", FINISHED_GOOD: "bg-emerald-50 text-emerald-700" }; return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[classification]}`}>{classificationLabels[classification]}</span>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-bold">{label}<span className="mt-1 block [&_.field]:h-10 [&_.field]:w-full [&_.field]:rounded-lg [&_.field]:border [&_.field]:border-input [&_.field]:bg-background [&_.field]:px-3 [&_.field]:text-sm [&_.field]:font-normal [&_.field]:outline-none [&_.field:focus]:border-primary">{children}</span></label>; }
function Th({ children }: { children?: React.ReactNode }) { return <th className="px-5 py-3 font-bold">{children}</th>; }
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <td className={`px-5 py-3 ${className}`}>{children}</td>; }
function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "-"; }
