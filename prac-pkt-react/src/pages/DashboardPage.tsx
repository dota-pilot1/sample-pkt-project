import { ArrowRight, Layers3, ListChecks, Target } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const cards = [
    { label: "학습 목표", value: "30개", Icon: Target, to: "/goals" },
    { label: "현재 실습", value: "LOT 목록", Icon: Layers3, to: "/lots" },
    { label: "완료 기록", value: "0개", Icon: ListChecks, to: "/goals" },
  ];

  return <div className="space-y-6">
    <header><p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">PKT PRACTICE LAB</p><h1 className="mt-2 text-3xl font-black tracking-tight">프론트 실습 대시보드</h1><p className="mt-2 text-sm font-semibold text-slate-500">LOT 업무 화면을 작은 과제로 쪼개며 React 기본기를 쌓습니다.</p></header>
    <div className="grid gap-4 md:grid-cols-3">{cards.map(({ label, value, Icon, to }) => <Link key={label} to={to} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-sm"><Icon className="size-5 text-sky-600" /><p className="mt-5 text-sm font-bold text-slate-500">{label}</p><p className="mt-1 text-xl font-black">{value}</p></Link>)}</div>
    <Link to="/lots" className="flex items-center justify-between rounded-2xl bg-sky-700 p-6 text-white"><div><p className="text-sm font-bold text-sky-100">첫 번째 실습</p><p className="mt-1 text-xl font-black">LOT 목록 테이블 만들기</p></div><ArrowRight className="size-5" /></Link>
  </div>;
}
