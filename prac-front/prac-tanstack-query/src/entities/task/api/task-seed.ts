import type { Task } from "../model/task";

/** 빈 SQLite를 처음 실행할 때만 넣는 페이지네이션 학습용 기준 데이터다. */
export const taskSeed: Task[] = [
  { id: 1, title: "작업 지시 목록 조회", owner: "생산관리", status: "진행 중", priority: "높음", dueDate: "2026-08-30", description: "당일 생산 라인의 작업 지시를 확인하고 담당자별 진행 상태를 정리합니다." },
  { id: 2, title: "설비 점검 결과 확인", owner: "설비팀", status: "검토 대기", priority: "보통", dueDate: "2026-08-31", description: "주간 설비 점검 결과를 검토하고 조치가 필요한 항목을 분류합니다." },
  { id: 3, title: "불량 원인 기록", owner: "품질팀", status: "완료", priority: "높음", dueDate: "2026-08-29", description: "최근 불량 건의 원인과 재발 방지 조치를 품질 기록에 남깁니다." },
  { id: 4, title: "자재 입고 수량 대조", owner: "자재팀", status: "진행 중", priority: "보통", dueDate: "2026-09-01", description: "입고 예정 수량과 실제 검수 수량을 비교하고 차이를 기록합니다." },
  { id: 5, title: "공정별 생산 실적 마감", owner: "생산관리", status: "검토 대기", priority: "높음", dueDate: "2026-09-01", description: "교대조별 생산 실적을 마감하고 누락된 공정 데이터를 확인합니다." },
  { id: 6, title: "안전 교육 이수 현황", owner: "안전관리", status: "진행 중", priority: "낮음", dueDate: "2026-09-03", description: "월간 안전 교육 대상자와 이수 여부를 확인해 미이수자에게 안내합니다." },
  { id: 7, title: "출하 전 최종 검수", owner: "품질팀", status: "검토 대기", priority: "높음", dueDate: "2026-09-02", description: "출하 예정 제품의 외관과 수량, 검사 성적서를 최종 확인합니다." },
  { id: 8, title: "작업장 정리 점검", owner: "현장관리", status: "완료", priority: "낮음", dueDate: "2026-08-28", description: "5S 기준에 따라 작업장 정리 상태와 개선 요청을 점검합니다." },
  { id: 9, title: "원자재 재고 실사", owner: "자재팀", status: "진행 중", priority: "보통", dueDate: "2026-09-04", description: "창고의 원자재 전산 재고와 실제 수량을 대조하고 차이를 기록합니다." },
  { id: 10, title: "생산 라인 전환 준비", owner: "생산관리", status: "검토 대기", priority: "높음", dueDate: "2026-09-04", description: "다음 품목 생산을 위한 설비 조건과 작업 표준서 준비 상태를 확인합니다." },
  { id: 11, title: "측정 장비 교정 확인", owner: "품질팀", status: "완료", priority: "보통", dueDate: "2026-09-05", description: "검사에 사용하는 측정 장비의 교정 유효기간과 점검 기록을 확인합니다." },
  { id: 12, title: "예방 보전 일정 등록", owner: "설비팀", status: "진행 중", priority: "보통", dueDate: "2026-09-05", description: "주요 설비의 가동 시간을 기준으로 다음 예방 보전 일정을 등록합니다." },
  { id: 13, title: "공정 이상 보고 검토", owner: "품질팀", status: "검토 대기", priority: "높음", dueDate: "2026-09-06", description: "현장에서 등록한 공정 이상 보고의 원인과 임시 조치 내용을 검토합니다." },
  { id: 14, title: "포장 자재 규격 확인", owner: "자재팀", status: "완료", priority: "낮음", dueDate: "2026-09-06", description: "출하 품목에 적용할 포장 자재의 규격과 라벨 정보를 확인합니다." },
  { id: 15, title: "교대조 인수인계 작성", owner: "현장관리", status: "진행 중", priority: "보통", dueDate: "2026-09-07", description: "미완료 작업과 설비 특이사항을 다음 교대조가 확인할 수 있도록 작성합니다." },
  { id: 16, title: "작업 표준서 개정 검토", owner: "생산기술", status: "검토 대기", priority: "높음", dueDate: "2026-09-07", description: "공정 변경 사항이 반영된 작업 표준서의 개정 내용과 적용 일정을 검토합니다." },
  { id: 17, title: "에너지 사용량 집계", owner: "설비팀", status: "완료", priority: "낮음", dueDate: "2026-09-08", description: "설비별 전력과 압축 공기 사용량을 집계해 전주 데이터와 비교합니다." },
  { id: 18, title: "긴급 작업 승인 요청", owner: "안전관리", status: "진행 중", priority: "높음", dueDate: "2026-09-08", description: "비정기 정비 작업의 위험 요소와 안전 조치를 확인하고 승인을 요청합니다." },
  { id: 19, title: "완제품 보관 위치 조정", owner: "물류팀", status: "검토 대기", priority: "보통", dueDate: "2026-09-09", description: "출하 일정과 창고 적재율을 기준으로 완제품 보관 위치를 조정합니다." },
  { id: 20, title: "월간 개선 과제 마감", owner: "생산관리", status: "완료", priority: "보통", dueDate: "2026-09-10", description: "부서별 개선 과제의 실행 결과와 후속 조치 여부를 확인해 월간 실적을 마감합니다." },
];
