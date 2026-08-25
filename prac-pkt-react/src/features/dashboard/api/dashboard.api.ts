import { fetchLots } from "../../lot/api/lot.api";
import type { Lot, LotPage } from "../../lot/model/lot.types";
import { fetchWorkOrders } from "../../work-order/api/work-order.api";
import type { WorkOrder } from "../../work-order/model/work-order.types";

const DASHBOARD_LOT_PAGE_SIZE = 100;

export type DashboardSummary = {
  totalLots: number;
  activeLots: number;
  completedLots: number;
  totalWorkOrders: number;
  activeWorkOrders: number;
  completedWorkOrders: number;
  latestLots: Lot[];
};

async function fetchAllLots(): Promise<Lot[]> {
  const firstPage = await fetchLots(0, DASHBOARD_LOT_PAGE_SIZE, { field: "updatedAt", direction: "desc" });
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, firstPage.totalPages - 1) }, (_, index) =>
      fetchLots(index + 1, DASHBOARD_LOT_PAGE_SIZE, { field: "updatedAt", direction: "desc" }),
    ),
  );
  return [firstPage, ...remainingPages].flatMap((page: LotPage) => page.content);
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const [lots, workOrders] = await Promise.all([fetchAllLots(), fetchWorkOrders()]);
  const activeLots = lots.filter((lot) => lot.status === "진행 중").length;
  const completedLots = lots.filter((lot) => lot.status === "완료").length;
  const activeWorkOrders = workOrders.filter((order) => order.status === "IN_PROGRESS").length;
  const completedWorkOrders = workOrders.filter((order) => order.status === "COMPLETED").length;

  return {
    totalLots: lots.length,
    activeLots,
    completedLots,
    totalWorkOrders: workOrders.length,
    activeWorkOrders,
    completedWorkOrders,
    latestLots: lots.slice(0, 5),
  };
}
