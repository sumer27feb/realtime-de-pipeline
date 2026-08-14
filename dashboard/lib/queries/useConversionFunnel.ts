import { useQuery } from "@tanstack/react-query";
import { getConversionFunnel, type ConversionFunnel } from "@/lib/api/metrics";

export function useConversionFunnel() {
  return useQuery<ConversionFunnel>({
    queryKey: ["metrics", "conversion"],
    queryFn: getConversionFunnel,
  });
}
