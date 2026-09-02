import { api } from "@/shared/api/axios";

export type QualityStatus = "DRAFT" | "APPROVED" | "INACTIVE";
export type QualityStandard = { id: number; productId: number; productCode: string; productName: string; standardName: string; version: number; status: QualityStatus; requiredLotStatus: string; minimumYieldRate: number | null; minimumGoodQuantity: number | null; passDisposition: string; failDisposition: string; description: string | null };
export type QualityStandardInput = { productId: number; standardName: string; version?: number; requiredLotStatus: string; minimumYieldRate: number; minimumGoodQuantity: number; passDisposition: string; failDisposition: string; description?: string };

export const lotQualityApi = {
  getAll: () => api.get<QualityStandard[]>("/api/lot-quality-standards").then((response) => response.data),
  create: (request: QualityStandardInput) => api.post<QualityStandard>("/api/lot-quality-standards", request).then((response) => response.data),
  update: (id: number, request: Omit<QualityStandardInput, "productId" | "version">) => api.put<QualityStandard>(`/api/lot-quality-standards/${id}`, request).then((response) => response.data),
  approve: (id: number) => api.post<QualityStandard>(`/api/lot-quality-standards/${id}/approve`).then((response) => response.data),
  inactivate: (id: number) => api.post<QualityStandard>(`/api/lot-quality-standards/${id}/inactivate`).then((response) => response.data),
  delete: (id: number) => api.delete(`/api/lot-quality-standards/${id}`),
  judge: (lotIds: number[]) => api.post<Array<{ lotId: number; lotCode: string; passed: boolean; message: string }>>("/api/lot-quality-standards/judge", { lotIds }).then((response) => response.data),
};
