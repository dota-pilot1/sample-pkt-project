"use client";

import { FormEvent, useState } from "react";
import { useTaskListQuery } from "@/entities/task/model/useTaskQuery";
import {
  taskPriorities,
  taskStatuses,
  type CreateTaskInput,
  type TaskStatus,
} from "@/entities/task/model/task";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskStatusMutation,
} from "@/features/task-mutation/model/useTaskMutations";
import { formatTime } from "@/shared/lib/date/formatTime";
import Select from "@/shared/ui/select/Select";

const initialForm: CreateTaskInput = {
  title: "",
  owner: "",
  priority: "보통",
  dueDate: "2026-09-11",
  description: "",
};

type Notice = { type: "success" | "error"; message: string } | null;

export default function TaskMutationPractice() {
  const taskListQuery = useTaskListQuery(1, 10);
  const createTaskMutation = useCreateTaskMutation();
  const updateStatusMutation = useUpdateTaskStatusMutation();
  const deleteTaskMutation = useDeleteTaskMutation();
  const [form, setForm] = useState<CreateTaskInput>(initialForm);
  const [deleteCandidateId, setDeleteCandidateId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const mutationPending =
    createTaskMutation.isPending ||
    updateStatusMutation.isPending ||
    deleteTaskMutation.isPending;

  function updateForm<Key extends keyof CreateTaskInput>(
    key: Key,
    value: CreateTaskInput[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    createTaskMutation.mutate(form, {
      onSuccess: (response) => {
        // 서버 변경과 invalidate 재조회가 모두 끝난 뒤 입력값과 성공 메시지를 갱신한다.
        setForm(initialForm);
        setNotice({ type: "success", message: response.message });
      },
      onError: (error) => {
        setNotice({ type: "error", message: error.message });
      },
    });
  }

  function changeStatus(taskId: number, status: TaskStatus) {
    setNotice(null);
    updateStatusMutation.mutate(
      { taskId, status },
      {
        onSuccess: (response) => {
          setNotice({ type: "success", message: response.message });
        },
        onError: (error) => {
          setNotice({ type: "error", message: error.message });
        },
      },
    );
  }

  function confirmDelete(taskId: number) {
    setNotice(null);
    deleteTaskMutation.mutate(taskId, {
      onSuccess: (response) => {
        setDeleteCandidateId(null);
        setNotice({ type: "success", message: response.message });
      },
      onError: (error) => {
        setNotice({ type: "error", message: error.message });
      },
    });
  }

  return (
    <>
      <section className="mutation-flow" aria-label="mutation 동기화 흐름">
        <div>
          <span>01</span>
          <strong>mutationFn</strong>
          <p>POST·PATCH·DELETE 요청</p>
        </div>
        <div>
          <span>02</span>
          <strong>onSuccess</strong>
          <p>서버 변경 성공 확인</p>
        </div>
        <div>
          <span>03</span>
          <strong>invalidateQueries</strong>
          <p>관련 캐시 재조회</p>
        </div>
      </section>

      {notice && (
        <div className={`mutation-notice ${notice.type}`} role="status">
          {notice.message}
        </div>
      )}

      <div className="level-three-grid">
        <section className="mutation-panel create-panel">
          <div className="panel-heading">
            <div>
              <p className="lesson-label">CREATE MUTATION</p>
              <h2>새 작업 등록</h2>
            </div>
            <span className="method-badge">POST</span>
          </div>

          <form className="task-form" onSubmit={submitTask}>
            <label className="form-field">
              <span>작업명</span>
              <input
                required
                value={form.title}
                placeholder="예: 설비 일일 점검"
                onChange={(event) => updateForm("title", event.target.value)}
              />
            </label>
            <label className="form-field">
              <span>담당 부서</span>
              <input
                required
                value={form.owner}
                placeholder="예: 설비팀"
                onChange={(event) => updateForm("owner", event.target.value)}
              />
            </label>
            <div className="form-row">
              <label className="form-field">
                <span>우선순위</span>
                <Select
                  value={form.priority}
                  onChange={(event) =>
                    updateForm(
                      "priority",
                      event.target.value as CreateTaskInput["priority"],
                    )
                  }
                >
                  {taskPriorities.map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </Select>
              </label>
              <label className="form-field grow">
                <span>마감일</span>
                <input
                  required
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => updateForm("dueDate", event.target.value)}
                />
              </label>
            </div>
            <label className="form-field">
              <span>작업 설명</span>
              <textarea
                required
                rows={4}
                value={form.description}
                placeholder="작업 목적과 완료 조건을 입력하세요."
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
              />
            </label>
            <button
              className="submit-task-button"
              type="submit"
              disabled={mutationPending}
            >
              {createTaskMutation.isPending
                ? "등록 후 목록 동기화 중…"
                : "작업 등록"}
            </button>
          </form>
        </section>

        <section className="mutation-panel mutation-list-panel">
          <div className="panel-heading mutation-list-heading">
            <div>
              <p className="lesson-label">UPDATE · DELETE MUTATION</p>
              <div className="title-with-count">
                <h2>최근 작업</h2>
                <span>{taskListQuery.data?.totalCount ?? 0}</span>
              </div>
              <p>최근 10건의 상태를 변경하거나 작업을 삭제합니다.</p>
            </div>
            <div className="sync-state">
              <span className={mutationPending ? "active" : ""} />
              {mutationPending || taskListQuery.isFetching
                ? "캐시 동기화 중"
                : "서버와 동기화됨"}
            </div>
          </div>

          {taskListQuery.isPending ? (
            <div className="mutation-list-state" role="status">
              최근 작업을 불러오는 중입니다…
            </div>
          ) : taskListQuery.isError ? (
            <div className="mutation-list-state error" role="alert">
              <strong>작업 목록을 불러오지 못했습니다.</strong>
              <button type="button" onClick={() => taskListQuery.refetch()}>
                다시 시도
              </button>
            </div>
          ) : (
            <>
              <ul className="mutation-task-list">
                {taskListQuery.data.tasks.map((task) => {
                  const statusPending =
                    updateStatusMutation.isPending &&
                    updateStatusMutation.variables.taskId === task.id;
                  const deletePending =
                    deleteTaskMutation.isPending &&
                    deleteTaskMutation.variables === task.id;
                  const deleteCandidate = deleteCandidateId === task.id;

                  return (
                    <li key={task.id}>
                      <div className="mutation-task-main">
                        <span className="task-number">#{task.id}</span>
                        <div>
                          <strong>{task.title}</strong>
                          <small>
                            {task.owner} · {task.dueDate} · {task.priority}
                          </small>
                        </div>
                      </div>
                      <Select
                        className="status-select"
                        aria-label={`${task.title} 상태`}
                        value={task.status}
                        disabled={mutationPending}
                        onChange={(event) =>
                          changeStatus(task.id, event.target.value as TaskStatus)
                        }
                      >
                        {taskStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </Select>
                      <div className="mutation-row-actions">
                        {deleteCandidate ? (
                          <>
                            <button
                              type="button"
                              className="delete-confirm-button"
                              disabled={mutationPending}
                              onClick={() => confirmDelete(task.id)}
                            >
                              {deletePending ? "삭제 중…" : "삭제 확인"}
                            </button>
                            <button
                              type="button"
                              className="cancel-button"
                              disabled={mutationPending}
                              onClick={() => setDeleteCandidateId(null)}
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="row-delete-button"
                            disabled={mutationPending || statusPending}
                            onClick={() => setDeleteCandidateId(task.id)}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <footer className="mutation-list-footer">
                <span>
                  마지막 조회 {formatTime(taskListQuery.data.fetchedAt)}
                </span>
                <code>[&quot;tasks&quot;, &quot;list&quot;, &#123; page: 1, pageSize: 10 &#125;]</code>
              </footer>
            </>
          )}
        </section>
      </div>
    </>
  );
}
