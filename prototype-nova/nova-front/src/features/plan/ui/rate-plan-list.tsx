"use client";

import { PackageOpen } from "lucide-react";
import { type RatePlanSalesStatus } from "@/features/plan/api";
import { useRatePlanList } from "@/features/plan/model/use-rate-plan-list";

const statusLabels: Record<RatePlanSalesStatus, string> = {
  DRAFT: "작성 중",
  ACTIVE: "판매 중",
  SUSPENDED: "판매 중지",
  TERMINATED: "판매 종료",
};

const formatFee = (value: number) => `${value.toLocaleString("ko-KR")}원`;
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(value));

export function RatePlanList() {
  const plans = useRatePlanList({ page: 1, size: 20 });

  return (
    <section className="plan-list" aria-labelledby="plan-list-title">
      <div className="plan-list-header">
        <div>
          <h2 id="plan-list-title">요금제 목록</h2>
          <p>총 {plans.data?.totalElements ?? 0}건</p>
        </div>
        <span className="preparation-badge">테스트 데이터</span>
      </div>
      {plans.isPending ? (
        <p className="plan-state">요금제 목록을 불러오는 중입니다.</p>
      ) : plans.isError ? (
        <p className="plan-state plan-state-error">요금제 목록을 불러오지 못했습니다.</p>
      ) : plans.data.items.length === 0 ? (
        <div className="plan-empty">
          <span className="plan-empty-icon"><PackageOpen aria-hidden="true" size={30} /></span>
          <h3>등록된 요금제가 없습니다.</h3>
          <p>요금제를 등록하면 이곳에서 기본 정보와 판매 상태를 확인할 수 있습니다.</p>
        </div>
      ) : (
        <div className="plan-table-scroll" role="region" aria-label="요금제 목록" tabIndex={0}>
          <table className="plan-table">
            <thead>
              <tr>{["요금제 코드", "요금제명", "분류", "월 기본료", "판매 상태", "수정일"].map((column) => <th key={column} scope="col">{column}</th>)}</tr>
            </thead>
            <tbody>
              {plans.data.items.map((plan) => (
                <tr key={plan.id}>
                  <td><strong>{plan.ratePlanCode}</strong></td>
                  <td>{plan.name}</td>
                  <td>{plan.categoryName}</td>
                  <td>{formatFee(plan.monthlyFee)}</td>
                  <td><span className={`plan-status plan-status-${plan.salesStatus.toLowerCase()}`}>{statusLabels[plan.salesStatus]}</span></td>
                  <td>{formatDate(plan.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
