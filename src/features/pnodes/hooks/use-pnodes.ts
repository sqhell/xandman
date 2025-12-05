"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries/query-keys";
import { pnodeApi } from "@/lib/api";
import type { PNodeFilters } from "../types";

export function usePNodes(filters: PNodeFilters = {}) {
  return useQuery({
    queryKey: queryKeys.pnodes.list(filters),
    queryFn: () => pnodeApi.getAll(filters),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function usePNode(publicKey: string) {
  return useQuery({
    queryKey: queryKeys.pnodes.detail(publicKey),
    queryFn: () => pnodeApi.getByPublicKey(publicKey),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    enabled: !!publicKey,
  });
}

export function usePNodeHistory(publicKey: string, days = 30) {
  return useQuery({
    queryKey: queryKeys.pnodes.history(publicKey),
    queryFn: () => pnodeApi.getHistory(publicKey, days),
    staleTime: 60 * 1000,
    enabled: !!publicKey,
  });
}
