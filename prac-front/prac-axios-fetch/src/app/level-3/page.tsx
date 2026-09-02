import LevelThreePractice from "@/widgets/level-three-practice/ui/LevelThreePractice";

export default function Level3Page() {
  return (
    <main className="shell">
      <header className="hero level-three-hero">
        <p className="eyebrow">FRONTEND PRACTICE · LEVEL 3</p>
        <h1>Axios로 설비 CRUD 완성하기</h1>
        <p>레벨 2와 같은 인증 CRUD를 Axios로 다시 연결하며 자동 JSON 처리·오류 reject·인터셉터의 차이를 익힙니다.</p>
      </header>

      <LevelThreePractice />
    </main>
  );
}
