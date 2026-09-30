import { PackageOpen } from "lucide-react";
import { AdminShell } from "@/features/admin/ui/admin-shell";

export default function AdminPage() {
  return <AdminShell activeSection="plans" title="상품·요금제"><div className="page-heading"><h1>상품·요금제 관리</h1><p>요금제의 기본 정보와 판매 상태를 관리합니다.</p></div><section className="plan-list" aria-labelledby="plan-list-title"><div className="plan-list-header"><h2 id="plan-list-title">요금제 목록</h2><span className="preparation-badge">준비 중</span></div><div className="plan-table-scroll" role="region" aria-label="요금제 목록" tabIndex={0}><table className="plan-table"><thead><tr>{["요금제 코드", "요금제명", "분류", "월 기본료", "판매 상태", "수정일"].map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead></table></div><div className="plan-empty"><span className="plan-empty-icon"><PackageOpen aria-hidden="true" size={30} /></span><h3>요금제 관리 기능을 준비하고 있습니다.</h3><p>등록·조회 기능이 제공되면 이곳에서 요금제를 관리할 수 있습니다.</p></div></section></AdminShell>;
}
