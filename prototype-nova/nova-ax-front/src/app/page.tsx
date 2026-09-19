export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">
        NOVA AX 실습 프로젝트
      </h1>
      <p className="text-slate-600 mb-8 text-center max-w-md">
        복잡한 코드를 모두 비웠습니다! <br />
        여기서부터 텍스트 입력창 하나, 버튼 하나부터 시작해서 기초적인 AI 연동을 차근차근 실습해 보세요.
      </p>

      {/* 여기에 실습할 컴포넌트를 하나씩 추가해보세요 */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[300px] flex items-center justify-center text-slate-400">
        여기에 첫 컴포넌트를 만들어보세요.
      </div>
    </main>
  );
}
