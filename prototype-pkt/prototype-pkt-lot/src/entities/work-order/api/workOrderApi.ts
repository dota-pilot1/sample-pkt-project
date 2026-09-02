import { api } from "@/shared/api/axios";
import type { CreateWorkOrderRequest, WorkOrder, WorkOrderLotAllocation } from "../model/types";

export const workOrderApi = {
  getAll: () => api.get<WorkOrder[]>("/api/work-orders").then((response) => response.data),
  getById: (workOrderId: number) => api.get<WorkOrder>(`/api/work-orders/${workOrderId}`).then((response) => response.data),
  getLotAllocation: (workOrderId: number) =>
    api.get<WorkOrderLotAllocation>(`/api/work-orders/${workOrderId}/lot-allocation`).then((response) => response.data),
  create: (request: CreateWorkOrderRequest) => api.post<WorkOrder>("/api/work-orders", request).then((response) => response.data),
};
