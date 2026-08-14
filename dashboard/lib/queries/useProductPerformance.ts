import { useQuery } from "@tanstack/react-query";
import {
  getProductPerformance,
  type ProductPerformance,
} from "@/lib/api/metrics";

export function useProductPerformance() {
  return useQuery<ProductPerformance[]>({
    queryKey: ["metrics", "products"],
    queryFn: getProductPerformance,
  });
}
