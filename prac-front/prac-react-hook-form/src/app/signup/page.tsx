import Header from "@/src/components/Header";
import SignupSaveForm from "@/src/features/signup/ui/SignupSaveForm";
import SignupSubmissionList from "@/src/features/signup/ui/SignupSubmissionList";

export default function SignupPage() {
  return (
    <>
      <Header />
      <main className="page">
        <section className="hero">
          <p className="eyebrow">REACT HOOK FORM LAB</p>
          <h1>회원가입 저장 폼</h1>
          <p>레벨 3: API 계층·TanStack Query·SQLite를 연결합니다.</p>
        </section>
        <div className="workspace"><SignupSaveForm /><SignupSubmissionList /></div>
      </main>
    </>
  );
}
