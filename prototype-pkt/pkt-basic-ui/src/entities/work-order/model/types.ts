export type WorkOrderStatus = "READY" | "IN_PROGRESS" | "COMPLETED" | "HOLD";

export type WorkOrderProcess = {
  id: number;
  sequence: number;
  processCode: string | null;
  processName: string;
  workstation: string | null;
  status: WorkOrderStatus;
};

export type WorkOrder = {
  id: number;
  code: string;
  planCode: string | null;
  itemCode: string | null;
  itemName: string;
  quantity: number;
  startDate: string;
  dueDate: string;
  workstation: string | null;
  assignee: string | null;
  status: WorkOrderStatus;
  processRouteCode: string | null;
  processRouteName: string | null;
  processRouteVersion: number | null;
  allocatedLotQuantity: number;
  remainingLotQuantity: number;
  processes: WorkOrderProcess[];
};

export type CreateWorkOrderRequest = Pick<WorkOrder,
  "code" | "planCode" | "itemCode" | "itemName" | "quantity" | "startDate" | "dueDate" | "workstation" | "assignee" | "status"
>;

export type WorkOrderLotAllocation = {
  workOrder: WorkOrder;
  allocatedLotQuantity: number;
  remainingLotQuantity: number;
  lots: Array<{
    id: number;
    lotCode: string;
    quantity: number | null;
    status: string;
    process: string;
  }>;
};
