import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWorkOrders, updateWorkOrderStatus } from "../api/work-order.api";
import type { UpdateWorkOrderStatusParams } from "./work-order.types";

export const workOrdersQueryKey = ["work-orders"] as const;

export function useWorkOrders() {
  return useQuery({
    queryKey: workOrdersQueryKey,
    queryFn: fetchWorkOrders,
  });
}

export function useUpdateWorkOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ order, status }: UpdateWorkOrderStatusParams) => updateWorkOrderStatus(order, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workOrdersQueryKey }),
  });
}
