"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useTaskListQuery } from "@/entities/task/model/useTaskQuery";
import { formatTime } from "@/shared/lib/date/formatTime";
import { getPaginationItems } from "@/shared/lib/pagination/getPaginationItems";
import Select from "@/shared/ui/select/Select";

const pageSizeOptions = [3, 5, 10] as const;

export default function TaskPaginationPractice() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPage = Number(searchParams.get("page") ?? "1");
  const requestedPageSize = Number(searchParams.get("size") ?? "3");
  // 잘못된 URL 값은 API 요청 전에 1페이지로 정규화한다.
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  // 페이지 크기도 서버가 허용한 선택지로 제한해 URL·queryKey·API 조건을 일치시킨다.
  const pageSize = pageSizeOptions.includes(
    requestedPageSize as (typeof pageSizeOptions)[number],
  )
    ? requestedPageSize
    : 3;
  const taskListQuery = useTaskListQuery(page, pageSize);

  useEffect(() => {
    const resolvedPage = taskListQuery.data?.page;

    // keepPreviousData가 보여주는 직전 페이지는 서버의 최종 응답이 아니므로 URL 보정에 사용하지 않는다.
    if (taskListQuery.isPlaceholderData || !resolvedPage || resolvedPage === page) {
      return;
    }

    // 서버가 범위를 벗어난 페이지를 보정하면 URL도 실제 페이지와 일치시킨다.
    router.replace(buildListUrl(resolvedPage, pageSize));
  }, [
    page,
    pathname,
    pageSize,
    router,
    taskListQuery.data?.page,
    taskListQuery.isPlaceholderData,
  ]);

  if (taskListQuery.isPending) {
    return (
      <section className="level-two-card query-state loading-state" role="status">
        <span className="spinner" />
        작업 목록을 불러오는 중입니다…
      </section>
    );
  }

  if (taskListQuery.isError) {
    return (
      <section className="level-two-card query-state error-state" role="alert">
        <strong>목록을 불러오지 못했습니다.</strong>
        <p>{taskListQuery.error.message}</p>
        <button type="button" onClick={() => taskListQuery.refetch()}>
          다시 시도
        </button>
      </section>
    );
  }

  const {
    tasks,
    pageSize: responsePageSize,
    totalPages,
    totalCount,
    fetchedAt,
  } = taskListQuery.data;
  const pageItems = getPaginationItems(page, totalPages);
  const firstItem = (page - 1) * responsePageSize + 1;
  const lastItem = Math.min(page * responsePageSize, totalCount);

  function buildListUrl(nextPage: number, nextPageSize: number) {
    const nextSearchParams = new URLSearchParams();

    // 기본값은 URL에서 생략해 /level-2를 1페이지·3개 보기의 표준 주소로 유지한다.
    if (nextPage > 1) nextSearchParams.set("page", String(nextPage));
    if (nextPageSize !== 3) {
      nextSearchParams.set("size", String(nextPageSize));
    }

    const queryString = nextSearchParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }

  function moveToPage(nextPage: number) {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);

    if (safePage === page) return;

    // URL을 페이지 상태의 단일 기준으로 두면 새로고침·공유·뒤로가기도 같은 목록을 복원한다.
    router.push(buildListUrl(safePage, pageSize));
  }

  function changePageSize(nextPageSize: number) {
    // 페이지 크기가 바뀌면 기존 page가 범위를 벗어날 수 있으므로 1페이지에서 다시 조회한다.
    router.push(buildListUrl(1, nextPageSize));
  }

  return (
    <section className="level-two-card">
      <div className="list-heading">
        <div>
          <div className="title-with-count">
            <h2>작업 목록</h2>
            <span>{totalCount}</span>
          </div>
          <p>
            생산 현장의 작업 지시와 처리 상태를 확인합니다.
          </p>
        </div>
        <div className="list-actions">
          {taskListQuery.isPlaceholderData && (
            <span className="loading-chip">{page}페이지 불러오는 중</span>
          )}
          <button
            type="button"
            className="secondary refresh-button"
            disabled={taskListQuery.isFetching}
            onClick={() => taskListQuery.refetch()}
          >
            ↻ 새로고침
          </button>
        </div>
      </div>

      <div className="task-table">
        <div className="task-table-head" role="row">
          <span>작업</span>
          <span>담당 부서</span>
          <span>마감일</span>
          <span>우선순위</span>
          <span>상태</span>
          <span aria-hidden="true" />
        </div>
        <ul className="task-table-body">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link
                href={`/level-2/tasks/${task.id}?fromPage=${page}&fromSize=${pageSize}`}
                className="task-table-row"
              >
                <span className="task-main-cell">
                  <span className="task-number">#{task.id}</span>
                  <span>
                    <strong>{task.title}</strong>
                    <small>{task.description}</small>
                  </span>
                </span>
                <span className="table-value" data-label="담당 부서">
                  {task.owner}
                </span>
                <span className="table-value" data-label="마감일">
                  {task.dueDate}
                </span>
                <span data-label="우선순위">
                  <span className="priority-badge" data-priority={task.priority}>
                    {task.priority}
                  </span>
                </span>
                <span data-label="상태">
                  <span className="status-badge" data-status={task.status}>
                    {task.status}
                  </span>
                </span>
                <span className="detail-action">상세 보기 →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="list-footer">
        <div className="result-summary">
          <strong>{firstItem}–{lastItem}</strong> / 총 {totalCount}개
          <span>마지막 조회 {formatTime(fetchedAt)}</span>
        </div>
        <div className="footer-controls">
          <label className="page-size-field">
            <span>페이지당</span>
            <Select
              aria-label="페이지당 작업 수"
              value={pageSize}
              onChange={(event) => changePageSize(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}개
                </option>
              ))}
            </Select>
          </label>
          <nav className="pagination-bar" aria-label="작업 목록 페이지">
            <button
              type="button"
              className="page-edge-button"
              aria-label="첫 페이지"
              disabled={page === 1}
              onClick={() => moveToPage(1)}
            >
              «
            </button>
            <button
              type="button"
              className="page-edge-button"
              aria-label="이전 페이지"
              disabled={page === 1}
              onClick={() => moveToPage(page - 1)}
            >
              ‹
            </button>
            <div className="page-numbers">
              {pageItems.map((item, index) =>
                item === "ellipsis" ? (
                  <span key={`ellipsis-${index}`} className="page-ellipsis">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={`page-button ${item === page ? "active" : ""}`}
                    aria-label={`${item}페이지`}
                    aria-current={item === page ? "page" : undefined}
                    disabled={item === page}
                    onClick={() => moveToPage(item)}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
            <button
              type="button"
              className="page-edge-button"
              aria-label="다음 페이지"
              disabled={page === totalPages}
              onClick={() => moveToPage(page + 1)}
            >
              ›
            </button>
            <button
              type="button"
              className="page-edge-button"
              aria-label="마지막 페이지"
              disabled={page === totalPages}
              onClick={() => moveToPage(totalPages)}
            >
              »
            </button>
          </nav>
        </div>
      </div>
    </section>
  );
}
