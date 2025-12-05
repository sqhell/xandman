export interface NetworkStats {
  totalPNodes: number;
  activePNodes: number;
  totalStorage: number;
  usedStorage: number;
  totalShards: number;
  availableShards: number;
  averageUptime: number;
  averageLatency: number;
  lastUpdated: number;
}

export interface NetworkHealthIndicator {
  name: string;
  status: "healthy" | "degraded" | "critical";
  value: number;
  threshold: number;
  description: string;
}
