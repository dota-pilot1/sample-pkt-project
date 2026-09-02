"use client";

import { useTaskQuery } from "@/entities/task/model/useTaskQuery";
import { formatTime } from "@/shared/lib/date/formatTime";

export default function TaskQueryPractice() {
  // 위젯은 HTTP·캐시 설정을 알 필요 없이, 도메인 훅이 제공하는 서버 상태만 렌더링한다.
  const taskQuery = useTaskQuery();

  return (
    <>
      <section className="practice-grid">
        <article className="card task-card">
          <div className="card-title">
            <span>01</span>
            <div>
              <h2>오늘의 작업 지시</h2>
              <p>Route Handler에서 조회한 서버 상태입니다.</p>
            </div>
          </div>

          <div className="query-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => taskQuery.refetch()}
              disabled={taskQuery.isFetching}
            >
              {taskQuery.isFetching ? "새로 불러오는 중…" : "다시 불러오기"}
            </button>
          </div>

          {taskQuery.isPending ? (
            <div className="query-state loading-state" role="status">
              <span className="spinner" />
              작업 지시를 불러오는 중입니다…
            </div>
          ) : taskQuery.isError ? (
            // 실패 원인은 API 계층이 만든 Error 메시지로 사용자에게 안내하고 같은 요청을 재시도한다.
            <div className="query-state error-state" role="alert">
              <strong>조회에 실패했습니다.</strong>
              <p>{taskQuery.error.message}</p>
              <button type="button" onClick={() => taskQuery.refetch()}>
                다시 시도
              </button>
            </div>
          ) : (
            <>
              <ul className="task-list">
                {taskQuery.data.tasks.map((task) => (
                  <li key={task.id}>
                    <div>
                      <strong>{task.title}</strong>
                      <span>{task.owner}</span>
                    </div>
                    <span className="status-badge">{task.status}</span>
                  </li>
                ))}
              </ul>
              <p className="fetched-at">
                마지막 서버 응답: {formatTime(taskQuery.data.fetchedAt)}
              </p>
            </>
          )}
        </article>

        <aside className="card lesson-card">
          <p className="lesson-label">LEVEL 1 · LESSONS</p>
          <h2>이번 단계에서 확인할 것</h2>
          <ol className="topics">
            <li>
              <b>QueryClientProvider 준비</b>
              <span>앱 전체에서 서버 상태 캐시를 공유할 기반을 만듭니다.</span>
            </li>
            <li>
              <b>useQuery로 조회 상태 분기</b>
              <span>isPending·isError·data에 따라 화면을 안전하게 나눕니다.</span>
            </li>
            <li>
              <b>queryKey와 refetch</b>
              <span>요청을 식별하고, 필요할 때만 서버에서 최신 값을 가져옵니다.</span>
            </li>
          </ol>
          <pre>{`const taskQuery = useTaskQuery();`}</pre>
        </aside>
      </section>

      <section className="cache-note">
        <p className="lesson-label">CACHE OBSERVATION</p>
        <h2>현재 Query 상태</h2>
        <div className="cache-values">
          <span>
            <b>status</b>
            {taskQuery.status}
          </span>
          <span>
            <b>fetchStatus</b>
            {taskQuery.fetchStatus}
          </span>
          <span>
            <b>isStale</b>
            {String(taskQuery.isStale)}
          </span>
          <span>
            <b>staleTime</b>
            10초
          </span>
        </div>
      </section>
    </>
  );
}
