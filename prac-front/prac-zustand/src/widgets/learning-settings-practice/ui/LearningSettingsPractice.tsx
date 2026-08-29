"use client";

import { useEffect, useState } from "react";
import {
  type Density,
  useDisplaySettingsStore,
} from "@/entities/display-settings/model/display-settings-store";
import { useLearningProgressStore } from "@/entities/learning-progress/model/learning-progress-store";

// 화면에 표시할 고정 학습 항목이다. 완료 여부는 store의 completedLessonIds에서 관리한다.
const lessons = [
  { id: "store", label: "스토어 만들기", description: "create와 초기 상태를 확인합니다." },
  { id: "actions", label: "액션 조합", description: "set으로 상태를 변경합니다." },
  { id: "selectors", label: "selector 구독", description: "필요한 상태만 선택합니다." },
] as const;

export default function LearningSettingsPractice() {
  // 두 persist store가 모두 localStorage 값을 읽기 전에는 기본값이 보이므로 복원 완료 상태를 따로 표시한다.
  const [hydrated, setHydrated] = useState(false);

  // 학습 진행 store에서는 완료 목록과 학습 액션만 구독한다.
  const completedLessonIds = useLearningProgressStore(
    (state) => state.completedLessonIds,
  );
  const toggleLesson = useLearningProgressStore((state) => state.toggleLesson);
  const resetProgress = useLearningProgressStore((state) => state.resetProgress);

  // 화면 설정 store에서는 밀도와 힌트 표시 관련 값만 구독한다.
  const density = useDisplaySettingsStore((state) => state.density);
  const showHints = useDisplaySettingsStore((state) => state.showHints);
  const setDensity = useDisplaySettingsStore((state) => state.setDensity);
  const toggleHints = useDisplaySettingsStore((state) => state.toggleHints);
  const resetDisplaySettings = useDisplaySettingsStore(
    (state) => state.resetDisplaySettings,
  );

  useEffect(() => {
    // 한 store만 복원된 상태를 완료로 표시하지 않도록 둘 다 확인한다.
    function updateHydrationState() {
      setHydrated(
        useLearningProgressStore.persist.hasHydrated() &&
          useDisplaySettingsStore.persist.hasHydrated(),
      );
    }

    updateHydrationState();
    const unsubscribeProgress =
      useLearningProgressStore.persist.onFinishHydration(updateHydrationState);
    const unsubscribeDisplay =
      useDisplaySettingsStore.persist.onFinishHydration(updateHydrationState);

    return () => {
      unsubscribeProgress();
      unsubscribeDisplay();
    };
  }, []);

  // 라디오 input 값이 string으로 넓어지지 않도록 Density 타입 경계에서 변경한다.
  function changeDensity(nextDensity: Density) {
    setDensity(nextDensity);
  }

  return (
    <section className="settings-grid">
      <article className="card">
        <div className="card-title">
          <span>02</span>
          <div>
            <h2>학습 설정 스토어</h2>
            <p>서로 다른 slice를 조합하고 새로고침 후에도 상태를 복원합니다.</p>
          </div>
        </div>

        <fieldset className="settings-fieldset">
          <legend>학습 진행</legend>
          {lessons.map((lesson) => (
            <label className="check-row" key={lesson.id}>
              <input
                type="checkbox"
                checked={completedLessonIds.includes(lesson.id)}
                onChange={() => toggleLesson(lesson.id)}
              />
              <span>
                <b>{lesson.label}</b>
                <small>{lesson.description}</small>
              </span>
            </label>
          ))}
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>화면 설정</legend>
          <div className="radio-row">
            {(["comfortable", "compact"] as const).map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name="density"
                  checked={density === option}
                  onChange={() => changeDensity(option)}
                />
                {option === "comfortable" ? "여유롭게" : "촘촘하게"}
              </label>
            ))}
          </div>
          <label className="check-row single-row">
            <input
              type="checkbox"
              checked={showHints}
              onChange={toggleHints}
            />
            <span><b>학습 힌트 표시</b></span>
          </label>
        </fieldset>

        <button
          type="button"
          className="secondary reset-button"
          onClick={() => {
            // 두 store의 기본값을 함께 적용해 화면 전체를 초기 상태로 되돌린다.
            resetProgress();
            resetDisplaySettings();
          }}
        >
          저장된 설정 초기화
        </button>
      </article>

      <aside className="card settings-preview">
        <p className="lesson-label">PERSIST PREVIEW</p>
        <h2>현재 저장될 상태</h2>
        <p className="hydration-status">
          {hydrated ? "localStorage 복원 완료" : "브라우저 저장값을 불러오는 중"}
        </p>
        <div className={`preview-card ${density}`}>
          <b>완료한 학습</b>
          <strong>{completedLessonIds.length} / {lessons.length}</strong>
          {showHints && <p>새로고침해도 체크 상태와 화면 설정이 유지됩니다.</p>}
        </div>
        <pre>{JSON.stringify({ completedLessonIds, density, showHints }, null, 2)}</pre>
      </aside>
    </section>
  );
}
