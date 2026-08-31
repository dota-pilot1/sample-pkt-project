import type { ReactNode } from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { lotApi, type Lot, type LotStatus } from "@/entities/lot";
import { getErrorMessage, getFieldErrors } from "@/shared/api/errors";
import { FormField } from "@/shared/ui/FormField";
import { Select } from "@/shared/ui/Select";
import { TextInput } from "@/shared/ui/TextInput";

type LotDetailDrawerProps = {
  lot: Lot | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (lot: Lot) => void;
};

type LotDetailDrawerShellProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

const statusMeta: Record<LotStatus, { label: string; className: string }> = {
  WAIT: { label: "대기", className: "bg-slate-100 text-slate-700" },
  RUN: { label: "진행", className: "bg-sky-100 text-sky-700" },
  HOLD: { label: "보류", className: "bg-amber-100 text-amber-800" },
  DONE: { label: "완료", className: "bg-emerald-100 text-emerald-700" },
  FAIL: { label: "실패", className: "bg-rose-100 text-rose-700" },
};

/** 화면 전체 배경 버튼과 우측 드로워를 같은 레이어에 배치한다. */
function LotDetailDrawerShell({
  isOpen,
  onClose,
  children,
}: LotDetailDrawerShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 화면 전체를 덮어 aside 바깥 영역의 클릭만 닫기 이벤트로 받는다. */}
      <button
        type="button"
        aria-label="LOT 상세 닫기"
        className={`absolute inset-0 bg-foreground/15 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      {/* z-10으로 배경 버튼보다 위에 두어 드로워 내부 클릭을 보존한다. */}
      <aside
        className={`relative z-10 flex h-full w-full max-w-[680px] flex-col border-l border-border bg-background shadow-2xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {children}
      </aside>
    </div>
  );
}

/** LOT 하나의 상세 정보와 열림 전환을 맡는 우측 드로워다. */
export function LotDetailDrawer({ lot, isOpen, onClose, onUpdated }: LotDetailDrawerProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    productId: "",
    processId: "",
    tester: "",
    quantity: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof draft, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const registrationOptionsQuery = useQuery({
    queryKey: ["lot-registration-options"],
    queryFn: lotApi.getRegistrationOptions,
    enabled: isOpen && isEditing,
    staleTime: 5 * 60 * 1000,
  });
  const initialProductId = registrationOptionsQuery.data?.products
    .find((product) => product.productCode === lot?.productCode)
    ?.id.toString() ?? "";
  const selectedProductId = draft.productId || initialProductId;
  const processOptionsQuery = useQuery({
    queryKey: ["lot-registration-process-options", selectedProductId],
    queryFn: () => lotApi.getRegistrationProcessOptions(selectedProductId),
    enabled: isOpen && isEditing && Boolean(selectedProductId),
    // 제품이 바뀌면 Query Key가 바뀌므로 해당 제품의 공정 경로를 새로 조회한다.
    staleTime: 0,
  });
  const initialProcessId = draft.productId
    ? ""
    : processOptionsQuery.data
      ?.find((process) => process.processName === lot?.process)
      ?.processId.toString() ?? "";
  const selectedProcessId = draft.processId || initialProcessId;
  const updateMutation = useMutation({
    mutationFn: (request: { productId: number; processId: number; tester: string; quantity: number }) =>
      lotApi.update(lot!.id, request),
    onSuccess: async (updatedLot) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["lots"] }),
        queryClient.invalidateQueries({ queryKey: ["lot-filter-options"] }),
      ]);
      onUpdated(updatedLot);
      toast.success("LOT 정보를 수정했습니다.", {
        description: `${updatedLot.lotCode} · ${updatedLot.productCode} · ${updatedLot.process}`,
      });
      setIsEditing(false);
    },
    onError: (error) => {
      const message = getErrorMessage(error, "LOT를 수정하지 못했습니다.");
      setErrors(getFieldErrors(error) as Partial<Record<keyof typeof draft, string>>);
      setSubmitError(message);
      toast.error("LOT를 수정하지 못했습니다.", { description: message });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => lotApi.delete(lot!.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["lots"] }),
        queryClient.invalidateQueries({ queryKey: ["lot-filter-options"] }),
      ]);
      toast.success("LOT를 삭제했습니다.", { description: lot!.lotCode });
      setIsDeleteConfirming(false);
      onClose();
    },
    onError: (error) => {
      const message = getErrorMessage(error, "LOT를 삭제하지 못했습니다.");
      setDeleteError(message);
      toast.error("LOT를 삭제하지 못했습니다.", { description: message });
    },
  });

  if (!lot) return null;

  const canEdit = lot.status === "WAIT";
  const startEditing = () => {
    setDraft({
      productId: "",
      processId: "",
      tester: lot.tester ?? "",
      quantity: lot.quantity?.toString() ?? "",
    });
    setErrors({});
    setSubmitError(null);
    setIsEditing(true);
  };
  const cancelEditing = () => {
    if (!updateMutation.isPending) setIsEditing(false);
  };
  const close = () => {
    if (updateMutation.isPending || deleteMutation.isPending) return;
    setIsEditing(false);
    setIsDeleteConfirming(false);
    onClose();
  };
  const startDeleteConfirmation = () => {
    setDeleteError(null);
    setIsDeleteConfirming(true);
  };
  const submit = () => {
    const nextErrors: Partial<Record<keyof typeof draft, string>> = {};
    const quantity = Number(draft.quantity);
    if (!selectedProductId) nextErrors.productId = "제품을 선택하세요.";
    if (!selectedProcessId) nextErrors.processId = "공정을 선택하세요.";
    if (!draft.quantity || !Number.isInteger(quantity) || quantity < 1) {
      nextErrors.quantity = "계획 수량은 1 이상인 정수여야 합니다.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setSubmitError(null);
    updateMutation.mutate({
      productId: Number(selectedProductId),
      processId: Number(selectedProcessId),
      tester: draft.tester.trim(),
      quantity,
    });
  };

  return (
    <LotDetailDrawerShell isOpen={isOpen} onClose={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lot-detail-title"
        className="flex min-h-0 flex-1 flex-col"
      >
        <header className="flex items-start justify-between border-b border-border px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-primary">
              LOT DETAIL
            </p>
            <h2
              id="lot-detail-title"
              className="mt-2 text-2xl font-bold tracking-tight"
            >
              {lot.lotCode}
            </h2>
            <span
              className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta[lot.status].className}`}
            >
              {statusMeta[lot.status].label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && !isEditing && !isDeleteConfirming && (
              <>
                <button
                  type="button"
                  onClick={startEditing}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Pencil className="h-4 w-4" />
                  수정
                </button>
                <button
                  type="button"
                  onClick={startDeleteConfirmation}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-rose-200 px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 className="h-4 w-4" />
                  삭제
                </button>
              </>
            )}
            <button
              type="button"
              aria-label="LOT 상세 닫기"
              onClick={close}
              className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <section>
            <h3 className="text-sm font-semibold">기본 정보</h3>
            <dl className="mt-3 divide-y divide-border rounded-xl border border-border">
              <div className="flex items-center justify-between gap-6 px-4 py-3.5">
                <dt className="text-sm text-muted-foreground">제품 코드</dt>
                <dd className="font-semibold">{lot.productCode}</dd>
              </div>
              <div className="flex items-center justify-between gap-6 px-4 py-3.5">
                <dt className="text-sm text-muted-foreground">현재 공정</dt>
                <dd className="font-semibold">{lot.process}</dd>
              </div>
              <div className="flex items-center justify-between gap-6 px-4 py-3.5">
                <dt className="text-sm text-muted-foreground">Tester</dt>
                <dd className="font-semibold">{lot.tester ?? "미배정"}</dd>
              </div>
            </dl>
          </section>
          <section className="mt-8">
            <h3 className="text-sm font-semibold">생산 현황</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">계획 수량</p>
                <p className="mt-2 text-xl font-bold">
                  {lot.quantity == null ? "-" : `${lot.quantity.toLocaleString()} EA`}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">수율</p>
                <p className="mt-2 text-xl font-bold">
                  {lot.yieldRate == null ? "-" : `${lot.yieldRate.toFixed(1)}%`}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">정상 수량</p>
                <p className="mt-2 text-xl font-bold">
                  {lot.goodQuantity == null ? "-" : lot.goodQuantity.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">불량 수량</p>
                <p className="mt-2 text-xl font-bold">
                  {lot.defectQuantity == null ? "-" : lot.defectQuantity.toLocaleString()}
                </p>
              </div>
            </div>
          </section>
          {isDeleteConfirming && (
            <section
              role="alertdialog"
              aria-labelledby="lot-delete-title"
              aria-describedby="lot-delete-description"
              className="mt-8 rounded-xl border border-border bg-muted/30 p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700">
                  <Trash2 className="h-4 w-4" />
                </span>
                <div>
                  <h3 id="lot-delete-title" className="text-sm font-semibold">LOT 삭제</h3>
                  <p id="lot-delete-description" className="mt-1 text-sm leading-5 text-muted-foreground">
                    {lot.lotCode}을(를) 삭제할까요? 생산 이력이 없는 대기 LOT만 삭제할 수 있으며, 삭제 후 복구할 수 없습니다.
                  </p>
                </div>
              </div>
              {deleteError && <p role="alert" className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{deleteError}</p>}
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirming(false)}
                  disabled={deleteMutation.isPending}
                  className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-accent disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-rose-300 bg-rose-100 px-3 text-sm font-semibold text-rose-800 hover:bg-rose-200 disabled:opacity-50"
                >
                  {deleteMutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  삭제하기
                </button>
              </div>
            </section>
          )}
          {isEditing && (
            <section className="mt-8 rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Pencil className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">LOT 수정</h3>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    대기 상태에서는 제품, 현재 공정, Tester, 계획 수량을 수정할 수 있습니다. LOT 번호는 등록 뒤 변경하지 않습니다.
                  </p>
                </div>
              </div>
              {registrationOptionsQuery.isError || processOptionsQuery.isError ? (
                <p role="alert" className="mt-5 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  제품 또는 공정 선택지를 불러오지 못했습니다. 잠시 후 다시 시도하세요.
                </p>
              ) : null}
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FormField label="제품" htmlFor="lot-edit-product" error={errors.productId}>
                  <div className="[&>span]:w-full">
                    <Select
                      id="lot-edit-product"
                      value={selectedProductId}
                      disabled={updateMutation.isPending || registrationOptionsQuery.isLoading || registrationOptionsQuery.isError}
                      onChange={(event) => {
                        setDraft((current) => ({
                          ...current,
                          productId: event.target.value,
                          // 제품이 바뀌면 이전 제품의 공정 ID를 제출하지 않도록 비운다.
                          processId: "",
                        }));
                        setErrors((current) => ({ ...current, productId: undefined, processId: undefined }));
                      }}
                      options={[
                        {
                          value: "",
                          label: registrationOptionsQuery.isLoading ? "제품을 불러오는 중" : "제품 선택",
                        },
                        ...(registrationOptionsQuery.data?.products ?? []).map((product) => ({
                          value: product.id,
                          label: `${product.productCode} · ${product.productName}`,
                        })),
                      ]}
                    />
                  </div>
                </FormField>
                <FormField label="현재 공정" htmlFor="lot-edit-process" error={errors.processId}>
                  <div className="[&>span]:w-full">
                    <Select
                      id="lot-edit-process"
                      value={selectedProcessId}
                      disabled={updateMutation.isPending || !selectedProductId || processOptionsQuery.isLoading || processOptionsQuery.isError}
                      onChange={(event) => {
                        setDraft((current) => ({ ...current, processId: event.target.value }));
                        setErrors((current) => ({ ...current, processId: undefined }));
                      }}
                      options={[
                        {
                          value: "",
                          label: !selectedProductId
                            ? "제품을 먼저 선택하세요"
                            : processOptionsQuery.isLoading
                              ? "공정 경로를 불러오는 중"
                              : (processOptionsQuery.data?.length ?? 0) === 0
                                ? "등록 가능한 공정 경로가 없습니다"
                                : "공정 선택",
                        },
                        ...(processOptionsQuery.data ?? []).map((process) => ({
                          value: process.processId,
                          label: `${process.sequenceNo}. ${process.processName}`,
                        })),
                      ]}
                    />
                  </div>
                </FormField>
                <FormField label="Tester" htmlFor="lot-edit-tester" error={errors.tester} hint="비워 두면 미배정으로 저장됩니다.">
                  <TextInput
                    id="lot-edit-tester"
                    value={draft.tester}
                    disabled={updateMutation.isPending}
                    onChange={(event) => {
                      setDraft((current) => ({ ...current, tester: event.target.value }));
                      setErrors((current) => ({ ...current, tester: undefined }));
                    }}
                    placeholder="TESTER-01"
                  />
                </FormField>
                <FormField label="계획 수량" htmlFor="lot-edit-quantity" error={errors.quantity} hint="1 이상의 정수만 허용합니다.">
                  <TextInput
                    id="lot-edit-quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={draft.quantity}
                    disabled={updateMutation.isPending}
                    onChange={(event) => {
                      setDraft((current) => ({ ...current, quantity: event.target.value }));
                      setErrors((current) => ({ ...current, quantity: undefined }));
                    }}
                  />
                </FormField>
              </div>
              {submitError && <p role="alert" className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{submitError}</p>}
              <div className="mt-5 flex flex-wrap items-center justify-end gap-2 rounded-lg border border-border bg-background px-3 py-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={updateMutation.isPending}
                    className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={updateMutation.isPending || registrationOptionsQuery.isLoading || registrationOptionsQuery.isError || processOptionsQuery.isLoading || processOptionsQuery.isError}
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {updateMutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    저장하기
                  </button>
                </div>
              </div>
            </section>
          )}
          <div className="mt-8 rounded-xl bg-muted/60 p-4 text-sm leading-6 text-muted-foreground">
            공정 이력과 품질 기록은 상세 API가 준비되면 이 드로워 안에서 이어서 표시합니다.
          </div>
        </div>
      </div>
    </LotDetailDrawerShell>
  );
}
