import {
  Boxes,
  Database,
  GraduationCap,
  LayoutDashboard,
  LayoutGrid,
  MousePointerClick,
  Navigation,
  SquarePen,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/** 레일을 백엔드·프론트·디자인 세 구역으로 나누는 묶음. core는 구역 위의 공통 항목이다. */
export type StaffRailGroup = "core" | "backend" | "frontend" | "design";

export type StaffViewId =
  | "home"
  | "db-playbook"
  | "frontend-playbook"
  | "pkt-front-lev1"
  | "uiux-playbook"
  | "ui-nav"
  | "ui-form"
  | "ui-layout"
  | "ui-state"
  | "settings"
  | "profile";

export type StaffModuleDefinition = {
  id: StaffViewId;
  label: string;
  icon: LucideIcon;
  ready: boolean;
  group: StaffRailGroup;
};

/** 레일에 그리는 순서대로의 구역과, 구역 위에 얹는 짧은 라벨. core는 라벨을 두지 않는다. */
export const STAFF_RAIL_GROUPS: Array<{ id: StaffRailGroup; label: string | null }> = [
  { id: "core", label: null },
  { id: "backend", label: "백엔드" },
  { id: "frontend", label: "프론트" },
  { id: "design", label: "디자인" },
];

/** MES 개발 학습 노트의 좌측 레일 메뉴. 서버의 playbook space 코드와 1:1로 대응한다. */
export const STAFF_MODULES: StaffModuleDefinition[] = [
  { id: "home", label: "노트 홈", icon: LayoutDashboard, ready: true, group: "core" },

  { id: "db-playbook", label: "DB 테이블 설계", icon: Database, ready: true, group: "backend" },

  { id: "frontend-playbook", label: "프론트 노트", icon: Workflow, ready: true, group: "frontend" },
  { id: "pkt-front-lev1", label: "PKT Front Lev1", icon: GraduationCap, ready: true, group: "frontend" },

  { id: "uiux-playbook", label: "공통 컴포넌트", icon: Boxes, ready: true, group: "design" },
  { id: "ui-nav", label: "메뉴·네비게이션", icon: Navigation, ready: true, group: "design" },
  { id: "ui-form", label: "폼·유효성 검사", icon: SquarePen, ready: true, group: "design" },
  { id: "ui-layout", label: "레이아웃·페이지", icon: LayoutGrid, ready: true, group: "design" },
  { id: "ui-state", label: "인터랙션·상태", icon: MousePointerClick, ready: true, group: "design" },
];

export const APP_PROFILE = {
  displayName: "PKT 프로젝트",
  hospitalName: "PKT 프로젝트",
} as const;
