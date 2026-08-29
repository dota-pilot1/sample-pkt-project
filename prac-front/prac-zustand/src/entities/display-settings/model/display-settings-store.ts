import { create } from "zustand";
import { persist } from "zustand/middleware";

// 화면에 저장할 수 있는 밀도 선택지다.
export type Density = "comfortable" | "compact";

export type DisplaySettingsStore = {
  density: Density;
  showHints: boolean;
  setDensity: (density: Density) => void;
  toggleHints: () => void;
  resetDisplaySettings: () => void;
};

// 화면 표현만 책임지는 독립 store다. 학습 진행과 독립적으로 확장·초기화할 수 있다.
export const useDisplaySettingsStore = create<DisplaySettingsStore>()(
  persist(
    (set) => ({
      density: "comfortable",
      showHints: true,
      setDensity: (density) => set({ density }),
      toggleHints: () => set((state) => ({ showHints: !state.showHints })),
      resetDisplaySettings: () =>
        set({
          density: "comfortable",
          showHints: true,
        }),
    }),
    {
      name: "zustand-practice-display-settings",
    },
  ),
);
