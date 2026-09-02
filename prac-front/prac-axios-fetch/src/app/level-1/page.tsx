import LevelOnePractice from "@/widgets/level-one-practice/ui/LevelOnePractice";

export default function Level1Page() {
  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">FRONTEND PRACTICE · LEVEL 1</p>
        <h1>fetch로 회원가입과 세션 완성하기</h1>
        <p>회원가입·로그인·세션 복원·로그아웃을 순수 fetch와 HttpOnly 쿠키로 연결합니다.</p>
      </header>

      {/* app 라우트는 페이지 맥락만 제공하고 인증·CRUD 상태 조립은 위젯에 맡긴다. */}
      <LevelOnePractice />
    </main>
  );
}
