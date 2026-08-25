import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "../api/dashboard.api";

export const dashboardQueryKey = ["dashboard-summary"] as const;

export function useDashboard() {
  return useQuery({
    queryKey: dashboardQueryKey,
    queryFn: fetchDashboardSummary,
    staleTime: 30_000,
  });
}
