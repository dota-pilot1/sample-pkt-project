import { api } from "@/shared/api/axios";

export type AppMenu = {
  id: number;
  code: string;
  parentId: number | null;
  label: string;
  path: string | null;
  icon: string | null;
  visible: boolean;
  displayOrder: number;
};

export const menuApi = {
  getAll: () => api.get<AppMenu[]>("/api/menus").then((response) => response.data),
};
