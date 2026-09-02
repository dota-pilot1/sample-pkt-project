export type MissionCategory = "navigation" | "input" | "feedback" | "data" | "layout";

export type Mission = {
  id: string;
  number: number;
  title: string;
  focus: string;
  category: MissionCategory;
  icon: "header" | "sidebar" | "button" | "input" | "select" | "check" | "tabs" | "card" | "table" | "pagination" | "dialog" | "drawer" | "toast" | "badge" | "form" | "filter" | "timeline" | "state" | "menu" | "dashboard" | "accordion" | "tree" | "panel" | "slide" | "split" | "segmented" | "popover" | "command" | "breadcrumb" | "skeleton" | "date" | "date-range" | "upload" | "editor" | "color" | "images" | "carousel" | "progress" | "stepper" | "rating" | "calendar" | "kanban" | "resize" | "splitter" | "virtual" | "infinite" | "command-menu" | "context" | "confirm" | "notifications";
};

export const missions: Mission[] = [
  { id: "header-navigation", number: 1, title: "Header & Navigation", focus: "브랜드, 전역 메뉴, 사용자 액션, 반응형 헤더", category: "navigation", icon: "header" },
  { id: "sidebar-navigation", number: 2, title: "Sidebar Navigation", focus: "메뉴 그룹, 활성 상태, 접기·펼치기", category: "navigation", icon: "sidebar" },
  { id: "button-system", number: 3, title: "Button System", focus: "Primary, secondary, destructive, icon button", category: "input", icon: "button" },
  { id: "text-input", number: 4, title: "Text Input & Search", focus: "레이블, 힌트, 검색, 클리어, 오류 상태", category: "input", icon: "input" },
  { id: "select-combobox", number: 5, title: "Select & Combobox", focus: "옵션 목록, 검색형 선택, 키보드 포커스", category: "input", icon: "select" },
  { id: "checkbox-switch", number: 6, title: "Checkbox, Radio & Switch", focus: "선택 상태, 비활성, 그룹 단위 제어", category: "input", icon: "check" },
  { id: "tabs-navigation", number: 7, title: "Tabs Navigation", focus: "탭 전환, 카운트, URL 상태 동기화", category: "navigation", icon: "tabs" },
  { id: "card-system", number: 8, title: "Card & Stat Card", focus: "요약 정보, 강조 수치, 액션 배치", category: "layout", icon: "card" },
  { id: "data-table", number: 9, title: "Data Table", focus: "정렬, 필터, 고정 컬럼, 행 액션", category: "data", icon: "table" },
  { id: "pagination", number: 10, title: "Pagination", focus: "페이지 이동, 페이지 크기, 전체 건수", category: "data", icon: "pagination" },
  { id: "modal-dialog", number: 11, title: "Modal & Dialog", focus: "확인, 취소, 포커스 트랩, 위험 액션", category: "feedback", icon: "dialog" },
  { id: "drawer-panel", number: 12, title: "Drawer & Detail Panel", focus: "상세 보기, 오버레이, 모바일 전환", category: "layout", icon: "drawer" },
  { id: "toast-alert", number: 13, title: "Toast & Alert", focus: "성공, 경고, 오류, 다시 시도 액션", category: "feedback", icon: "toast" },
  { id: "status-badge", number: 14, title: "Badge & Status", focus: "상태 컬러, 우선순위, 라벨 조합", category: "feedback", icon: "badge" },
  { id: "form-validation", number: 15, title: "Form & Validation", focus: "필드 그룹, 필수값, 서버 오류, 제출 상태", category: "input", icon: "form" },
  { id: "filter-toolbar", number: 16, title: "Filter Toolbar", focus: "기간, 다중 필터, 초기화, 저장된 검색", category: "data", icon: "filter" },
  { id: "timeline-activity", number: 17, title: "Timeline & Activity", focus: "시간순 이벤트, 담당자, 변경 이력", category: "data", icon: "timeline" },
  { id: "loading-empty-error", number: 18, title: "Loading, Empty & Error", focus: "스켈레톤, 빈 화면, 오류 복구 안내", category: "feedback", icon: "state" },
  { id: "dropdown-context-menu", number: 19, title: "Dropdown & Context Menu", focus: "추가 액션, 권한별 메뉴, 바깥 클릭 닫기", category: "navigation", icon: "menu" },
  { id: "dashboard-layout", number: 20, title: "Dashboard Composition", focus: "그리드, 위젯, 반응형 밀도, 정보 우선순위", category: "layout", icon: "dashboard" },
  { id: "accordion", number: 21, title: "Accordion", focus: "섹션 열기·닫기, 다중 패널, 키보드 탐색", category: "layout", icon: "accordion" },
  { id: "tree-menu", number: 22, title: "Tree Menu", focus: "계층 데이터, 노드 선택, 지연 로딩", category: "navigation", icon: "tree" },
  { id: "content-panel", number: 23, title: "Panel & Inspector", focus: "콘텐츠 영역, 보조 패널, 고정 헤더", category: "layout", icon: "panel" },
  { id: "slide-over", number: 24, title: "Slide-over", focus: "화면 가장자리 전환, 오버레이, 닫기 액션", category: "feedback", icon: "slide" },
  { id: "switch-control", number: 25, title: "Switch Control", focus: "즉시 반영 설정, 로딩, 권한별 비활성", category: "input", icon: "check" },
  { id: "split-tabs", number: 26, title: "Split Tabs & View", focus: "탭 분할, 좌우 패널, 리사이즈 상태", category: "layout", icon: "split" },
  { id: "segmented-control", number: 27, title: "Segmented Control", focus: "보기 전환, 단일 선택, 컴팩트 필터", category: "input", icon: "segmented" },
  { id: "popover-tooltip", number: 28, title: "Popover & Tooltip", focus: "맥락 설명, 위치 계산, hover·focus 대응", category: "feedback", icon: "popover" },
  { id: "command-palette", number: 29, title: "Command Palette", focus: "빠른 검색, 단축키, 명령 그룹", category: "navigation", icon: "command" },
  { id: "breadcrumb-skeleton", number: 30, title: "Breadcrumb & Skeleton", focus: "현재 위치, 로딩 플레이스홀더, 콘텐츠 전환", category: "feedback", icon: "skeleton" },
  { id: "date-picker", number: 31, title: "Date Picker", focus: "날짜 선택, 오늘 이동, 범위 제한", category: "input", icon: "date" },
  { id: "date-range-picker", number: 32, title: "Date Range Picker", focus: "시작·종료일, 빠른 범위, 유효성 검사", category: "input", icon: "date-range" },
  { id: "file-upload", number: 33, title: "File Upload", focus: "드래그 앤 드롭, 진행률, 파일 검증", category: "input", icon: "upload" },
  { id: "rich-text-editor", number: 34, title: "Rich Text Editor", focus: "서식 도구, 링크, 이미지, 미리보기", category: "input", icon: "editor" },
  { id: "color-picker", number: 35, title: "Color Picker", focus: "컬러 선택, 프리셋, HEX 입력", category: "input", icon: "color" },
  { id: "image-gallery", number: 36, title: "Image Gallery", focus: "썸네일, 확대 보기, 선택 상태", category: "layout", icon: "images" },
  { id: "carousel", number: 37, title: "Carousel", focus: "슬라이드 이동, 자동재생, 인디케이터", category: "layout", icon: "carousel" },
  { id: "progress-bar", number: 38, title: "Progress Bar", focus: "단계 진행, 완료율, 처리 중 상태", category: "feedback", icon: "progress" },
  { id: "stepper", number: 39, title: "Stepper", focus: "단계 이동, 완료 표시, 이전·다음", category: "navigation", icon: "stepper" },
  { id: "rating", number: 40, title: "Rating", focus: "별점, 반쪽 점수, 읽기 전용", category: "feedback", icon: "rating" },
  { id: "calendar-view", number: 41, title: "Calendar View", focus: "월·주·일 보기, 이벤트 배치", category: "data", icon: "calendar" },
  { id: "kanban-board", number: 42, title: "Kanban Board", focus: "컬럼, 카드 이동, 상태별 그룹", category: "data", icon: "kanban" },
  { id: "resizable-layout", number: 43, title: "Resizable Layout", focus: "패널 크기 조절, 최소·최대 폭, 저장", category: "layout", icon: "resize" },
  { id: "splitter", number: 44, title: "Splitter", focus: "수평·수직 분할, 키보드 리사이즈", category: "layout", icon: "splitter" },
  { id: "virtual-list", number: 45, title: "Virtual List", focus: "대량 데이터, 가상 스크롤, 행 재사용", category: "data", icon: "virtual" },
  { id: "infinite-scroll", number: 46, title: "Infinite Scroll", focus: "다음 페이지 자동 로드, 끝 상태", category: "data", icon: "infinite" },
  { id: "command-menu", number: 47, title: "Command Menu", focus: "명령 그룹, 검색, 단축키 표시", category: "navigation", icon: "command-menu" },
  { id: "context-menu", number: 48, title: "Context Menu", focus: "우클릭 메뉴, 위치 계산, 액션 그룹", category: "navigation", icon: "context" },
  { id: "confirmation-popover", number: 49, title: "Confirmation Popover", focus: "짧은 확인, 취소, 위험 액션", category: "feedback", icon: "confirm" },
  { id: "notification-center", number: 50, title: "Notification Center", focus: "알림 목록, 읽음 처리, 필터링", category: "feedback", icon: "notifications" },
];

export function findMission(id: string) {
  return missions.find((mission) => mission.id === id);
}
