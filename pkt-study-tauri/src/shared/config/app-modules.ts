import { BookOpenText, LayoutDashboard, type LucideIcon } from "lucide-react";

export type StaffViewId = "home" | "backend-playbook" | "frontend-playbook" | "react-playbook" | "uiux-playbook" | "db-playbook" | "ax-playbook" | "tdd-playbook" | "rag-playbook" | "security-playbook" | "devops-playbook" | "settings" | "profile";

export type StaffModuleDefinition = {
  id: StaffViewId;
  label: string;
  icon: LucideIcon;
  ready: boolean;
};

/** MES 개발 학습 노트의 좌측 레일 메뉴. 서버의 playbook space 코드와 1:1로 대응한다. */
export const STAFF_MODULES: StaffModuleDefinition[] = [
  { id: "home", label: "노트 홈", icon: LayoutDashboard, ready: true },
  { id: "backend-playbook", label: "백엔드 노트", icon: BookOpenText, ready: true },
  { id: "frontend-playbook", label: "프론트 노트", icon: BookOpenText, ready: true },
  { id: "react-playbook", label: "모던 리액트 스킬", icon: BookOpenText, ready: true },
  { id: "uiux-playbook", label: "리액트 컴퍼넌트 설계", icon: BookOpenText, ready: true },
  { id: "db-playbook", label: "DB 테이블 설계", icon: BookOpenText, ready: true },
  { id: "ax-playbook", label: "AI·자동화 노트", icon: BookOpenText, ready: true },
  { id: "tdd-playbook", label: "TDD 노트", icon: BookOpenText, ready: true },
  { id: "rag-playbook", label: "RAG 노트", icon: BookOpenText, ready: true },
  { id: "security-playbook", label: "보안 노트", icon: BookOpenText, ready: true },
  { id: "devops-playbook", label: "DevOps 노트", icon: BookOpenText, ready: true },
];

export const APP_PROFILE = {
  displayName: "PKT 프로젝트",
  hospitalName: "PKT 프로젝트",
} as const;
