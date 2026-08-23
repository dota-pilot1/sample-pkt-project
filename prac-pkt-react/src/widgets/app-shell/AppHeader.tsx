import { LogOut } from "lucide-react";
import { useAuth } from "../../features/auth/model/auth.store";

export default function AppHeader() {
  const { user, logout } = useAuth();
  return <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
    <div><p className="text-xs font-black uppercase tracking-[0.16em] text-sky-600">MES PRACTICE</p><p className="text-sm font-black text-slate-800">PKT Front Lab</p></div>
    <div className="flex items-center gap-4"><div className="text-right"><p className="text-sm font-black text-slate-800">{user?.username}</p><p className="text-xs font-semibold text-slate-500">{user?.email}</p></div><button type="button" onClick={() => void logout()} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"><LogOut className="size-4" />로그아웃</button></div>
  </header>;
}
