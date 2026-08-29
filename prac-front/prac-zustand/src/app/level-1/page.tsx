import CounterPractice from "@/widgets/counter-practice/ui/CounterPractice";

export default function Level1Page() {
  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">FRONTEND PRACTICE · LEVEL 1</p>
        <h1>기본 상태와 액션</h1>
        <p>Zustand 스토어를 만들고 컴포넌트에서 상태를 읽고 변경합니다.</p>
      </header>

      <CounterPractice />
    </main>
  );
}
