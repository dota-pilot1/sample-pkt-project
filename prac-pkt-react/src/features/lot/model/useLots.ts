import { useQuery } from "@tanstack/react-query";
import { fetchLots } from "../api/lot.api";

export function useLots() {
  return useQuery({
    queryKey: ["lots"],
    queryFn: fetchLots,
    staleTime: 30_000,
  });
}
