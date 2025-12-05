"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries/query-keys";
import { networkApi } from "@/lib/api";

export function useNetworkStats() {
  return useQuery({
    queryKey: queryKeys.network.stats(),
    queryFn: () => networkApi.getStats(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}
