import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "./dashboard.service";
import type { DashboardFilters } from "./dashboard.service";

export function useDashboard(filters: DashboardFilters = {}) {
  return useQuery({
    queryKey: ["dashboard", "summary", filters],
    queryFn: () => getDashboardSummary(filters),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
