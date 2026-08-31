"use client";

import { useEffect, useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, X } from "lucide-react";
import { toast } from "sonner";
import { lotApi } from "@/entities/lot";
import { getErrorMessage, getFieldErrors } from "@/shared/api/errors";
import { FormField } from "@/shared/ui/FormField";
import { Select } from "@/shared/ui/Select";
import { TextInput } from "@/shared/ui/TextInput";

type LotCreateDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

type LotCreateForm = {
  productId: string;
  processId: string;
  tester: string;
  /** 빈 입력 상태를 보존해 수량을 직접 지우고 다시 입력할 수 있다. */
  quantity: string;
};

const initialForm: LotCreateForm = {
  productId: "",
  processId: "",
  tester: "",
  quantity: "1",
};

type ClientErrors = Partial<Record<keyof LotCreateForm, string>>;

function validate(form: LotCreateForm): ClientErrors {
  const errors: ClientErrors = {};
  if (!form.productId) errors.productId = "제품을 선택하세요.";
  if (!form.processId) errors.processId = "공정을 선택하세요.";
  const quantity = Number(form.quantity);
  if (!form.quantity || !Number.isInteger(quantity) || quantity < 1) {
    errors.quantity = "계획 수량은 1 이상인 정수여야 합니다.";
  }
  return errors;
}

/** LOT 등록 후 목록·필터 캐시를 함께 갱신하는 모달 폼이다. */
export function LotCreateDialog({ isOpen, onClose }: LotCreateDialogProps) {
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

  /** 제품을 먼저 고른 뒤, 해당 제품의 순번 있는 공정 경로만 조회한다. */
  const processOptionsQuery = useQuery({
    queryKey: ["lot-registration-process-options", form.productId],
    queryFn: () => lotApi.getRegistrationProcessOptions(form.productId),
    enabled: isOpen && Boolean(form.productId),
    // 제품이 바뀌면 Query Key가 바뀌므로 해당 제품의 공정 경로를 새로 조회한다.
    staleTime: 0,
  });

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
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    createMutation.mutate({
      productId: Number(form.productId),
      processId: Number(form.processId),
      tester: form.tester.trim(),
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
            <FormField label="제품" htmlFor="lot-product" error={errors.productId}>
              <div className="[&>span]:w-full">
                <Select
                  id="lot-product"
                  value={form.productId}
                  onChange={(event) => {
                    update("productId", event.target.value);
                    update("processId", "");
                  }}
                  disabled={registrationOptionsQuery.isLoading || registrationOptionsQuery.isError}
                  options={[
                    { value: "", label: registrationOptionsQuery.isLoading ? "제품을 불러오는 중" : "제품 선택" },
                    ...(registrationOptionsQuery.data?.products ?? []).map((product) => ({
                      value: product.id,
                      label: `${product.productCode} · ${product.productName}`,
                    })),
                  ]}
                />
              </div>
            </FormField>
            <FormField
              label="현재 공정"
              htmlFor="lot-process"
              error={errors.processId ?? (processOptionsQuery.isError ? "공정 경로를 불러오지 못했습니다." : undefined)}
            >
              <div className="[&>span]:w-full">
                <Select
                  id="lot-process"
                  value={form.processId}
                  onChange={(event) => update("processId", event.target.value)}
                  disabled={!form.productId || processOptionsQuery.isLoading || processOptionsQuery.isError}
                  options={[
                    {
                      value: "",
                      label: !form.productId
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
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="계획 수량" htmlFor="lot-quantity" error={errors.quantity}>
                <TextInput id="lot-quantity" type="number" min="1" step="1" value={form.quantity} onChange={(event) => update("quantity", event.target.value)} invalid={Boolean(errors.quantity)} autoFocus />
              </FormField>
              <FormField label="Tester" htmlFor="lot-tester" hint="비워 두면 미배정으로 등록됩니다.">
                <TextInput id="lot-tester" value={form.tester} onChange={(event) => update("tester", event.target.value)} placeholder="TESTER-01" />
              </FormField>
            </div>
          </div>
          {submitError && <p role="alert" className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{submitError}</p>}
          <footer className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={close} disabled={createMutation.isPending} className="h-10 rounded-md border border-border px-4 text-sm font-medium hover:bg-accent disabled:opacity-50">취소</button>
            <button type="submit" disabled={createMutation.isPending || registrationOptionsQuery.isLoading || registrationOptionsQuery.isError || processOptionsQuery.isLoading || processOptionsQuery.isError} className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {createMutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
              등록하기
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
