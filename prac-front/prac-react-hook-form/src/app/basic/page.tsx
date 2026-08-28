import BasicSignupForm from "@/src/components/BasicSignupForm";
import Header from "@/src/components/Header";

export default function BasicPage() {
  return (
    <>
      <Header />
      <main className="page">
        <section className="hero">
          <p className="eyebrow">REACT HOOK FORM LAB</p>
          <h1>회원가입 기본 폼</h1>
          <p>레벨 1: input 연결과 제출 흐름만 연습합니다.</p>
        </section>
        <div className="single-workspace"><BasicSignupForm /></div>
      </main>
    </>
  );
}
