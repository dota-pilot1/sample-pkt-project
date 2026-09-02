import TaskQueryPractice from "@/widgets/task-query-practice/ui/TaskQueryPractice";

export default function Level1Page() {
  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">FRONTEND PRACTICE · LEVEL 1</p>
        <h2>조회와 캐시</h2>
      </header>

      {/* app 라우트는 페이지 맥락과 위젯 조립만 맡고, 조회 로직은 하위 FSD 레이어에 둔다. */}
      <TaskQueryPractice />
    </main>
  );
}
