export default function LevelThreePage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">LEVEL 3 · MULTI-LIST · PLANNED</p>
        <h1>칸반 보드 이동 — 구현 예정</h1>
        <p>
          동일 목록의 순서 정렬 다음에, 서로 다른 공정 칸 사이에서 LOT를
          옮기는 다중 목록 실습을 다룹니다.
        </p>
      </section>
      <section className="card planned-card">
        <p className="lesson-label">COMING NEXT</p>
        <h2>다중 목록 칸반 보드</h2>
        <p className="section-help">
          레벨 2의 단일 목록 정렬을 충분히 익힌 뒤 진행합니다. 구현할 때는
          컬럼 간 이동, 빈 컬럼 드롭, 드래그 취소 시 원래 상태 복구를 함께
          다룹니다.
        </p>
      </section>
    </main>
  );
}
