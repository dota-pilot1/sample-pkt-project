"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  Bell,
  CalendarDays,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  CircleCheck,
  Columns3,
  Command,
  FileText,
  FormInput,
  Grid3X3,
  LayoutDashboard,
  List,
  ListChecks,
  ListTree,
  LoaderCircle,
  Menu,
  PanelLeft,
  PanelRight,
  PanelRightOpen,
  PanelTop,
  Columns2,
  MessageCircle,
  MousePointer2,
  Pencil,
  SquareMenu,
  SlidersHorizontal,
  Star,
  TableProperties,
  Tag,
  TextCursorInput,
  ToggleLeft,
  Upload,
  Infinity,
  Images,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { missions } from "@/features/missions";
import type { MissionCategory } from "@/features/missions/model/missionCatalog";

const iconByType: Record<(typeof missions)[number]["icon"], LucideIcon> = {
  header: PanelTop,
  sidebar: PanelLeft,
  button: Command,
  input: TextCursorInput,
  select: ChevronsUpDown,
  check: ToggleLeft,
  tabs: Columns3,
  card: FileText,
  table: TableProperties,
  pagination: Grid3X3,
  dialog: CircleAlert,
  drawer: PanelLeft,
  toast: Bell,
  badge: Tag,
  form: FormInput,
  filter: SlidersHorizontal,
  timeline: CalendarDays,
  state: CircleCheck,
  menu: Menu,
  dashboard: LayoutDashboard,
  accordion: SquareMenu,
  tree: ListTree,
  panel: PanelRight,
  slide: PanelRightOpen,
  split: Columns2,
  segmented: MousePointer2,
  popover: MessageCircle,
  command: Command,
  breadcrumb: LoaderCircle,
  skeleton: LoaderCircle,
  date: CalendarDays,
  "date-range": CalendarDays,
  upload: Upload,
  editor: Pencil,
  color: SlidersHorizontal,
  images: Images,
  carousel: Images,
  progress: Activity,
  stepper: ListChecks,
  rating: Star,
  calendar: CalendarDays,
  kanban: Columns3,
  resize: Columns2,
  splitter: PanelRight,
  virtual: List,
  infinite: Infinity,
  "command-menu": Command,
  context: Menu,
  confirm: CircleCheck,
  notifications: Bell,
};

const categoryLabels = {
  navigation: "Navigation",
  input: "Input",
  feedback: "Feedback",
  data: "Data",
  layout: "Layout",
} as const;

const categoryTabs: Array<{ id: "all" | MissionCategory; label: string }> = [
  { id: "all", label: "전체" },
  { id: "navigation", label: "Navigation" },
  { id: "input", label: "Input" },
  { id: "feedback", label: "Feedback" },
  { id: "data", label: "Data" },
  { id: "layout", label: "Layout" },
];

export default function MainPage() {
  const [activeCategory, setActiveCategory] = useState<"all" | MissionCategory>("all");
  const filteredMissions = activeCategory === "all" ? missions : missions.filter((mission) => mission.category === activeCategory);

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-muted/20 px-4 py-8 sm:px-8 lg:px-10">
        <section className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-primary">PKT UI LAB · FRONTEND PRACTICE</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">50가지 기본 UI</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">헤더 메뉴부터 대시보드까지, 제품 화면을 만들 때 반복해서 쓰는 기본 UI를 한 장씩 구현합니다.</p>
            </div>
            <span className="w-fit rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">01 / 50 시작 가능</span>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-2" aria-label="UI 카테고리">
            {categoryTabs.map((tab) => {
              const count = tab.id === "all" ? missions.length : missions.filter((mission) => mission.category === tab.id).length;
              const selected = activeCategory === tab.id;
              return <button key={tab.id} type="button" aria-pressed={selected} onClick={() => setActiveCategory(tab.id)} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}><span>{tab.label}</span><span className={selected ? "text-primary-foreground/70" : "text-muted-foreground/70"}>{String(count).padStart(2, "0")}</span></button>;
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {filteredMissions.map((mission) => {
              const Icon = iconByType[mission.icon];
              const isFirst = mission.number === 1;
              return (
                <Link
                  key={mission.id}
                  href={`/missions/${mission.id}`}
                  className="group relative flex min-h-52 flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`grid size-10 place-items-center rounded-lg ${isFirst ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}><Icon className="h-5 w-5" /></span>
                    <span className="text-xs font-bold tabular-nums text-muted-foreground">{String(mission.number).padStart(2, "0")}</span>
                  </div>
                  <div className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"><span>UI {String(mission.number).padStart(2, "0")}</span><span className="size-1 rounded-full bg-border" /><span>{categoryLabels[mission.category]}</span></div>
                  <h2 className="mt-2 text-base font-bold leading-6 text-foreground">{mission.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{mission.focus}</p>
                  <span className={`mt-auto inline-flex items-center gap-1 pt-5 text-xs font-semibold ${isFirst ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>{isFirst ? "첫 구현 대상" : "실습 페이지 열기"}<ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                </Link>
              );
            })}
          </div>
          {filteredMissions.length === 0 && <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">해당 카테고리에 등록된 UI가 없습니다.</div>}
        </section>
    </main>
  );
}
