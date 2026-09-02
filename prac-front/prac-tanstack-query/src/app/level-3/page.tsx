import TaskMutationPractice from "@/widgets/task-mutation-practice/ui/TaskMutationPractice";

export default function Level3Page() {
  return (
    <main className="shell level-three-shell">
      <header className="hero level-two-hero level-three-hero">
        <div>
          <p className="eyebrow">FRONTEND PRACTICE · LEVEL 3</p>
          <h1>변경과 동기화</h1>
          <p>서버 데이터를 변경하고 관련 캐시를 최신 상태로 다시 맞춥니다.</p>
        </div>
        <span className="hero-badge">MUTATION · INVALIDATION</span>
      </header>
      <TaskMutationPractice />
    </main>
  );
}
