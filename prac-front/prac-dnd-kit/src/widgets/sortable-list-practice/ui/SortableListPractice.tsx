"use client";

import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useState } from "react";

// 정렬 후에도 같은 작업을 식별할 수 있도록 화면 텍스트와 별개인 id를 둔다.
type ProcessTask = { id: string; title: string; owner: string };

const initialTasks: ProcessTask[] = [
  { id: "mixing", title: "원료 혼합", owner: "민수" },
  { id: "filling", title: "용기 충전", owner: "서연" },
  { id: "inspection", title: "중간 검사", owner: "지훈" },
  { id: "packing", title: "포장", owner: "유진" },
];

function SortableTask({ task, index }: { task: ProcessTask; index: number }) {

  // id와 현재 index를 등록하면 dnd-kit이 목록 안에서 이 작업의 위치를 추적한다.
  const { ref, handleRef, isDragSource, isDropTarget } = useSortable({
    id: task.id,
    index,
    type: "process-task",
  });

  return (
    <li
      ref={ref}
      className={`sortable-task ${isDragSource ? "is-dragging" : ""} ${isDropTarget ? "is-target" : ""}`}
    >
      {/* 카드 전체가 아닌 이 버튼에서만 드래그를 시작하도록 handleRef를 연결한다. */}
      <button
        ref={handleRef}
        className="drag-handle"
        aria-label={`${task.title} 순서 변경`}
      >
        ⠿
      </button>
      <span className="task-index">{String(index + 1).padStart(2, "0")}</span>
      <strong>{task.title}</strong>
      <small>{task.owner} 담당</small>
    </li>
  );
}

export default function SortableListPractice() {
  // 화면에 표시하는 순서 자체를 배열 상태로 보관한다.
  const [tasks, setTasks] = useState(initialTasks);
  return (
    <section className="card lesson-card">
      <p className="lesson-label">SORTABLE · DRAG HANDLE</p>
      <h2>작업 공정 순서</h2>
      <p className="section-help">
        카드 전체가 아닌 핸들에서만 드래그를 시작합니다. 키보드에서는 핸들에
        포커스 후 Space 또는 Enter로 시작할 수 있습니다.
      </p>
      <DragDropProvider
        onDragEnd={(event) => {
          // Escape 등으로 취소하면 원래 배열 상태를 유지한다.
          if (event.canceled) return;

          // move는 drag event의 시작·종료 위치를 사용해 새 배열을 반환한다.
          setTasks((current) => move(current, event));
        }}
      >
        <ol className="sortable-list">
          {tasks.map((task, index) => (
            <SortableTask key={task.id} task={task} index={index} />
          ))}
        </ol>
      </DragDropProvider>
      {/* initialTasks는 불변 상수이므로 언제든 같은 기본 순서를 복원할 수 있다. */}
      <button
        type="button"
        className="secondary"
        onClick={() => setTasks(initialTasks)}
      >
        기본 순서 복원
      </button>
    </section>
  );
}
