import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LearningProgressStore = {
  completedLessonIds: string[];
  toggleLesson: (lessonId: string) => void;
  resetProgress: () => void;
};

// 학습 완료 목록만 책임지는 독립 store다. 화면 설정과 다른 localStorage 키로 저장한다.
export const useLearningProgressStore = create<LearningProgressStore>()(
  persist(
    (set) => ({
      completedLessonIds: [],
      toggleLesson: (lessonId) =>
        set((state) => ({
          completedLessonIds: state.completedLessonIds.includes(lessonId)
            ? state.completedLessonIds.filter((id) => id !== lessonId)
            : [...state.completedLessonIds, lessonId],
        })),
      resetProgress: () => set({ completedLessonIds: [] }),
    }),
    {
      name: "zustand-practice-learning-progress",
    },
  ),
);
