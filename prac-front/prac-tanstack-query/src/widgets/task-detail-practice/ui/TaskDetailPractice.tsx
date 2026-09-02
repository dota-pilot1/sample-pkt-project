"use client";

import Link from "next/link";
import { useTaskDetailQuery } from "@/entities/task/model/useTaskQuery";
import { formatTime } from "@/shared/lib/date/formatTime";

type TaskDetailPracticeProps = {
  taskId: number;
  fromPage: number;
  fromSize: number;
};

export default function TaskDetailPractice({
  taskId,
  fromPage,
  fromSize,
}: TaskDetailPracticeProps) {
  const taskDetailQuery = useTaskDetailQuery(taskId);

  if (taskDetailQuery.isPending) {
    return (
      <section className="level-two-card query-state loading-state" role="status">
        <span className="spinner" />
        작업 상세를 불러오는 중입니다…
      </section>
    );
  }

  if (taskDetailQuery.isError) {
    return (
      <section className="level-two-card query-state error-state" role="alert">
        <strong>상세 정보를 불러오지 못했습니다.</strong>
        <p>{taskDetailQuery.error.message}</p>
        <button type="button" onClick={() => taskDetailQuery.refetch()}>
          다시 시도
        </button>
      </section>
    );
  }

  const { task, fetchedAt } = taskDetailQuery.data;

  return (
    <section className="level-two-card detail-card">
      {/* 상세 진입 전의 목록 페이지를 보존해 사용자가 같은 목록 위치로 돌아가게 한다. */}
      <Link
        href={`/level-2?page=${fromPage}&size=${fromSize}`}
        className="back-link"
      >
        ← 목록으로
      </Link>
      <div className="detail-title">
        <div>
          <p className="eyebrow dark">TASK #{task.id}</p>
          <h2>{task.title}</h2>
        </div>
        <span className="status-badge">{task.status}</span>
      </div>
      <p className="detail-description">{task.description}</p>
      <dl className="detail-grid">
        <div>
          <dt>담당 부서</dt>
          <dd>{task.owner}</dd>
        </div>
        <div>
          <dt>우선순위</dt>
          <dd>{task.priority}</dd>
        </div>
        <div>
          <dt>마감일</dt>
          <dd>{task.dueDate}</dd>
        </div>
        <div>
          <dt>캐시 키</dt>
          <dd>["tasks", "detail", {task.id}]</dd>
        </div>
      </dl>
      <p className="fetched-at">마지막 서버 응답: {formatTime(fetchedAt)}</p>
    </section>
  );
}
