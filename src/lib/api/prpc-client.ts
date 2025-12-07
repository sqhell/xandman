// pRPC Client for querying pNode storage statistics
// Uses server-side API route to bypass browser port 6000 blocking

export interface PNodeStats {
  active_streams: number;
  cpu_percent: number;
  current_index: number;
  file_size: number; // bytes
  last_updated: number;
  packets_received: number;
  packets_sent: number;
  ram_total: number;
  ram_used: number;
  total_bytes: number;
  total_pages: number;
  uptime: number; // seconds
}

// Known pNodes with open pRPC ports (port 6000)
export const OPEN_PRPC_NODES = [
  "173.212.203.145",
  "173.212.220.65",
  "161.97.97.41",
  "192.190.136.36",
  "192.190.136.37",
  "192.190.136.38",
  "192.190.136.28",
  "192.190.136.29",
  "207.244.255.1",
];

// Get base path for API calls (handles basePath configuration)
function getApiBasePath(): string {
  // Use NEXT_PUBLIC_BASE_PATH if set, otherwise empty string for local dev
  return process.env.NEXT_PUBLIC_BASE_PATH || "";
}

export async function getPNodeStats(ip: string): Promise<PNodeStats | null> {
  try {
    const basePath = getApiBasePath();
    const response = await fetch(`${basePath}/api/prpc?ip=${ip}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.stats || null;
  } catch (error) {
    console.error(`pRPC error for ${ip}:`, error);
    return null;
  }
}

export async function getAllPNodeStats(): Promise<
  Array<{ ip: string; stats: PNodeStats }>
> {
  try {
    const basePath = getApiBasePath();
    const response = await fetch(`${basePath}/api/prpc?all=true`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.nodes || [];
  } catch (error) {
    console.error("pRPC getAllPNodeStats error:", error);
    return [];
  }
}

// Aggregate stats from all accessible pNodes
export async function getAggregatedPNodeStats(): Promise<{
  totalNodes: number;
  activeNodes: number;
  totalStorage: number;
  totalRamUsed: number;
  totalRamTotal: number;
  avgCpuPercent: number;
  avgUptime: number;
  nodes: Array<{ ip: string; stats: PNodeStats }>;
}> {
  const nodes = await getAllPNodeStats();

  if (nodes.length === 0) {
    return {
      totalNodes: OPEN_PRPC_NODES.length,
      activeNodes: 0,
      totalStorage: 0,
      totalRamUsed: 0,
      totalRamTotal: 0,
      avgCpuPercent: 0,
      avgUptime: 0,
      nodes: [],
    };
  }

  const totalStorage = nodes.reduce((sum, n) => sum + n.stats.file_size, 0);
  const totalRamUsed = nodes.reduce((sum, n) => sum + n.stats.ram_used, 0);
  const totalRamTotal = nodes.reduce((sum, n) => sum + n.stats.ram_total, 0);
  const avgCpuPercent =
    nodes.reduce((sum, n) => sum + n.stats.cpu_percent, 0) / nodes.length;
  const avgUptime =
    nodes.reduce((sum, n) => sum + n.stats.uptime, 0) / nodes.length;

  return {
    totalNodes: OPEN_PRPC_NODES.length,
    activeNodes: nodes.length,
    totalStorage,
    totalRamUsed,
    totalRamTotal,
    avgCpuPercent,
    avgUptime,
    nodes,
  };
}
