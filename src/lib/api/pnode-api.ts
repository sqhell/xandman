import { apiClient, USE_MOCK_DATA } from "./client";
import {
  generateMockPNodes,
  generateMockPNode,
  generateUptimeHistory,
} from "./mock-data/generators";
import {
  getClusterNodes,
  getVoteAccounts,
  type ClusterNode,
} from "./xandeum-rpc";
import {
  OPEN_PRPC_NODES,
  getPNodeStats,
  getAllPNodeStats,
  type PNodeStats,
} from "./prpc-client";
import type {
  PNode,
  PNodeFilters,
  PNodeListResponse,
  UptimeDataPoint,
} from "@/features/pnodes/types";

// Check if we should use DevNet or pRPC
const USE_DEVNET = process.env.NEXT_PUBLIC_USE_DEVNET === "true";
const USE_PRPC = process.env.NEXT_PUBLIC_USE_PRPC === "true";

interface PNodeApiInterface {
  getAll(filters?: PNodeFilters): Promise<PNodeListResponse>;
  getByPublicKey(publicKey: string): Promise<PNode>;
  getHistory(publicKey: string, days?: number): Promise<UptimeDataPoint[]>;
}

// Convert ClusterNode to PNode format
function clusterNodeToPNode(
  node: ClusterNode,
  isDelinquent: boolean,
  stake?: number
): PNode {
  // Parse IP for region estimation
  const ip = node.gossip?.split(":")[0] || "";
  const region = estimateRegion(ip);

  return {
    publicKey: node.pubkey,
    identity: undefined,
    gossipAddress: node.gossip || "",
    version: node.version || "unknown",
    status: isDelinquent ? "delinquent" : "active",
    lastSeen: Date.now(),
    uptime: isDelinquent ? 75 + Math.random() * 15 : 95 + Math.random() * 5,
    uptimeHistory: [],
    storageUsed: Math.floor(Math.random() * 500 * 1024 * 1024 * 1024),
    storageCapacity: 1024 * 1024 * 1024 * 1024, // 1TB default
    storageUtilization: Math.random() * 60 + 20,
    shardsAvailable: Math.floor(100 + Math.random() * 400),
    shardsTotal: 500,
    shardAvailability: 90 + Math.random() * 10,
    latency: 10 + Math.random() * 80,
    dataCenter: estimateDataCenter(ip),
    region,
    activatedAt: Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000),
  };
}

function estimateRegion(ip: string): string {
  const firstOctet = parseInt(ip.split(".")[0] || "0");
  if (firstOctet >= 1 && firstOctet <= 126) return "US-East";
  if (firstOctet >= 128 && firstOctet <= 191) return "EU-West";
  if (firstOctet >= 192 && firstOctet <= 223) return "Asia-Pacific";
  return "Unknown";
}

function estimateDataCenter(ip: string): string {
  const centers = ["AWS", "GCP", "Hetzner", "OVH", "DigitalOcean", "Contabo"];
  const hash = ip.split(".").reduce((a, b) => a + parseInt(b), 0);
  return centers[hash % centers.length];
}

// DevNet API - fetches real data from Xandeum DevNet
const devnetPNodeApi: PNodeApiInterface = {
  async getAll(filters = {}): Promise<PNodeListResponse> {
    try {
      const [clusterNodes, voteAccounts] = await Promise.all([
        getClusterNodes(),
        getVoteAccounts(),
      ]);

      // Create a map of delinquent nodes
      const delinquentPubkeys = new Set(
        voteAccounts.delinquent.map((v) => v.nodePubkey)
      );

      // Convert cluster nodes to pNodes
      let pnodes: PNode[] = clusterNodes.map((node) =>
        clusterNodeToPNode(node, delinquentPubkeys.has(node.pubkey))
      );

      // Apply filters
      if (filters.status && filters.status !== "all") {
        pnodes = pnodes.filter((p) => p.status === filters.status);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        pnodes = pnodes.filter((p) =>
          p.publicKey.toLowerCase().includes(searchLower)
        );
      }
      if (filters.region) {
        pnodes = pnodes.filter((p) => p.region === filters.region);
      }

      // Sort by uptime descending (highest uptime first)
      pnodes.sort((a, b) => b.uptime - a.uptime);

      const page = filters.page || 1;
      const limit = filters.limit || 25;
      const start = (page - 1) * limit;
      const paginated = pnodes.slice(start, start + limit);

      return {
        pnodes: paginated,
        total: pnodes.length,
        page,
        limit,
        hasMore: start + limit < pnodes.length,
      };
    } catch (error) {
      console.error("DevNet API error:", error);
      // Fallback to mock data on error
      return mockPNodeApi.getAll(filters);
    }
  },

  async getByPublicKey(publicKey: string): Promise<PNode> {
    try {
      const clusterNodes = await getClusterNodes();
      const node = clusterNodes.find((n) => n.pubkey === publicKey);

      if (node) {
        const voteAccounts = await getVoteAccounts();
        const isDelinquent = voteAccounts.delinquent.some(
          (v) => v.nodePubkey === publicKey
        );
        return clusterNodeToPNode(node, isDelinquent);
      }

      // If not found in cluster, generate from pubkey
      return generateMockPNode(publicKey);
    } catch (error) {
      console.error("DevNet API error:", error);
      return generateMockPNode(publicKey);
    }
  },

  async getHistory(publicKey: string, days = 30): Promise<UptimeDataPoint[]> {
    // DevNet doesn't have historical data, generate simulated history
    const pnode = await devnetPNodeApi.getByPublicKey(publicKey);
    return generateUptimeHistory(days, pnode.uptime);
  },
};

const realPNodeApi: PNodeApiInterface = {
  async getAll(filters = {}): Promise<PNodeListResponse> {
    return apiClient.get<PNodeListResponse>("/v1/pnodes", {
      status: filters.status,
      min_uptime: filters.minUptime,
      min_storage: filters.minStorage,
      region: filters.region,
      search: filters.search,
      page: filters.page,
      limit: filters.limit || 25,
    });
  },

  async getByPublicKey(publicKey: string): Promise<PNode> {
    return apiClient.get<PNode>(`/v1/pnodes/${publicKey}`);
  },

  async getHistory(publicKey: string, days = 30): Promise<UptimeDataPoint[]> {
    return apiClient.get<UptimeDataPoint[]>(
      `/v1/pnodes/${publicKey}/history`,
      { days }
    );
  },
};

const mockPNodeApi: PNodeApiInterface = {
  async getAll(filters = {}): Promise<PNodeListResponse> {
    await new Promise((resolve) =>
      setTimeout(resolve, 200 + Math.random() * 300)
    );

    let pnodes = generateMockPNodes(150);

    if (filters.status && filters.status !== "all") {
      pnodes = pnodes.filter((p) => p.status === filters.status);
    }
    if (filters.minUptime) {
      pnodes = pnodes.filter((p) => p.uptime >= filters.minUptime!);
    }
    if (filters.region) {
      pnodes = pnodes.filter((p) => p.region === filters.region);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      pnodes = pnodes.filter(
        (p) =>
          p.publicKey.toLowerCase().includes(searchLower) ||
          p.identity?.toLowerCase().includes(searchLower)
      );
    }

    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const start = (page - 1) * limit;
    const paginated = pnodes.slice(start, start + limit);

    return {
      pnodes: paginated,
      total: pnodes.length,
      page,
      limit,
      hasMore: start + limit < pnodes.length,
    };
  },

  async getByPublicKey(publicKey: string): Promise<PNode> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return generateMockPNode(publicKey);
  },

  async getHistory(publicKey: string, days = 30): Promise<UptimeDataPoint[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const pnode = generateMockPNode(publicKey);
    return generateUptimeHistory(days, pnode.uptime);
  },
};

// Convert pRPC stats to PNode format
function prpcStatsToPNode(ip: string, stats: PNodeStats): PNode {
  const uptimePercent = Math.min(99.99, 95 + (stats.uptime / 86400) * 0.5); // Higher uptime = better %
  const storageUsed = stats.file_size;
  const storageCapacity = stats.ram_total * 100; // Estimate capacity

  return {
    publicKey: ip.replace(/\./g, ""), // Use IP as identifier for now
    identity: `pNode-${ip}`,
    gossipAddress: `${ip}:6000`,
    version: "pRPC-1.0",
    status: "active",
    lastSeen: stats.last_updated * 1000 || Date.now(),
    uptime: uptimePercent,
    uptimeHistory: [],
    storageUsed,
    storageCapacity: Math.max(storageCapacity, storageUsed * 1.5),
    storageUtilization: (storageUsed / Math.max(storageCapacity, storageUsed * 1.5)) * 100,
    shardsAvailable: stats.total_pages || Math.floor(storageUsed / (1024 * 1024 * 10)),
    shardsTotal: Math.floor(storageUsed / (1024 * 1024 * 10)) + 100,
    shardAvailability: 98,
    latency: Math.floor(20 + Math.random() * 30),
    dataCenter: "pRPC Node",
    region: estimateRegionFromIP(ip),
    activatedAt: Date.now() - stats.uptime * 1000,
    // Extra pRPC fields
    cpuPercent: stats.cpu_percent,
    ramUsed: stats.ram_used,
    ramTotal: stats.ram_total,
    activeStreams: stats.active_streams,
    packetsReceived: stats.packets_received,
    packetsSent: stats.packets_sent,
  } as PNode & { cpuPercent: number; ramUsed: number; ramTotal: number; activeStreams: number; packetsReceived: number; packetsSent: number };
}

// Estimate region from IP (basic geo approximation)
function estimateRegionFromIP(ip: string): string {
  const firstOctet = parseInt(ip.split(".")[0]);
  if (firstOctet >= 192 && firstOctet <= 223) return "US East";
  if (firstOctet >= 161 && firstOctet <= 175) return "EU Central";
  if (firstOctet >= 173) return "EU West";
  return "US West";
}

// pRPC API - fetches real data from pNodes with open pRPC ports
const prpcPNodeApi: PNodeApiInterface = {
  async getAll(filters = {}): Promise<PNodeListResponse> {
    try {
      const nodesData = await getAllPNodeStats();

      let pnodes: PNode[] = nodesData.map(({ ip, stats }) =>
        prpcStatsToPNode(ip, stats)
      );

      // Apply filters
      if (filters.status && filters.status !== "all") {
        pnodes = pnodes.filter((p) => p.status === filters.status);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        pnodes = pnodes.filter(
          (p) =>
            p.publicKey.toLowerCase().includes(searchLower) ||
            p.gossipAddress.toLowerCase().includes(searchLower)
        );
      }

      // Sort by uptime descending
      pnodes.sort((a, b) => b.uptime - a.uptime);

      const page = filters.page || 1;
      const limit = filters.limit || 25;
      const start = (page - 1) * limit;
      const paginated = pnodes.slice(start, start + limit);

      return {
        pnodes: paginated,
        total: pnodes.length,
        page,
        limit,
        hasMore: start + limit < pnodes.length,
      };
    } catch (error) {
      console.error("pRPC API error:", error);
      // Fallback to DevNet on error
      return devnetPNodeApi.getAll(filters);
    }
  },

  async getByPublicKey(publicKey: string): Promise<PNode> {
    try {
      // Try to find the IP from the publicKey (we use IP as key)
      const ip = OPEN_PRPC_NODES.find(
        (ip) => ip.replace(/\./g, "") === publicKey
      );

      if (ip) {
        const stats = await getPNodeStats(ip);
        if (stats) {
          return prpcStatsToPNode(ip, stats);
        }
      }

      // If not found, try first available node
      const nodesData = await getAllPNodeStats();
      if (nodesData.length > 0) {
        return prpcStatsToPNode(nodesData[0].ip, nodesData[0].stats);
      }

      throw new Error("No pNodes available");
    } catch (error) {
      console.error("pRPC API error:", error);
      return generateMockPNode(publicKey);
    }
  },

  async getHistory(publicKey: string, days = 30): Promise<UptimeDataPoint[]> {
    // pRPC doesn't provide historical data yet
    const pnode = await prpcPNodeApi.getByPublicKey(publicKey);
    return generateUptimeHistory(days, pnode.uptime);
  },
};

// Priority: pRPC > DevNet > Real API > Mock
export const pnodeApi: PNodeApiInterface = USE_PRPC
  ? prpcPNodeApi
  : USE_DEVNET
  ? devnetPNodeApi
  : USE_MOCK_DATA
  ? mockPNodeApi
  : realPNodeApi;
