import SortableListPractice from "@/widgets/sortable-list-practice/ui/SortableListPractice";

export default function LevelTwoPage() {
  return (
    <main className="shell level-two-page">
      <section className="hero">
        <p className="eyebrow">LEVEL 2 · SORTABLE</p>
        <h1>작업 순서 정렬</h1>
        <p>
          useSortable과 drag handle로 하나의 작업 목록을 안전하게 재정렬합니다.
        </p>
      </section>
      <SortableListPractice />
    </main>
  );
}
