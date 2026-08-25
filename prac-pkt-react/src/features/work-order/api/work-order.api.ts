import { apiFetch } from "../../../shared/api/http";
import type { WorkOrder, WorkOrderStatus } from "../model/work-order.types";

export async function fetchWorkOrders(): Promise<WorkOrder[]> {
  const response = await apiFetch("/work-orders");

  if (!response.ok) {
    throw new Error("작업 관리 데이터를 불러오지 못했습니다.");
  }

  return (await response.json()) as WorkOrder[];
}

export async function updateWorkOrderStatus(order: WorkOrder, status: WorkOrderStatus): Promise<WorkOrder> {
  const response = await apiFetch(`/work-orders/${order.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      planCode: order.planCode ?? null,
      itemCode: order.itemCode ?? null,
      itemName: order.itemName,
      quantity: order.quantity,
      startDate: order.startDate,
      dueDate: order.dueDate,
      workstation: order.workstation,
      assignee: order.assignee,
      status,
    }),
  });

  if (!response.ok) {
    throw new Error("작업 상태를 변경하지 못했습니다.");
  }

  return (await response.json()) as WorkOrder;
}
