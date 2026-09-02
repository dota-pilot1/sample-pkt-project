import BasicDragPractice from "@/widgets/basic-drag-practice/ui/BasicDragPractice";

export default function LevelOnePage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">LEVEL 1 · FOUNDATION</p>
        <h1>드래그와 드롭의 연결</h1>
        <p>
          고유 ID를 가진 draggable과 droppable을 DragDropProvider 안에서
          연결합니다.
        </p>
      </section>
      <BasicDragPractice />
    </main>
  );
}
