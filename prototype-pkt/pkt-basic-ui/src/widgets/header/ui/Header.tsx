"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BadgeCheck, BarChart3, Bell, BookOpen, Boxes, Calculator, CalendarDays, CalendarClock, ChartGantt, ChevronDown, CircleAlert, CircleCheck, ClipboardCheck, ClipboardList, Columns2, Columns3, Command, Database, FileSliders, FlaskConical, FormInput, Grid3X3, History, Images, Infinity, LayoutDashboard, LayoutGrid, Layers3, List, ListChecks, ListTree, LoaderCircle, LogIn, LogOut, Menu, MessageCircle, MousePointer2, Package, PackageSearch, PanelLeft, PanelRight, PanelRightOpen, PanelTop, Pencil, Settings, ShieldCheck, SlidersHorizontal, SquareMenu, Star, TableProperties, Tag, TextCursorInput, ToggleLeft, Upload, Users, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth, authActions } from "@/entities/user/model/authStore";
import { LanguageSelect } from "@/shared/ui/LanguageSelect";
import { ThemeSwitcher } from "@/shared/ui/theme/ThemeSwitcher";
import { missions } from "@/features/missions";

const icons: Record<string, LucideIcon> = { BadgeCheck, BarChart3, Bell, BookOpen, Boxes, Calculator, CalendarDays, CalendarClock, ChartGantt, CircleAlert, CircleCheck, ClipboardList, PackageSearch, FlaskConical, FileSliders, ClipboardCheck, History, Images, Infinity, Database, LayoutDashboard, LayoutGrid, Layers3, List, ListChecks, ListTree, LoaderCircle, Menu, MessageCircle, MousePointer2, Package, PanelLeft, PanelRight, PanelRightOpen, PanelTop, Pencil, Settings, ShieldCheck, SlidersHorizontal, SquareMenu, Star, TableProperties, Tag, TextCursorInput, ToggleLeft, FormInput, Columns2, Columns3, Command, Grid3X3, Upload, Users, Workflow };

export function Header() {
  const { status, user } = useAuth(); const router = useRouter(); const pathname = usePathname();
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const menuRef = useRef<HTMLElement>(null);
  const groups = makeGroups();
  useEffect(() => {
    const closeIfOutside = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpenGroupId(null);
    };
    document.addEventListener("pointerdown", closeIfOutside);
    return () => document.removeEventListener("pointerdown", closeIfOutside);
  }, []);
  const handleLogout = async () => { await authActions.logout(); router.replace("/login"); };
  return <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm"><div className="mx-auto flex h-14 max-w-[96rem] items-center justify-between gap-3 px-4 sm:px-6">
    <nav ref={menuRef} className="flex min-w-0 items-center gap-1"><Link href="/" className="mr-2 shrink-0 text-sm font-semibold tracking-tight hover:opacity-80">PKT Basic UI</Link>{groups.map((group) => <MenuGroup key={group.id} group={group} pathname={pathname} open={openGroupId === group.id} onToggle={() => setOpenGroupId((current) => current === group.id ? null : group.id)} onClose={() => setOpenGroupId(null)} />)}</nav>
    <div className="flex shrink-0 items-center gap-2"><LanguageSelect /><ThemeSwitcher />{status === "authenticated" ? <><span className="hidden max-w-40 truncate text-sm text-muted-foreground sm:block">{user?.username ?? user?.email}</span><button type="button" onClick={handleLogout} className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-accent"><LogOut className="h-4 w-4"/><span className="hidden sm:inline">로그아웃</span></button></> : status === "anonymous" ? <Link href="/login" className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"><LogIn className="h-4 w-4"/><span className="hidden sm:inline">로그인</span></Link> : null}</div>
  </div></header>;
}

type UiMenu = { id: string; label: string; path: string; icon: string };
type MenuGroupType = { id: string; label: string; icon: string; children: UiMenu[] };

function makeGroups(): MenuGroupType[] {
  const categoryOrder = ["navigation", "input", "feedback", "data", "layout"] as const;
  const categoryLabels = { navigation: "Navigation", input: "Input", feedback: "Feedback", data: "Data", layout: "Layout" } as const;
  return categoryOrder.map((category) => ({
    id: `ui-${category}`,
    label: categoryLabels[category],
    icon: category === "navigation" ? "PanelTop" : category === "input" ? "FormInput" : category === "feedback" ? "Bell" : category === "data" ? "TableProperties" : "LayoutDashboard",
    children: missions.filter((mission) => mission.category === category).map((mission) => ({ id: mission.id, label: `${String(mission.number).padStart(2, "0")} · ${mission.title}`, path: `/missions/${mission.id}`, icon: mission.icon })),
  }));
}
function MenuGroup({ group, pathname, open, onToggle, onClose }: { group: MenuGroupType; pathname: string; open: boolean; onToggle: () => void; onClose: () => void }) {
  const Icon = icons[group.icon] ?? Database; const active = group.children.some((child) => pathname === child.path || pathname.startsWith(`${child.path}/`));
  return <div className="relative shrink-0"><button type="button" aria-expanded={open} onClick={onToggle} className={`flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm transition-colors ${active ? "bg-accent font-semibold text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}><Icon className="h-4 w-4"/>{group.label}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}/></button>{open && <div className="absolute left-0 top-[calc(100%+.45rem)] z-50 min-w-64 rounded-lg border border-border bg-popover p-1.5 shadow-lg">{group.children.map((child) => { const ChildIcon = icons[child.icon] ?? Database; const current = child.path === pathname; return <Link key={child.id} href={child.path} onClick={onClose} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${current ? "bg-accent font-semibold" : "hover:bg-accent"}`}><ChildIcon className="h-4 w-4 text-muted-foreground"/>{child.label}</Link>; })}</div>}</div>;
}
