"use client";

import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import { useState } from "react";

// 드롭 이벤트의 target id로 안전하게 좁힐 수 있는 화면 위치 상태다.
type ZoneId = "assembly-zone" | "inspection-zone";

// 렌더링 순서와 droppable id를 한 배열에서 관리해 두 영역을 같은 규칙으로 만든다.
const zones: { id: ZoneId; title: string; caption: string }[] = [
  {
    id: "assembly-zone",
    title: "조립 대기",
    caption: "조립 전 LOT",
  },
  {
    id: "inspection-zone",
    title: "검사 대기",
    caption: "검사 전 LOT",
  },
];

function LotCard({ currentZone }: { currentZone: string }) {
  const { ref } = useDraggable({ id: "lot-card" });
  return (
    <article ref={ref} className="lot-card">
      <span>LOT-2026-0829</span>
      <strong>{currentZone}</strong>
      <small>점선 영역으로 드래그해 이동해 보세요.</small>
    </article>
  );
}

function LotZone({
  zone,
  hasLot,
}: {
  zone: (typeof zones)[number];
  hasLot: boolean;
}) {
  // 비어 있는 영역도 droppable로 등록해야 반대쪽에서 카드를 다시 받을 수 있다.
  const { ref, isDropTarget } = useDroppable({ id: zone.id });
  return (
    <section
      ref={ref}
      className={`drop-zone ${isDropTarget ? "is-target" : ""}`}
    >
      <p className="lesson-label">DROPPABLE</p>
      <h2>{zone.title}</h2>
      <p className="section-help">{zone.caption}</p>
      {hasLot ? (
        <LotCard currentZone={zone.title} />
      ) : (
        <p className="empty-copy">여기에 LOT 카드를 놓으세요.</p>
      )}
    </section>
  );
}

export default function BasicDragPractice() {
  // 카드 데이터는 하나이고, 어느 영역에 보일지만 상태로 결정한다.
  const [currentZone, setCurrentZone] = useState<ZoneId>("assembly-zone");
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        // Escape 등으로 취소된 드래그는 현재 위치를 그대로 유지한다.
        if (event.canceled) return;

        const targetId = event.operation.target?.id;
        // 영역 밖 드롭 등 허용되지 않은 대상은 화면 상태를 바꾸지 않는다.
        if (targetId !== "assembly-zone" && targetId !== "inspection-zone") return;

        setCurrentZone(targetId);
      }}
    >
      <div className="practice-grid">
        {zones.map((zone) => (
          <LotZone key={zone.id} zone={zone} hasLot={currentZone === zone.id} />
        ))}
      </div>
      <button
        type="button"
        className="secondary reset-zone-button"
        onClick={() => setCurrentZone("assembly-zone")}
      >
        조립 대기로 초기화
      </button>
    </DragDropProvider>
  );
}
