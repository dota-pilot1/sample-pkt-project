"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "../../components/ui/Select";
import {
  memberSchema,
  type MemberForm,
} from "../../features/member/member-schema";

type MemberResponse = { member: MemberForm };
type ApiErrorBody = {
  message?: string;
  fieldErrors?: Partial<Record<keyof MemberForm, string[]>>;
};
type NicknameAvailability = {
  status: "current" | "available" | "taken";
  message: string;
};

class MemberApiError extends Error {
  // Route Handler가 보낸 필드별 오류를 UI까지 함께 전달하는 오류 타입이다.
  constructor(
    message: string,
    readonly fieldErrors: ApiErrorBody["fieldErrors"],
  ) {
    super(message);
  }
}

async function fetchMember(): Promise<MemberForm> {
  // useQuery가 호출하는 조회 함수: 화면은 HTTP 세부사항 대신 회원 데이터만 받는다.
  const response = await fetch("/api/members/me");
  if (!response.ok) throw new Error("회원 정보를 불러오지 못했습니다.");
  return ((await response.json()) as MemberResponse).member;
}

async function patchMember(member: MemberForm): Promise<MemberForm> {
  // useMutation이 호출하는 저장 함수: 실패 응답도 본문을 읽어 필드 오류를 보존한다.
  const response = await fetch("/api/members/me", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(member),
  });
  const body = (await response.json()) as MemberResponse & ApiErrorBody;
  if (!response.ok)
    throw new MemberApiError(
      body.message ?? "회원 정보를 저장하지 못했습니다.",
      body.fieldErrors,
    );
  return body.member;
}

async function checkNickname(nickname: string): Promise<NicknameAvailability> {
  const response = await fetch(
    `/api/members/nickname-availability?nickname=${encodeURIComponent(nickname)}`,
  );
  const body = (await response.json()) as NicknameAvailability & ApiErrorBody;
  if (!response.ok)
    throw new Error(body.message ?? "닉네임을 확인하지 못했습니다.");
  return body;
}

const emptyMember: MemberForm = {
  name: "",
  nickname: "",
  email: "",
  birthDate: "",
  department: "개발",
};

export default function Level3Page() {
  const queryClient = useQueryClient();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  // 학습 포인트 1: Query key가 같으면 조회 결과를 캐시하고 여러 화면에서 재사용할 수 있다.
  const memberQuery = useQuery({
    queryKey: ["member", "me"],
    queryFn: fetchMember,
  });
  const {
    register,
    handleSubmit,
    reset,
    setError,
    getValues,
    watch,
    formState: { errors, dirtyFields, isDirty },
  } = useForm<MemberForm>({
    defaultValues: emptyMember,
    mode: "onTouched",
    resolver: zodResolver(memberSchema),
  });
  const nickname = watch("nickname");

  // 학습 포인트 2: Query로 받은 서버 데이터가 도착하면 수정 폼의 기준값을 reset으로 설정한다.
  useEffect(() => {
    if (memberQuery.data) reset(memberQuery.data);
  }, [memberQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: patchMember,
    onSuccess: (member) => {
      // 학습 포인트 3: 저장 성공값을 캐시와 폼에 동시에 반영해 이전 데이터가 남지 않게 한다.
      queryClient.setQueryData(["member", "me"], member);
      reset(member);
      setSavedAt(
        new Intl.DateTimeFormat("ko-KR", { timeStyle: "short" }).format(
          new Date(),
        ),
      );
    },
  });

  const [checkedNickname, setCheckedNickname] = useState<string | null>(null);
  const nicknameCheckMutation = useMutation({
    // 학습 포인트 4: 저장 전 중복 확인은 UX용 GET 요청으로 분리할 수 있다.
    mutationFn: checkNickname,
    onSuccess: (_result, checkedValue) => setCheckedNickname(checkedValue),
  });
  // 확인한 뒤 닉네임을 다시 입력하면 이전 결과를 숨겨 오래된 안내를 방지한다.
  const nicknameCheckResult =
    checkedNickname === nickname ? nicknameCheckMutation.data : undefined;

  const changedFields = Object.keys(dirtyFields);

  async function saveMember(values: MemberForm) {
    setSavedAt(null);
    try {
      // 학습 포인트 5: 중복 확인을 했어도 저장 시 서버에 다시 최종 검증받아야 한다.
      await updateMutation.mutateAsync(values);
    } catch (error) {
      if (error instanceof MemberApiError && error.fieldErrors) {
        // 학습 포인트 6: 서버 fieldErrors를 React Hook Form의 각 필드 오류로 옮긴다.
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          const message = messages?.[0];
          if (message)
            setError(field as keyof MemberForm, { type: "server", message });
        }
      }
    }
  }

  async function checkNicknameAvailability() {
    setCheckedNickname(null);
    try {
      await nicknameCheckMutation.mutateAsync(getValues("nickname"));
    } catch {
      // 오류 메시지는 nicknameCheckMutation.isError 분기에서 입력칸 아래에 표시한다.
    }
  }

  if (memberQuery.isPending)
    return (
      <main className="shell">
        <section className="level-placeholder">
          <p className="eyebrow">LEVEL 3 · TANSTACK QUERY</p>
          <h1>회원 정보를 불러오는 중</h1>
          <p>Route Handler의 현재 회원 정보를 수정 폼에 연결하고 있습니다.</p>
        </section>
      </main>
    );
  if (memberQuery.isError)
    return (
      <main className="shell">
        <section className="level-placeholder">
          <p className="eyebrow">LEVEL 3 · QUERY ERROR</p>
          <h1>정보를 불러오지 못했습니다.</h1>
          <button type="button" onClick={() => memberQuery.refetch()}>
            다시 시도
          </button>
        </section>
      </main>
    );

  return (
    <main className="shell">
      <header className="hero compact-hero">
        <p className="eyebrow">FRONTEND PRACTICE · LEVEL 3</p>
        <h1>풀스택 정보 수정 폼</h1>
        <p>
          TanStack Query로 조회하고, Route Handler가 Zod 검증한 결과를 다시 폼
          오류로 연결합니다.
        </p>
      </header>

      <section className="edit-grid">
        <article className="form-card">
          <div className="card-title">
            <span>01</span>
            <div>
              <h2>내 정보 수정</h2>
              <p>GET으로 불러온 현재 정보를 바꾸고 PATCH로 저장합니다.</p>
            </div>
          </div>
          <form className="form" onSubmit={handleSubmit(saveMember)} noValidate>
            <fieldset className="form-section">
              <legend>
                <span className="lesson-tag">TODO 4</span> 조회·수정 API 연결
              </legend>
              <div className="form-row">
                <label>
                  이름
                  <input
                    aria-invalid={Boolean(errors.name)}
                    {...register("name")}
                  />
                  {errors.name && (
                    <span className="field-error">{errors.name.message}</span>
                  )}
                </label>
                <label>
                  닉네임
                  <span className="input-with-action">
                    <input
                      aria-invalid={Boolean(errors.nickname)}
                      {...register("nickname")}
                    />
                    <button
                      type="button"
                      className="nickname-check-button"
                      onClick={checkNicknameAvailability}
                      disabled={nicknameCheckMutation.isPending}
                    >
                      {nicknameCheckMutation.isPending
                        ? "확인 중"
                        : "중복 확인"}
                    </button>
                  </span>
                  {errors.nickname && (
                    <span className="field-error">
                      {errors.nickname.message}
                    </span>
                  )}
                  {nicknameCheckResult && (
                    <span
                      className={
                        nicknameCheckResult.status === "available"
                          ? "nickname-available"
                          : nicknameCheckResult.status === "current"
                            ? "nickname-current"
                            : "nickname-taken"
                      }
                      aria-live="polite"
                    >
                      {nicknameCheckResult.message}
                    </span>
                  )}
                  {nicknameCheckMutation.isError && (
                    <span className="field-error">
                      {nicknameCheckMutation.error.message}
                    </span>
                  )}
                </label>
              </div>
              <label>
                이메일
                <input
                  type="email"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                {errors.email && (
                  <span className="field-error">{errors.email.message}</span>
                )}
              </label>
              <div className="form-row">
                <label>
                  생년월일
                  <input
                    type="date"
                    aria-invalid={Boolean(errors.birthDate)}
                    {...register("birthDate")}
                  />
                  {errors.birthDate && (
                    <span className="field-error">
                      {errors.birthDate.message}
                    </span>
                  )}
                </label>
                <label>
                  부서
                  <Select
                    aria-invalid={Boolean(errors.department)}
                    {...register("department")}
                  >
                    <option value="개발">개발</option>
                    <option value="기획">기획</option>
                    <option value="디자인">디자인</option>
                  </Select>
                  {errors.department && (
                    <span className="field-error">
                      {errors.department.message}
                    </span>
                  )}
                </label>
              </div>
            </fieldset>
            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => reset(memberQuery.data)}
                disabled={!isDirty}
              >
                원래 정보로 되돌리기
              </button>
              <button
                type="submit"
                disabled={!isDirty || updateMutation.isPending}
              >
                {updateMutation.isPending ? "저장 중..." : "변경 내용 저장"}
              </button>
            </div>
            {updateMutation.isError && (
              <p className="mutation-error">{updateMutation.error.message}</p>
            )}
          </form>
        </article>

        <aside className="level-two-side">
          <section className="flow-card">
            <p className="lesson-label">FULLSTACK FLOW</p>
            <ol>
              <li>
                <b>useQuery</b>
                <span>
                  GET /api/members/me 응답을 가져와 폼 기준값으로 설정합니다.
                </span>
              </li>
              <li>
                <b>useMutation</b>
                <span>
                  PATCH 요청을 보내고 성공한 회원 정보를 Query 캐시에
                  반영합니다.
                </span>
              </li>
              <li>
                <b>Route Handler</b>
                <span>
                  닉네임 중복 확인과 저장 시의 최종 검증을 서버가 담당합니다.
                </span>
              </li>
            </ol>
          </section>
          <section className="nickname-example-card">
            <p className="lesson-label">NICKNAME TEST</p>
            <h2>중복 확인 예시</h2>
            <p>닉네임 칸에 입력한 뒤 중복 확인을 눌러보세요.</p>
            <ul className="nickname-examples">
              <li className="nickname-example-taken">
                <b>코드마스터</b>
                <span>이미 사용 중</span>
              </li>
              <li className="nickname-example-taken">
                <b>frontend-dev</b>
                <span>이미 사용 중</span>
              </li>
              <li className="nickname-example-available">
                <b>새닉네임</b>
                <span>사용 가능</span>
              </li>
            </ul>
          </section>
          <section className="result-panel" aria-live="polite">
            <p className="lesson-label">CHANGE SUMMARY</p>
            <h2>변경 상태</h2>
            {isDirty ? (
              <p>
                <strong>{changedFields.join(", ")}</strong> 필드를 수정했습니다.
              </p>
            ) : (
              <p>서버의 최신 정보와 같은 상태입니다.</p>
            )}
            {savedAt && (
              <p className="saved-note">{savedAt}에 서버에 저장했습니다.</p>
            )}
            <pre>{JSON.stringify(memberQuery.data, null, 2)}</pre>
            <p className="memory-note">
              학습용 서버 데이터는 개발 서버를 다시 시작하면 초기값으로
              돌아갑니다.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
