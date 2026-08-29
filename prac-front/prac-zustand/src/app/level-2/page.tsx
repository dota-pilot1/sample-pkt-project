import LearningSettingsPractice from "@/widgets/learning-settings-practice/ui/LearningSettingsPractice";

export default function Level2Page() {
  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">FRONTEND PRACTICE · LEVEL 2</p>
        <h1>persist와 상태 조합</h1>
        <p>학습 진행 상태와 화면 설정을 하나의 스토어에서 조합하고 브라우저에 저장합니다.</p>
      </header>
      <LearningSettingsPractice />
    </main>
  );
}
