import { ArrowRight, BookOpenText, Code2, Database, FolderKanban, LayoutDashboard, Lightbulb, Network, Server, Settings2, Workflow } from "lucide-react";
import PageHeader from "../../shared/ui/PageHeader";
import type { StaffViewId } from "../../shared/config/app-modules";

const noteSpaces: Array<{ id: StaffViewId; title: string; description: string; icon: typeof BookOpenText }> = [
  { id: "backend-playbook", title: "백엔드 노트", description: "Spring Boot, Java, API, DDD와 서버 구현 기록", icon: Server },
  { id: "frontend-playbook", title: "프론트 노트", description: "Next.js, React, FSD와 화면 구현 기록", icon: Workflow },
  { id: "react-playbook", title: "모던 리액트 스킬", description: "Hooks, 상태 관리, 렌더링 최적화와 모던 React 패턴", icon: Code2 },
  { id: "uiux-playbook", title: "리액트 컴퍼넌트 설계", description: "공통 컴포넌트와 화면 조립·사용법 설계 기록", icon: Settings2 },
  { id: "db-playbook", title: "DB 테이블 설계", description: "PostgreSQL, ERD, JPA와 데이터 모델 기록", icon: Database },
  { id: "tdd-playbook", title: "TDD 노트", description: "테스트 시나리오와 검증 결과 기록", icon: FolderKanban },
  { id: "devops-playbook", title: "DevOps 노트", description: "로컬 실행, 배포와 운영 체크리스트", icon: Network },
  { id: "ax-playbook", title: "AI·자동화 노트", description: "AI 도구와 반복 작업 자동화 실험 기록", icon: Lightbulb },
  { id: "rag-playbook", title: "RAG 노트", description: "문서 검색, 임베딩과 지식 연결 기록", icon: BookOpenText },
];

function HomeModule({ onSelect }: { onSelect: (id: StaffViewId) => void }) {
  return (
    <>
      <PageHeader>
        <LayoutDashboard className="size-4 text-brand-primary" />
        <span className="text-[14px] font-bold tracking-tight text-text-primary">홈</span>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-muted">
        <div className="mx-auto w-full max-w-6xl px-5 py-6">
          <header>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand-primary">PKT DEVELOPMENT NOTEBOOK</p>
            <h1 className="mt-2 text-[24px] font-black tracking-tight text-text-primary">PKT 프로젝트 학습 노트</h1>
            <p className="mt-2 max-w-2xl text-[13px] font-semibold leading-6 text-text-secondary">PKT 프로젝트를 구현하며 배운 업무 흐름, 설계 결정, 코드와 검증 결과를 영역별로 쌓아두는 개인 학습 공간입니다.</p>
          </header>
          <section className="mt-7">
            <div className="flex items-center justify-between gap-3"><h2 className="text-[14px] font-black text-text-primary">노트 영역</h2><span className="text-[11px] font-bold text-text-muted">서버에 저장 · 어디서나 이어서 작성</span></div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {noteSpaces.map(({ id, title, description, icon: Icon }) => (
                <button key={id} type="button" onClick={() => onSelect(id)} className="group rounded-lg border border-surface-border-soft bg-surface-raised p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand-border hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3"><span className="grid size-9 place-items-center rounded-lg bg-brand-glass text-brand-primary"><Icon className="size-4" /></span><ArrowRight className="mt-1 size-4 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-primary" /></div>
                  <p className="mt-4 text-[14px] font-black text-text-primary">{title}</p>
                  <p className="mt-1 text-[12px] font-semibold leading-5 text-text-secondary">{description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-surface-border-soft bg-surface-raised p-4">
            <div className="flex items-start gap-3"><LayoutDashboard className="mt-0.5 size-4 shrink-0 text-brand-primary" /><div><p className="text-[13px] font-black text-text-primary">추천 기록 순서</p><p className="mt-1 text-[12px] font-semibold leading-5 text-text-secondary">업무 흐름 이해 → 도메인·상태 정의 → DB 설계 → API 구현 → 화면 연동 → 검증과 회고</p></div></div>
          </section>
        </div>
      </div>
    </>
  );
}

export default HomeModule;
