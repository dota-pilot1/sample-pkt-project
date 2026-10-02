"use client";

import { useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Info } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { ApiError } from "@/shared/api/client";
import { ratePlanApi, type CreateRatePlanRequest } from "../api";

type Props = {
  onClose: () => void;
  onCreated: (name: string) => void;
  onForbidden: () => Promise<unknown>;
};

/** 요금제 초안을 저장한다. 권한의 최종 판단은 서버에 맡긴다. */
export function CreateRatePlanForm({ onClose, onCreated, onForbidden }: Props) {
  const queryClient = useQueryClient();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const categories = useQuery({
    queryKey: ["rate-plan-categories"],
    queryFn: ratePlanApi.findCategories,
    retry: false,
  });
  const creation = useMutation({ mutationFn: ratePlanApi.create });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const saleStart = new Date(value("saleStartAt"));
    const errors: Record<string, string> = {};
    if (!value("ratePlanCode")) errors.ratePlanCode = "요금제 코드를 입력해 주세요.";
    if (!value("name")) errors.name = "요금제명을 입력해 주세요.";
    if (!Number.isFinite(saleStart.getTime())) errors.saleStartAt = "판매 시작일을 확인해 주세요.";
    setError("");
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    const body: CreateRatePlanRequest = {
      ratePlanCode: value("ratePlanCode"),
      name: value("name"),
      categoryCode: value("categoryCode"),
      monthlyFee: Number(value("monthlyFee")),
      // datetime-local은 사용자 시간대의 입력이다. UTC로 변환해 서버에 offset을 전달한다.
      saleStartAt: saleStart.toISOString(),
      description: value("description"),
    };
    submitting.current = true;
    setBusy(true);
    try {
      const created = await creation.mutateAsync(body);
      await queryClient.invalidateQueries({ queryKey: ["rate-plans"] });
      onCreated(created.name);
    } catch (cause) {
      if (cause instanceof ApiError) {
        setFieldErrors({
          ...cause.fieldErrors,
          ...(cause.code === "DUPLICATE_RATE_PLAN_CODE" ? { ratePlanCode: cause.message } : {}),
        });
        setError(cause.status === 403 ? "요금제를 생성할 권한이 없습니다. 권한을 다시 확인해 주세요." : cause.message);
        if (cause.status === 403) await onForbidden();
      } else {
        setError("저장하지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.");
      }
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  const blocked = !categories.isSuccess || categories.data.length === 0;
  function fieldError(key: string) {
    return fieldErrors[key] ? <small id={`plan-error-${key}`} className="plan-field-error">{fieldErrors[key]}</small> : null;
  }
  const invalid = (key: string) => ({
    "aria-invalid": Boolean(fieldErrors[key]),
    "aria-describedby": fieldErrors[key] ? `plan-error-${key}` : undefined,
  });

  return (
    <section className="plan-create" aria-label="요금제 등록 폼">
      {categories.isPending && <p className="plan-form-message" role="status">분류를 불러오는 중입니다.</p>}
      {categories.isError && (
        <div className="plan-form-message" role="alert">
          <p>분류를 조회하지 못했습니다. 조회 권한과 연결 상태를 확인해 주세요.</p>
          <Button variant="outline" size="sm" onClick={() => categories.refetch()}>다시 시도</Button>
        </div>
      )}
      {categories.isSuccess && categories.data.length === 0 && <p className="plan-form-message" role="alert">사용 가능한 분류가 없습니다.</p>}
      <form onSubmit={submit} aria-busy={busy}>
        <fieldset disabled={busy}>
          <section className="plan-form-section" aria-labelledby="plan-basic-title">
            <div className="plan-form-section-heading">
              <span className="plan-section-number">01</span>
              <h3 id="plan-basic-title">기본 정보</h3>
              <p>요금제를 식별하고 분류하는 정보입니다.</p>
              <small>* 필수 입력</small>
            </div>
            <div className="plan-form-grid">
              <label htmlFor="plan-code">요금제 코드 <span className="plan-required">*</span>
                <Input id="plan-code" name="ratePlanCode" required maxLength={50} placeholder="예: NOVA-MOBILE-39" autoFocus {...invalid("ratePlanCode")} />
                <small className="plan-field-hint">기존 요금제와 중복되지 않는 코드를 입력하세요.</small>
                {fieldError("ratePlanCode")}
              </label>
              <label htmlFor="plan-name">요금제명 <span className="plan-required">*</span>
                <Input id="plan-name" name="name" required maxLength={150} placeholder="예: NOVA 모바일 39" {...invalid("name")} />
                {fieldError("name")}
              </label>
              <label htmlFor="plan-category">분류 <span className="plan-required">*</span>
                <Select id="plan-category" name="categoryCode" required defaultValue="" disabled={blocked} {...invalid("categoryCode")}>
                  <option value="" disabled>요금제 분류를 선택하세요</option>
                  {categories.data?.map((category) => (
                    <option key={category.id} value={category.code}>{category.name}</option>
                  ))}
                </Select>
                {fieldError("categoryCode")}
              </label>
            </div>
          </section>
          <section className="plan-form-section" aria-labelledby="plan-price-title">
            <div className="plan-form-section-heading">
              <span className="plan-section-number">02</span>
              <h3 id="plan-price-title">요금 및 일정</h3>
              <p>월 기본료와 판매 시작 예정일을 설정합니다.</p>
            </div>
            <div className="plan-form-grid">
              <label htmlFor="plan-fee">월 기본료 <span className="plan-required">*</span>
                <span className="plan-fee-input">
                  <Input id="plan-fee" name="monthlyFee" type="number" required min="0.01" max="9999999999.99" step="0.01" placeholder="예: 39000" {...invalid("monthlyFee")} />
                  <span aria-hidden="true">원 / 월</span>
                </span>
                <small className="plan-field-hint">0원보다 큰 금액을 입력하세요.</small>
                {fieldError("monthlyFee")}
              </label>
              <label htmlFor="plan-start">판매 시작일 <span className="plan-required">*</span>
                <Input id="plan-start" name="saleStartAt" type="datetime-local" required {...invalid("saleStartAt")} />
                <small className="plan-field-hint">입력한 일정은 초안에 저장됩니다.</small>
                {fieldError("saleStartAt")}
              </label>
            </div>
          </section>
          <section className="plan-form-section" aria-labelledby="plan-description-title">
            <div className="plan-form-section-heading">
              <span className="plan-section-number">03</span>
              <h3 id="plan-description-title">추가 설명</h3>
              <p>혜택과 운영 참고사항을 기록합니다.</p>
            </div>
            <div className="plan-form-grid">
              <label className="plan-form-description" htmlFor="plan-description">설명 <span className="plan-optional">선택</span>
                <Textarea id="plan-description" name="description" maxLength={5000} rows={3} placeholder="제공 혜택, 적용 대상 등 요금제에 대한 설명을 입력하세요." {...invalid("description")} />
                {fieldError("description")}
              </label>
            </div>
          </section>
          {error && <p className="plan-form-message plan-field-error" role="alert">{error}</p>}
          <footer className="plan-form-footer">
            <p><Info size={16} aria-hidden="true" />초안 저장만으로 판매가 시작되지는 않습니다.</p>
            <div className="plan-form-actions">
              <Button variant="outline" onClick={onClose}>취소</Button>
              <Button type="submit" loading={busy} disabled={blocked}>
                {!busy && <Save size={16} aria-hidden="true" />}
                {busy ? "저장 중…" : "초안 저장"}
              </Button>
            </div>
          </footer>
        </fieldset>
      </form>
    </section>
  );
}
