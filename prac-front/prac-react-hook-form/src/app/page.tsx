import Header from "@/src/components/Header";
import SignupSubmissionList from "@/src/features/signup/ui/SignupSubmissionList";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="page">
        <section className="hero">
          <p className="eyebrow">REACT HOOK FORM LAB</p>
          <h1>회원가입 폼 실험실</h1>
          <p>레벨 3에서 저장한 가입 신청을 확인하는 메인 페이지입니다.</p>
        </section>
        <section className="home-grid">
          <article className="card overview-card">
            <p className="eyebrow">LEARNING FLOW</p>
            <h2>폼을 완성하는 3단계</h2>
            <ol className="level-list">
              <li><strong>레벨 1</strong><span>register와 handleSubmit</span></li>
              <li><strong>레벨 2</strong><span>Zod 검증과 즉시 안내</span></li>
              <li><strong>레벨 3</strong><span>API, SQLite, TanStack Query</span></li>
            </ol>
          </article>
          <SignupSubmissionList />
        </section>
      </main>
    </>
  );
}
