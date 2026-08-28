import type { MemberForm } from "../features/member/member-schema";

// 학습용 Route Handler가 프로세스 안에서만 보관하는 현재 회원 정보다.
let currentMember: MemberForm = {
  name: "테레칼",
  email: "learner@example.com",
  birthDate: "2000-07-15",
  department: "개발",
};

export function readMember() {
  return currentMember;
}

export function updateMember(member: MemberForm) {
  currentMember = member;
  return currentMember;
}
