import type { PNodeFilters } from "@/features/pnodes/types";

export const queryKeys = {
  pnodes: {
    all: ["pnodes"] as const,
    lists: () => [...queryKeys.pnodes.all, "list"] as const,
    list: (filters: PNodeFilters) =>
      [...queryKeys.pnodes.lists(), filters] as const,
    details: () => [...queryKeys.pnodes.all, "detail"] as const,
    detail: (publicKey: string) =>
      [...queryKeys.pnodes.details(), publicKey] as const,
    history: (publicKey: string) =>
      [...queryKeys.pnodes.detail(publicKey), "history"] as const,
  },
  network: {
    all: ["network"] as const,
    stats: () => [...queryKeys.network.all, "stats"] as const,
    health: () => [...queryKeys.network.all, "health"] as const,
  },
} as const;
