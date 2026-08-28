"use client";

import { useQuery } from "@tanstack/react-query";
import { signupApi, signupKeys } from "@/src/features/signup/api/signupApi";

export default function SignupSubmissionList() {
  const submissions = useQuery({ queryKey: signupKeys.list(), queryFn: signupApi.list });

  return (
    <section className="submissions" aria-live="polite">
      <div className="section-heading">
        <div>
          <p className="eyebrow">SQLITE + TANSTACK QUERY</p>
          <h2>저장된 가입 신청</h2>
        </div>
        <span>{submissions.data?.submissions.length ?? 0}건</span>
      </div>
      {submissions.isPending ? <p className="empty">목록을 불러오는 중입니다.</p> : null}
      {submissions.isError ? <p className="server-error">목록을 불러오지 못했습니다.</p> : null}
      {submissions.data?.submissions.length === 0 ? <p className="empty">아직 저장된 가입 신청이 없습니다.</p> : null}
      {submissions.data?.submissions.length ? (
        <ul>
          {submissions.data.submissions.map((submission) => (
            <li key={submission.id}>
              <strong>{submission.username}</strong>
              <span>{submission.email}</span>
              <small>{new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(submission.createdAt))}</small>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
