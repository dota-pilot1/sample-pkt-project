"use client";

import { useEffect, useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, X } from "lucide-react";
import { toast } from "sonner";
import { lotApi } from "@/entities/lot";
import { workOrderApi } from "@/entities/work-order";
import { getErrorMessage, getFieldErrors } from "@/shared/api/errors";
import { FormField } from "@/shared/ui/FormField";
import { Select } from "@/shared/ui/Select";
import { TextInput } from "@/shared/ui/TextInput";

type LotCreateDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  initialWorkOrderId?: number | null;
};

type LotCreateForm = {
  workOrderId: string;
  productId: string;
  /** 빈 입력 상태를 보존해 수량을 직접 지우고 다시 입력할 수 있다. */
  quantity: string;
};

const initialForm: LotCreateForm = {
  workOrderId: "",
  productId: "",
  quantity: "1",
};

type ClientErrors = Partial<Record<keyof LotCreateForm, string>>;

function validate(form: LotCreateForm, remainingQuantity?: number): ClientErrors {
  const errors: ClientErrors = {};
  if (!form.productId) errors.productId = "제품을 선택하세요.";
  if (!form.workOrderId) errors.workOrderId = "작업지시를 선택하세요.";
  const quantity = Number(form.quantity);
  if (!form.quantity || !Number.isInteger(quantity) || quantity < 1) {
    errors.quantity = "계획 수량은 1 이상인 정수여야 합니다.";
  } else if (remainingQuantity != null && quantity > remainingQuantity) {
    errors.quantity = `잔여 수량(${remainingQuantity.toLocaleString()} EA)을 초과할 수 없습니다.`;
  }
  return errors;
}

/** LOT 등록 후 목록·필터 캐시를 함께 갱신하는 모달 폼이다. */
export function LotCreateDialog({ isOpen, onClose, initialWorkOrderId = null }: LotCreateDialogProps) {
  const titleId = useId();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<LotCreateForm>(initialForm);
  const [errors, setErrors] = useState<ClientErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** 등록 결과를 목록·필터 캐시와 공통 토스트까지 한 흐름으로 동기화한다. */
  const createMutation = useMutation({
    mutationFn: lotApi.create,
    onSuccess: async (createdLot) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["lots"] }),
        queryClient.invalidateQueries({ queryKey: ["lot-filter-options"] }),
        queryClient.invalidateQueries({ queryKey: ["work-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["work-order-lot-allocation"] }),
      ]);
      setForm(initialForm);
      setErrors({});
      // 저장 완료를 모달이 닫힌 뒤에도 확인할 수 있게 우하단에 남긴다.
      toast.success("LOT를 등록했습니다.", {
        description: `${createdLot.lotCode} · 대기 상태`,
      });
      onClose();
    },
    onError: (error) => {
      const fieldErrors = getFieldErrors(error);
      const message = getErrorMessage(error, "LOT를 등록하지 못했습니다.");
      setErrors(fieldErrors as ClientErrors);
      setSubmitError(message);
      // 필드 밖의 서버 오류도 즉시 알아차릴 수 있게 공통 오류 토스트를 함께 표시한다.
      toast.error("LOT를 등록하지 못했습니다.", { description: message });
    },
  });

  const registrationOptionsQuery = useQuery({
    queryKey: ["lot-registration-options"],
    queryFn: lotApi.getRegistrationOptions,
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const workOrdersQuery = useQuery({
    queryKey: ["work-orders"],
    queryFn: workOrderApi.getAll,
    enabled: isOpen,
  });
  const eligibleWorkOrders = (workOrdersQuery.data ?? []).filter((order) =>
    (order.status === "READY" || order.status === "IN_PROGRESS") &&
    order.remainingLotQuantity > 0 &&
    (registrationOptionsQuery.data?.products ?? []).some((product) => product.productCode === order.itemCode),
  );
  const selectedWorkOrder = workOrdersQuery.data?.find((order) => String(order.id) === form.workOrderId);
  const allocationQuery = useQuery({
    queryKey: ["work-order-lot-allocation", form.workOrderId],
    queryFn: () => workOrderApi.getLotAllocation(Number(form.workOrderId)),
    enabled: isOpen && Boolean(form.workOrderId),
  });
  const remainingQuantity = allocationQuery.data?.remainingLotQuantity ?? selectedWorkOrder?.remainingLotQuantity;

  /** 작업지시 상세에서 연 등록은 해당 작업지시와 제품을 미리 고정해 분할 흐름을 잇는다. */
  useEffect(() => {
    if (!isOpen || !initialWorkOrderId || form.workOrderId || !workOrdersQuery.data || !registrationOptionsQuery.data) return;
    const selected = workOrdersQuery.data.find((order) => order.id === initialWorkOrderId);
    const matching = registrationOptionsQuery.data.products.find((product) => product.productCode === selected?.itemCode);
    if (!selected || !matching) return;
    setForm((current) => ({ ...current, workOrderId: String(selected.id), productId: String(matching.id) }));
  }, [form.workOrderId, initialWorkOrderId, isOpen, registrationOptionsQuery.data, workOrdersQuery.data]);


  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !createMutation.isPending) onClose();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [createMutation.isPending, isOpen, onClose]);

  if (!isOpen) return null;

  const update = <K extends keyof LotCreateForm>(key: K, value: LotCreateForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
  };

  const close = () => {
    if (!createMutation.isPending) onClose();
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(form, remainingQuantity);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    createMutation.mutate({
      workOrderId: Number(form.workOrderId),
      productId: Number(form.productId),
      quantity: Number(form.quantity),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <button
        type="button"
        aria-label="LOT 등록 닫기"
        className="absolute inset-0 bg-foreground/20"
        onClick={close}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-2xl rounded-xl border border-border bg-background shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-border px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-primary">LOT CREATE</p>
            <h2 id={titleId} className="mt-1 text-xl font-bold">LOT 등록</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              LOT 번호는 저장 시 자동 발번되며, 새 LOT는 대기 상태로 등록됩니다.
            </p>
          </div>
          <button
            type="button"
            aria-label="LOT 등록 닫기"
            onClick={close}
            disabled={createMutation.isPending}
            className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <form onSubmit={submit} className="p-5 sm:p-6">
          {registrationOptionsQuery.isError && (
            <p role="alert" className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              제품·공정 마스터를 불러오지 못했습니다. 잠시 후 다시 시도하세요.
            </p>
          )}
          <div className="space-y-4">
            <FormField label="작업지시" htmlFor="lot-work-order" error={errors.workOrderId}>
              <div className="[&>span]:w-full">
                <Select
                  id="lot-work-order"
                  value={form.workOrderId}
                  onChange={(event) => {
                    const selected = workOrdersQuery.data?.find((order) => String(order.id) === event.target.value);
                    update("workOrderId", event.target.value);
                    const matching = registrationOptionsQuery.data?.products.find((product) => product.productCode === selected?.itemCode);
                    update("productId", matching ? String(matching.id) : "");
                  }}
                  disabled={workOrdersQuery.isLoading || workOrdersQuery.isError || registrationOptionsQuery.isLoading}
                  options={[
                    { value: "", label: workOrdersQuery.isLoading || registrationOptionsQuery.isLoading ? "작업지시를 불러오는 중" : "작업지시 선택" },
                    ...eligibleWorkOrders.map((order) => ({ value: order.id, label: `${order.code} · ${order.itemCode} · 잔여 ${order.remainingLotQuantity.toLocaleString()} EA` })),
                  ]}
                />
              </div>
            </FormField>
            <FormField label="제품" htmlFor="lot-product" error={errors.productId}>
              <div className="[&>span]:w-full">
                <Select
                  id="lot-product"
                  value={form.productId}
                  onChange={(event) => {
                    update("productId", event.target.value);
                  }}
                  disabled={true}
                  options={[
                    { value: "", label: registrationOptionsQuery.isLoading ? "제품을 불러오는 중" : "제품 선택" },
                    ...(registrationOptionsQuery.data?.products ?? []).map((product) => ({
                      value: product.id,
                      label: `${product.productCode} · ${product.productName}`,
                    })),
                  ]}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">작업지시의 제품으로 자동 지정됩니다.</p>
            </FormField>
            <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
              <p className="text-sm font-medium">시작 공정</p>
              <p className="mt-1 text-xs text-muted-foreground">작업지시에 적용된 공정 경로의 첫 단계로 자동 지정됩니다.</p>
            </div>
            <FormField label="계획 수량" htmlFor="lot-quantity" error={errors.quantity}>
              <TextInput id="lot-quantity" type="number" min="1" max={remainingQuantity} step="1" value={form.quantity} onChange={(event) => update("quantity", event.target.value)} invalid={Boolean(errors.quantity)} autoFocus />
              {form.workOrderId && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {allocationQuery.isLoading
                    ? "잔여 수량을 확인하는 중입니다."
                    : `등록 가능 잔여 수량: ${(remainingQuantity ?? 0).toLocaleString()} EA`}
                </p>
              )}
            </FormField>
          </div>
          {submitError && <p role="alert" className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{submitError}</p>}
          <footer className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={close} disabled={createMutation.isPending} className="h-10 rounded-md border border-border px-4 text-sm font-medium hover:bg-accent disabled:opacity-50">취소</button>
            <button type="submit" disabled={createMutation.isPending || registrationOptionsQuery.isLoading || registrationOptionsQuery.isError || workOrdersQuery.isLoading || workOrdersQuery.isError || allocationQuery.isLoading || (Boolean(form.workOrderId) && (remainingQuantity ?? 0) < 1)} className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {createMutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
              등록하기
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
