export type WorkOrderStatus = "READY" | "IN_PROGRESS" | "COMPLETED" | "HOLD";

export type WorkOrder = {
  id: number;
  code: string;
  planCode?: string;
  itemCode?: string;
  itemName: string;
  quantity: number;
  startDate?: string;
  dueDate: string;
  workstation: string;
  assignee: string;
  status: WorkOrderStatus;
};

export type UpdateWorkOrderStatusParams = {
  order: WorkOrder;
  status: WorkOrderStatus;
};
