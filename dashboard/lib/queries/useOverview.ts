import { useQuery } from "@tanstack/react-query";
import { getOverview, type EcommerceOverview } from "@/lib/api/metrics";

export function useOverview() {
  return useQuery<EcommerceOverview>({
    queryKey: ["metrics", "overview"],
    queryFn: getOverview,
  });
}
