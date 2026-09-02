"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FileSliders, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { packageTestApi, type TestConditionType } from "@/entities/package-test";
import { lotApi } from "@/entities/lot";
import { getErrorMessage } from "@/shared/api/errors";

const specInitial = { productId: "", specName: "", version: "1", testStage: "FINAL_TEST" };
const conditionInitial = { testNumber: "", testName: "", conditionType: "RANGE" as TestConditionType, lowerLimit: "", upperLimit: "", unit: "", failBinCode: "" };

export function TestSpecManagement() {
  const queryClient = useQueryClient();
  const [selectedSpecId, setSelectedSpecId] = useState<number | null>(null);
  const [showSpecForm, setShowSpecForm] = useState(false);
  const [specForm, setSpecForm] = useState(specInitial);
  const [conditionForm, setConditionForm] = useState(conditionInitial);

  const specsQuery = useQuery({ queryKey: ["package-test-specs"], queryFn: packageTestApi.getSpecs });
  const productsQuery = useQuery({ queryKey: ["lot-registration-options"], queryFn: lotApi.getRegistrationOptions, staleTime: 5 * 60 * 1000 });
  const selectedSpec = useMemo(() => specsQuery.data?.find((spec) => spec.id === selectedSpecId) ?? null, [selectedSpecId, specsQuery.data]);

  useEffect(() => {
    if (selectedSpecId == null && specsQuery.data?.length) setSelectedSpecId(specsQuery.data[0].id);
  }, [selectedSpecId, specsQuery.data]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["package-test-specs"] });
  const createSpec = useMutation({
    mutationFn: packageTestApi.createSpec,
    onSuccess: async (created) => {
      await refresh();
      setSelectedSpecId(created.id);
      setSpecForm(specInitial);
      setShowSpecForm(false);
      toast.success("테스트 스펙을 등록했습니다.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "테스트 스펙을 등록하지 못했습니다.")),
  });
  const addCondition = useMutation({
    mutationFn: ({ specId, request }: { specId: number; request: Parameters<typeof packageTestApi.addCondition>[1] }) => packageTestApi.addCondition(specId, request),
    onSuccess: async () => {
      await refresh();
      setConditionForm(conditionInitial);
      toast.success("검사 조건을 추가했습니다.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "검사 조건을 추가하지 못했습니다.")),
  });
  const deleteCondition = useMutation({
    mutationFn: packageTestApi.deleteCondition,
    onSuccess: async () => {
      await refresh();
      toast.success("검사 조건을 삭제했습니다.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "검사 조건을 삭제하지 못했습니다.")),
  });

  const submitSpec = (event: FormEvent) => {
    event.preventDefault();
    if (!specForm.productId || !specForm.specName.trim()) return;
    createSpec.mutate({ productId: Number(specForm.productId), specName: specForm.specName.trim(), version: Number(specForm.version), testStage: specForm.testStage });
  };

  const submitCondition = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedSpec || !conditionForm.testNumber || !conditionForm.testName.trim()) return;
    if (conditionForm.conditionType === "RANGE" && (conditionForm.lowerLimit === "" || conditionForm.upperLimit === "")) return;
    addCondition.mutate({
      specId: selectedSpec.id,
      request: {
        testNumber: Number(conditionForm.testNumber),
        testName: conditionForm.testName.trim(),
        conditionType: conditionForm.conditionType,
        ...(conditionForm.conditionType === "RANGE" ? { lowerLimit: Number(conditionForm.lowerLimit), upperLimit: Number(conditionForm.upperLimit), unit: conditionForm.unit.trim() || undefined } : {}),
        failBinCode: conditionForm.failBinCode.trim() || undefined,
      },
    });
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-muted/20 px-4 py-8 sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold tracking-[0.18em] text-primary">P&amp;T MASTER · TEST SPEC</p><h1 className="mt-3 text-3xl font-bold tracking-tight">테스트 스펙 관리</h1><p className="mt-2 text-sm text-muted-foreground">제품별 테스트 기준과 PASS/FAIL 판정 조건을 관리합니다.</p></div>
          <button type="button" onClick={() => setShowSpecForm((open) => !open)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground"><Plus className="h-4 w-4" />스펙 등록</button>
        </header>

        {showSpecForm && <form onSubmit={submitSpec} className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-5 shadow-sm md:grid-cols-[1.2fr_1.5fr_0.6fr_1fr_auto] md:items-end">
          <Field label="제품"><select value={specForm.productId} onChange={(event) => setSpecForm({ ...specForm, productId: event.target.value })} className="field"><option value="">제품 선택</option>{productsQuery.data?.products.map((product) => <option key={product.id} value={product.id}>{product.productCode} · {product.productName}</option>)}</select></Field>
          <Field label="스펙명"><input value={specForm.specName} onChange={(event) => setSpecForm({ ...specForm, specName: event.target.value })} className="field" placeholder="Final Test 기본 스펙" /></Field>
          <Field label="버전"><input type="number" min="1" value={specForm.version} onChange={(event) => setSpecForm({ ...specForm, version: event.target.value })} className="field" /></Field>
          <Field label="테스트 공정"><select value={specForm.testStage} onChange={(event) => setSpecForm({ ...specForm, testStage: event.target.value })} className="field"><option value="FINAL_TEST">Final Test</option><option value="CORE_TEST">Core Test</option><option value="SPEED_BIN_TEST">Speed Bin Test</option><option value="BURN_IN">Burn-in</option></select></Field>
          <button disabled={createSpec.isPending} className="h-10 rounded-lg bg-foreground px-4 text-sm font-bold text-background disabled:opacity-50">저장</button>
        </form>}

        <div className="mt-6 grid gap-5 lg:grid-cols-[21rem_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"><div className="border-b border-border px-5 py-4"><h2 className="font-bold">등록 스펙</h2><p className="mt-1 text-xs text-muted-foreground">{specsQuery.data?.length ?? 0}개 스펙</p></div><div className="divide-y divide-border">{specsQuery.isLoading ? <p className="p-5 text-sm text-muted-foreground">불러오는 중…</p> : specsQuery.data?.length ? specsQuery.data.map((spec) => <button key={spec.id} type="button" onClick={() => setSelectedSpecId(spec.id)} className={`w-full px-5 py-4 text-left transition hover:bg-muted/40 ${selectedSpecId === spec.id ? "bg-primary/5" : ""}`}><div className="flex items-center justify-between gap-3"><span className="font-bold">{spec.productCode}</span><span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold">{spec.status}</span></div><p className="mt-1 text-sm">{spec.specName} · v{spec.version}</p><p className="mt-1 text-xs text-muted-foreground">{spec.testStage} · 조건 {spec.conditions.length}개</p></button>) : <p className="p-5 text-sm text-muted-foreground">등록된 테스트 스펙이 없습니다.</p>}</div></aside>

          <section className="min-w-0 rounded-xl border border-border bg-card shadow-sm">{selectedSpec ? <><div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold text-primary">{selectedSpec.productCode} · {selectedSpec.testStage}</p><h2 className="mt-1 text-lg font-bold">{selectedSpec.specName} v{selectedSpec.version}</h2></div><span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />{selectedSpec.conditions.length}개 검사 조건</span></div>
            <div className="overflow-x-auto p-5"><table className="w-full min-w-[44rem] text-sm"><thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><Th>번호</Th><Th>검사항목</Th><Th>유형</Th><Th>판정 기준</Th><Th>Fail Bin</Th><Th /></tr></thead><tbody>{selectedSpec.conditions.map((condition) => <tr key={condition.id} className="border-b border-border last:border-0"><Td>{condition.testNumber}</Td><Td className="font-semibold">{condition.testName}</Td><Td>{condition.conditionType === "RANGE" ? "범위" : "PASS/FAIL"}</Td><Td>{condition.conditionType === "RANGE" ? `${condition.lowerLimit} ~ ${condition.upperLimit} ${condition.unit ?? ""}` : "정상 통과"}</Td><Td>{condition.failBinCode ?? "-"}</Td><Td><button type="button" aria-label={`${condition.testName} 삭제`} onClick={() => deleteCondition.mutate(condition.id)} className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></Td></tr>)}</tbody></table>{selectedSpec.conditions.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">아래 폼에서 첫 검사 조건을 추가하세요.</p>}</div>
            <form onSubmit={submitCondition} className="border-t border-border bg-muted/20 p-5"><h3 className="text-sm font-bold">검사 조건 추가</h3><div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Field label="검사번호"><input type="number" min="1" value={conditionForm.testNumber} onChange={(event) => setConditionForm({ ...conditionForm, testNumber: event.target.value })} className="field" placeholder="1001" /></Field><Field label="검사항목"><input value={conditionForm.testName} onChange={(event) => setConditionForm({ ...conditionForm, testName: event.target.value })} className="field" placeholder="Leakage Current" /></Field><Field label="검사 유형"><select value={conditionForm.conditionType} onChange={(event) => setConditionForm({ ...conditionForm, conditionType: event.target.value as TestConditionType })} className="field"><option value="RANGE">범위 검사</option><option value="PASS_FAIL">PASS / FAIL</option></select></Field><Field label="Fail Bin"><input value={conditionForm.failBinCode} onChange={(event) => setConditionForm({ ...conditionForm, failBinCode: event.target.value })} className="field" placeholder="BIN-03" /></Field></div>{conditionForm.conditionType === "RANGE" && <div className="mt-3 grid gap-3 md:grid-cols-3"><Field label="하한"><input type="number" step="any" value={conditionForm.lowerLimit} onChange={(event) => setConditionForm({ ...conditionForm, lowerLimit: event.target.value })} className="field" /></Field><Field label="상한"><input type="number" step="any" value={conditionForm.upperLimit} onChange={(event) => setConditionForm({ ...conditionForm, upperLimit: event.target.value })} className="field" /></Field><Field label="단위"><input value={conditionForm.unit} onChange={(event) => setConditionForm({ ...conditionForm, unit: event.target.value })} className="field" placeholder="V, mA, MHz" /></Field></div>}<div className="mt-4 flex justify-end"><button disabled={addCondition.isPending} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50"><Plus className="h-4 w-4" />조건 추가</button></div></form>
          </> : <div className="grid min-h-96 place-items-center p-8 text-center"><div><FileSliders className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-3 font-bold">테스트 스펙을 선택하세요.</p><p className="mt-1 text-sm text-muted-foreground">제품별 검사 조건을 확인하고 편집할 수 있습니다.</p></div></div>}</section>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-bold text-muted-foreground">{label}<span className="mt-1 block [&_.field]:h-10 [&_.field]:w-full [&_.field]:rounded-lg [&_.field]:border [&_.field]:border-input [&_.field]:bg-background [&_.field]:px-3 [&_.field]:text-sm [&_.field]:font-normal [&_.field]:text-foreground [&_.field]:outline-none [&_.field:focus]:border-primary">{children}</span></label>; }
function Th({ children }: { children?: React.ReactNode }) { return <th className="px-3 py-2.5 font-semibold">{children}</th>; }
function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) { return <td className={`px-3 py-3 ${className}`}>{children}</td>; }
