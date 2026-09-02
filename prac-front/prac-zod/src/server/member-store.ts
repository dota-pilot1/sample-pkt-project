import type { MemberForm } from "../features/member/member-schema";

type StoredMember = MemberForm & { id: string };

const currentMemberId = "member-1";

// 학습용 시드: 수정 폼의 현재 회원과 닉네임 중복을 만들 다른 회원을 함께 둔다.
let members: StoredMember[] = [
  {
    id: currentMemberId,
    name: "테레칼",
    nickname: "테레칼",
    email: "learner@example.com",
    birthDate: "2000-07-15",
    department: "개발",
  },
  {
    id: "member-2",
    name: "코드 마스터",
    nickname: "코드마스터",
    email: "master@example.com",
    birthDate: "1998-04-21",
    department: "기획",
  },
  {
    id: "member-3",
    name: "프론트엔드",
    nickname: "frontend-dev",
    email: "frontend@example.com",
    birthDate: "1999-10-09",
    department: "디자인",
  },
];

function getCurrentMember() {
  const member = members.find(({ id }) => id === currentMemberId);
  if (!member) throw new Error("현재 회원 정보를 찾을 수 없습니다.");
  return member;
}

function toMemberForm({ id: _id, ...member }: StoredMember): MemberForm {
  return member;
}

export function readMember() {
  return toMemberForm(getCurrentMember());
}

export function updateMember(member: MemberForm) {
  members = members.map((storedMember) =>
    storedMember.id === currentMemberId
      ? { ...storedMember, ...member }
      : storedMember,
  );
  return readMember();
}

export function getNicknameAvailability(nickname: string) {
  const owner = members.find((member) => member.nickname === nickname);
  if (!owner) return "available" as const;
  return owner.id === currentMemberId
    ? ("current" as const)
    : ("taken" as const);
}
