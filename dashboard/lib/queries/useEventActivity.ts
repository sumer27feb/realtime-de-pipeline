import { useQuery } from "@tanstack/react-query";
import { getEventActivity, type EventActivity } from "@/lib/api/metrics";

export function useEventActivity() {
  return useQuery<EventActivity[]>({
    queryKey: ["metrics", "activity"],
    queryFn: getEventActivity,
  });
}
