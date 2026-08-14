import { useQuery } from "@tanstack/react-query";
import {
  getPaymentPerformance,
  type PaymentPerformance,
} from "@/lib/api/metrics";

export function usePaymentPerformance() {
  return useQuery<PaymentPerformance[]>({
    queryKey: ["metrics", "payments"],
    queryFn: getPaymentPerformance,
  });
}
