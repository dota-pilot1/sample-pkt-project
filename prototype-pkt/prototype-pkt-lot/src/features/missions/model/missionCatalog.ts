export type Mission = {
  id: string;
  number: number;
  title: string;
  focus: string;
  icon: "grid" | "table" | "detail" | "tabs" | "box" | "route" | "server" | "search" | "timeline" | "badge" | "form" | "inspect" | "drilldown" | "chart" | "monitor" | "alert" | "audit" | "batch" | "error" | "state";
};

export const missions: Mission[] = [
  { id: "ag-grid-lot", number: 1, title: "AG Grid LOT 관리", focus: "정렬, 필터, 고정 컬럼, 다중 선택", icon: "grid" },
  { id: "tanstack-table-lot", number: 2, title: "TanStack Table LOT 관리", focus: "Headless Table, 직접 상태·렌더링 제어", icon: "table" },
  { id: "lot-master-detail", number: 3, title: "LOT Master → Detail", focus: "행 선택, 상세 패널, 선택 상태 유지", icon: "detail" },
  { id: "lot-detail-tabs", number: 4, title: "LOT 상세 Tab 화면", focus: "기본정보 / 공정 / 품질 / 장비 / 로그", icon: "tabs" },
  { id: "product-master", number: 5, title: "제품 Master 관리", focus: "조회, 등록, 수정, 활성/비활성", icon: "box" },
  { id: "process-master", number: 6, title: "공정 Master 관리", focus: "공정 순서, 단계 편집, CRUD", icon: "route" },
  { id: "equipment-master", number: 7, title: "장비·설비 Master 관리", focus: "장비 상태, 공정 연결, 가동 여부", icon: "server" },
  { id: "compound-search", number: 8, title: "복합 검색조건 화면", focus: "기간, LOT, 제품, 공정, 장비 필터", icon: "search" },
  { id: "server-pagination", number: 9, title: "Server Pagination Grid", focus: "서버 정렬, 필터, 페이징, Query 동기화", icon: "server" },
  { id: "process-timeline", number: 10, title: "공정 이력 Timeline", focus: "Track-In → Start → End → Track-Out", icon: "timeline" },
  { id: "lot-status-badges", number: 11, title: "LOT 상태 Badge 시스템", focus: "WAIT / RUN / HOLD / DONE / FAIL", icon: "badge" },
  { id: "test-condition-form", number: 12, title: "TEST 조건 CRUD Form", focus: "RHF, Zod, 조건부 Validation", icon: "form" },
  { id: "inspection-grid", number: 13, title: "검사 결과 Grid", focus: "PASS/FAIL, 측정값, Spec 비교", icon: "inspect" },
  { id: "defect-drilldown", number: 14, title: "불량 Drill-down", focus: "불량 → LOT → 공정 → 장비 추적", icon: "drilldown" },
  { id: "yield-dashboard", number: 15, title: "수율·불량률 Trend Dashboard", focus: "Yield, Fail Rate, 기간 비교", icon: "chart" },
  { id: "realtime-monitoring", number: 16, title: "실시간 Monitoring 화면", focus: "Polling/SSE, 실시간 상태 갱신", icon: "monitor" },
  { id: "alert-center", number: 17, title: "Alert Center", focus: "Critical/Warning, 확인/해제 처리", icon: "alert" },
  { id: "audit-log", number: 18, title: "변경이력 Audit Log", focus: "Before/After 비교, 사용자/시간 추적", icon: "audit" },
  { id: "batch-action", number: 19, title: "대량 선택 + Batch Action", focus: "다중 LOT Hold/Release 처리", icon: "batch" },
  { id: "error-recovery", number: 20, title: "업무 예외·복구 UX", focus: "API 실패, 재시도, Partial Error", icon: "error" },
];

export function findMission(id: string) {
  return missions.find((mission) => mission.id === id);
}
