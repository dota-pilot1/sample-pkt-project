"use client";

import { useCounterStore } from "@/entities/counter/model/counter-store";

export default function CounterPractice() {
  // 위젯은 화면에 필요한 상태와 액션만 selector로 구독한다.
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  return (
    <section className="practice-grid">
      <article className="card">
        <div className="card-title">
          <span>01</span>
          <div>
            <h2>카운터 스토어</h2>
            <p>React props 없이 여러 컴포넌트가 공유할 수 있는 상태입니다.</p>
          </div>
        </div>
        <div className="counter-panel">
          <p className="counter-label">현재 count</p>
          <strong>{count}</strong>
          <div className="actions">
            <button type="button" onClick={decrement}>
              − 1
            </button>
            <button type="button" onClick={increment}>
              + 1
            </button>
            <button type="button" className="secondary" onClick={reset}>
              초기화
            </button>
          </div>
        </div>
      </article>

      <aside className="card lesson-card">
        <p className="lesson-label">LEVEL 1 · LESSONS</p>
        <h2>이번 단계에서 확인할 것</h2>
        <ol className="topics">
          <li>
            <b>create로 스토어 만들기</b>
            <span>상태 타입과 초기값을 선언합니다.</span>
          </li>
          <li>
            <b>set으로 액션 정의하기</b>
            <span>이전 상태를 받아 다음 상태를 계산합니다.</span>
          </li>
          <li>
            <b>selector로 구독하기</b>
            <span>컴포넌트가 사용할 상태 조각만 선택합니다.</span>
          </li>
        </ol>
        <pre>{`const count = useCounterStore((state) => state.count);
const increment = useCounterStore((state) => state.increment);`}</pre>
      </aside>
    </section>
  );
}
