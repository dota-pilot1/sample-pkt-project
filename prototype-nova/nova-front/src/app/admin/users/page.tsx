"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UsersRound } from "lucide-react";
import { AdminShell } from "@/features/admin/ui/admin-shell";
import {
  userManagementApi,
  type ManagedUser,
  type UserSearch,
} from "@/features/user-management/api";
import { UserAccessDrawer } from "@/features/user-management/ui/user-access-drawer";
import { ApiError } from "@/shared/api/client";
import { Pagination } from "@/shared/ui/pagination";
import { SearchInput } from "@/shared/ui/search-input";

// 화면에서 바로 페이지 이동을 확인할 수 있도록 한 번에 5명씩 보여 준다.
const pageSize = 5;
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(
    new Date(value),
  );

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [keywordInput, setKeywordInput] = useState("");
  const [search, setSearch] = useState<UserSearch>({ page: 1, size: pageSize });
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const users = useQuery({
    queryKey: ["admin-users", search],
    queryFn: () => userManagementApi.findPage(search),
  });
  const changeActive = useMutation({
    mutationFn: ({ userId, active }: { userId: number; active: boolean }) =>
      userManagementApi.changeActive(userId, active),
    onSuccess: (_, variables) => {
      setMessage(variables.active ? "계정을 켰습니다." : "계정을 껐습니다.");
      // 상태 변경 직후 목록을 다시 받아 화면과 서버 값을 같게 유지한다.
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) =>
      setMessage(
        error instanceof ApiError
          ? error.message
          : "계정 상태를 바꾸지 못했습니다.",
      ),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch((current) => ({ ...current, keyword: keywordInput, page: 1 }));
  }

  return (
    <AdminShell activeSection="users" title="유저 관리">
      <div className="page-heading">
        <h1>유저 관리</h1>
        <p>가입한 사용자를 찾고, 계정을 켜거나 끌 수 있습니다.</p>
      </div>
      <section className="user-management" aria-labelledby="user-list-title">
        <div className="user-management-header">
          <div>
            <h2 id="user-list-title">사용자 목록</h2>
            <p>총 {users.data?.totalElements ?? 0}명</p>
          </div>
        </div>
        <form className="user-filters" onSubmit={submit}>
          <SearchInput
            label="이름 또는 이메일 검색"
            value={keywordInput}
            onChange={setKeywordInput}
            placeholder="이름 또는 이메일 검색"
            showEnterHint
          />
          <label className="user-status-filter">
            <span>상태</span>
            <select
              value={
                search.active === undefined ? "all" : String(search.active)
              }
              onChange={(event) =>
                setSearch((current) => ({
                  ...current,
                  active:
                    event.target.value === "all"
                      ? undefined
                      : event.target.value === "true",
                  page: 1,
                }))
              }
            >
              <option value="all">전체</option>
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>
          </label>
          <button type="submit">검색</button>
        </form>
        {message && (
          <p className="user-message" role="status">
            {message}
          </p>
        )}
        {users.isPending ? (
          <p className="user-state">사용자 목록을 불러오는 중입니다.</p>
        ) : users.isError ? (
          <p className="user-state user-error">
            사용자 목록을 불러오지 못했습니다.
          </p>
        ) : (
          <>
            <div
              className="user-table-scroll"
              role="region"
              aria-label="사용자 목록"
              tabIndex={0}
            >
              <table className="user-table">
                <thead>
                  <tr>
                    <th>사용자</th>
                    <th>이메일</th>
                    <th>역할</th>
                    <th>가입일</th>
                    <th>상태</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data?.items.map((user) => {
                    // 이전 목록 응답은 roles 필드를 보내지 않으므로 상세 기능 배포 중에도 목록이 깨지지 않게 한다.
                    const roles = user.roles ?? [];

                    return (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.displayName}</strong>
                        <small>#{user.id}</small>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        {roles.length ? (
                          <div className="user-role-summary">
                            {roles.slice(0, 2).map((role) => (
                              <span key={role.roleCode}>{role.name}</span>
                            ))}
                            {roles.length > 2 && (
                              <small>+{roles.length - 2}</small>
                            )}
                          </div>
                        ) : (
                          <span className="user-role-empty">역할 없음</span>
                        )}
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <span
                          className={`user-status ${user.active ? "is-active" : "is-inactive"}`}
                        >
                          {user.active ? "활성" : "비활성"}
                        </span>
                      </td>
                      <td>
                        <div className="user-actions">
                          <button
                            className="user-detail-button"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDrawerOpen(true);
                            }}
                            type="button"
                          >
                            상세 보기
                          </button>
                          <button
                            className="user-toggle"
                            disabled={changeActive.isPending}
                            onClick={() =>
                              changeActive.mutate({
                                userId: user.id,
                                active: !user.active,
                              })
                            }
                            type="button"
                          >
                            {user.active ? "계정 끄기" : "계정 켜기"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {users.data?.items.length === 0 && (
              <div className="user-empty">
                <UsersRound aria-hidden="true" size={28} />
                <p>조건에 맞는 사용자가 없습니다.</p>
              </div>
            )}
            <Pagination
              currentPage={search.page ?? 1}
              totalPages={users.data?.totalPages ?? 0}
              onPageChange={(page) =>
                setSearch((current) => ({ ...current, page }))
              }
              pageSize={search.size ?? pageSize}
              pageSizeOptions={[5, 10, 20]}
              onPageSizeChange={(size) =>
                setSearch((current) => ({ ...current, size, page: 1 }))
              }
            />
          </>
        )}
      </section>
      <UserAccessDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onExited={() => setSelectedUser(null)}
        user={selectedUser}
      />
    </AdminShell>
  );
}
