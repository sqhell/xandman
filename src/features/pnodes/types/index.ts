export interface PNode {
  publicKey: string;
  identity?: string;
  gossipAddress: string;
  version: string;
  status: "active" | "inactive" | "delinquent";
  lastSeen: number;
  uptime: number;
  uptimeHistory: UptimeDataPoint[];
  storageUsed: number;
  storageCapacity: number;
  storageUtilization: number;
  shardsAvailable: number;
  shardsTotal: number;
  shardAvailability: number;
  latency: number;
  dataCenter?: string;
  region?: string;
  activatedAt: number;
}

export interface UptimeDataPoint {
  timestamp: number;
  uptime: number;
}

export interface PNodeFilters {
  status?: "active" | "inactive" | "delinquent" | "all";
  minUptime?: number;
  minStorage?: number;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PNodeSortOptions {
  field: "uptime" | "storage" | "shards" | "latency" | "activatedAt";
  direction: "asc" | "desc";
}

export interface PNodeListResponse {
  pnodes: PNode[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
