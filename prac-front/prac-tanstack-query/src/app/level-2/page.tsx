import { Suspense } from "react";
import TaskPaginationPractice from "@/widgets/task-pagination-practice/ui/TaskPaginationPractice";

export default function Level2Page() {
  return (
    <main className="shell">
      <header className="hero level-two-hero">
        <div>
          <p className="eyebrow">FRONTEND PRACTICE · LEVEL 2</p>
          <h1>작업 관리</h1>
          <p>페이지별 작업 현황을 조회하고 상세 정보를 확인합니다.</p>
        </div>
        <span className="hero-badge">SERVER STATE · PAGINATION</span>
      </header>
      <Suspense
        fallback={
          <section className="level-two-card query-state loading-state" role="status">
            <span className="spinner" />
            작업 목록을 준비하는 중입니다…
          </section>
        }
      >
        <TaskPaginationPractice />
      </Suspense>
    </main>
  );
}
