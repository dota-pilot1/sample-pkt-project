import { Link, Outlet, useLocation } from "react-router-dom";
import { BookOpen, ClipboardList, LayoutDashboard, Settings2 } from "lucide-react";
import AppHeader from "./widgets/app-shell/AppHeader";

const navigation = [
  { to: "/", label: "대시보드", icon: LayoutDashboard },
  { to: "/lots", label: "LOT 목록", icon: ClipboardList },
  { to: "/goals", label: "학습 목표", icon: BookOpen },
  { to: "/settings", label: "설정", icon: Settings2 },
];

export default function App() {
  const location = useLocation();
  return <div className="min-h-screen bg-slate-100 text-slate-950">
    <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-slate-200 bg-white p-4 lg:block">
      <Link to="/" className="mb-8 flex items-center gap-2 px-2 text-lg font-black text-sky-700"><span className="grid size-9 place-items-center rounded-xl bg-sky-600 text-white">P</span>PKT React Practice</Link>
      <nav className="space-y-1">{navigation.map(({ to, label, icon: Icon }) => { const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to); return <Link key={to} to={to} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition ${active ? "bg-sky-50 text-sky-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"}`}><Icon className="size-4" />{label}</Link>; })}</nav>
    </aside>
    <main className="min-h-screen lg:pl-60"><AppHeader /><div className="mx-auto max-w-7xl p-5 sm:p-8"><Outlet /></div></main>
  </div>;
}
