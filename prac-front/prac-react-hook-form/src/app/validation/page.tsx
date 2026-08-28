import Header from "@/src/components/Header";
import ValidationSignupForm from "@/src/components/ValidationSignupForm";

export default function ValidationPage() {
  return (
    <>
      <Header />
      <main className="page">
        <section className="hero">
          <p className="eyebrow">REACT HOOK FORM LAB</p>
          <h1>회원가입 검증 폼</h1>
          <p>메뉴 2: Zod로 입력 규칙과 비밀번호 확인을 연습합니다.</p>
        </section>
        <div className="workspace">
          <ValidationSignupForm />
        </div>
      </main>
    </>
  );
}
