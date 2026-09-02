"use client";

import { move } from "@dnd-kit/helpers";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useRef, useState } from "react";

type ColumnId = "ready" | "working" | "done";
type BoardItems = Record<ColumnId, string[]>;

const initialItems: BoardItems = {
  ready: ["LOT-101", "LOT-102"],
  working: ["LOT-103"],
  done: [],
};
const columns: { id: ColumnId; title: string; description: string }[] = [
  { id: "ready", title: "작업 대기", description: "배정 전 LOT" },
  { id: "working", title: "진행 중", description: "현재 생산 LOT" },
  { id: "done", title: "완료", description: "검사 완료 LOT" },
];

function BoardCard({
  id,
  index,
  column,
}: {
  id: string;
  index: number;
  column: ColumnId;
}) {
  const { ref, handleRef, isDragSource } = useSortable({
    id,
    index,
    group: column,
    type: "lot",
  });
  return (
    <li ref={ref} className={`board-card ${isDragSource ? "is-dragging" : ""}`}>
      <button ref={handleRef} className="drag-handle" aria-label={`${id} 이동`}>
        ⠿
      </button>
      <strong>{id}</strong>
      <small>우선순위 {index + 1}</small>
    </li>
  );
}

function BoardColumn({
  column,
  items,
}: {
  column: (typeof columns)[number];
  items: string[];
}) {
  const { ref, isDropTarget } = useDroppable({
    id: column.id,
    accept: "lot",
    collisionPriority: -1,
  });
  return (
    <section
      ref={ref}
      className={`board-column ${isDropTarget ? "is-target" : ""}`}
    >
      <header>
        <span>{items.length}</span>
        <div>
          <h2>{column.title}</h2>
          <p>{column.description}</p>
        </div>
      </header>
      <ol>
        {items.length ? (
          items.map((id, index) => (
            <BoardCard key={id} id={id} index={index} column={column.id} />
          ))
        ) : (
          <li className="empty-card">여기에 LOT를 놓으세요.</li>
        )}
      </ol>
    </section>
  );
}

export default function KanbanPractice() {
  const [items, setItems] = useState<BoardItems>(initialItems);
  const previousItems = useRef(items);
  return (
    <section className="kanban-wrap">
      <div className="kanban-intro">
        <p className="lesson-label">MULTIPLE SORTABLE LISTS</p>
        <h2>생산 LOT 흐름</h2>
        <p>
          빈 칸도 droppable로 등록해야 다른 목록의 카드를 받을 수 있습니다.
          Escape로 취소하면 드래그 전 상태로 되돌립니다.
        </p>
        <button
          type="button"
          className="secondary"
          onClick={() => setItems(initialItems)}
        >
          보드 초기화
        </button>
      </div>
      <DragDropProvider
        onDragStart={() => {
          previousItems.current = items;
        }}
        onDragOver={(event) => setItems((current) => move(current, event))}
        onDragEnd={(event) => {
          if (event.canceled) setItems(previousItems.current);
        }}
      >
        <div className="kanban-board">
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              items={items[column.id]}
            />
          ))}
        </div>
      </DragDropProvider>
    </section>
  );
}
