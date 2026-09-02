import LevelTwoPractice from "@/widgets/level-two-practice/ui/LevelTwoPractice";

export default function Level2Page() {
  return (
    <main className="shell">
      <header className="hero level-two-hero">
        <p className="eyebrow">FRONTEND PRACTICE · LEVEL 2</p>
        <h1>공통 fetch 래퍼로 설비 CRUD</h1>
        <p>반복되는 JSON 처리와 HTTP 오류 변환을 공통화하고 인증된 조회·등록·수정·삭제에 적용합니다.</p>
      </header>

      {/* Level 2는 Level 1의 서버 세션을 선행 조건으로 사용한다. */}
      <LevelTwoPractice />
    </main>
  );
}
