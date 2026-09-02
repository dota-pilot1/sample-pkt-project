import { create } from "zustand";

type EditorMode = "create" | "edit" | null;

/** 서버 데이터와 분리된 편집 패널·삭제 확인·오류 재현 UI 상태다. */
interface EquipmentUiState {
  editorMode: EditorMode;
  editingId: number | null;
  deleteCandidateId: number | null;
  simulateReadError: boolean;
  openCreate: () => void;
  openEdit: (id: number) => void;
  closeEditor: () => void;
  askDelete: (id: number) => void;
  cancelDelete: () => void;
  setSimulateReadError: (value: boolean) => void;
  reset: () => void;
}

const initialUiState = {
  editorMode: null as EditorMode,
  editingId: null as number | null,
  deleteCandidateId: null as number | null,
  simulateReadError: false,
};

export const useEquipmentUiStore = create<EquipmentUiState>((set) => ({
  ...initialUiState,
  openCreate: () => set({ editorMode: "create", editingId: null }),
  openEdit: (id) => set({ editorMode: "edit", editingId: id }),
  closeEditor: () => set({ editorMode: null, editingId: null }),
  askDelete: (id) => set({ deleteCandidateId: id }),
  cancelDelete: () => set({ deleteCandidateId: null }),
  setSimulateReadError: (value) => set({ simulateReadError: value }),
  reset: () => set(initialUiState),
}));

