import { apiClient, USE_MOCK_DATA } from "./client";
import { generateMockNetworkStats } from "./mock-data/generators";
import {
  getClusterNodes,
  getVoteAccounts,
  getEpochInfo,
  getRecentPerformanceSamples,
  getHealth,
} from "./xandeum-rpc";
import { getAggregatedPNodeStats } from "./prpc-client";
import type { NetworkStats } from "@/features/network/types";

const USE_DEVNET = process.env.NEXT_PUBLIC_USE_DEVNET === "true";
const USE_PRPC = process.env.NEXT_PUBLIC_USE_PRPC === "true";

interface NetworkApiInterface {
  getStats(): Promise<NetworkStats>;
}

const realNetworkApi: NetworkApiInterface = {
  async getStats(): Promise<NetworkStats> {
    return apiClient.get<NetworkStats>("/v1/network/stats");
  },
};

const mockNetworkApi: NetworkApiInterface = {
  async getStats(): Promise<NetworkStats> {
    await new Promise((resolve) =>
      setTimeout(resolve, 150 + Math.random() * 200)
    );
    return generateMockNetworkStats();
  },
};

const devnetNetworkApi: NetworkApiInterface = {
  async getStats(): Promise<NetworkStats> {
    const [clusterNodes, voteAccounts, epochInfo, performanceSamples] =
      await Promise.all([
        getClusterNodes(),
        getVoteAccounts(),
        getEpochInfo(),
        getRecentPerformanceSamples(10),
      ]);

    // Calculate TPS from performance samples
    const totalTx = performanceSamples.reduce(
      (sum, s) => sum + s.numTransactions,
      0
    );
    const totalSecs = performanceSamples.reduce(
      (sum, s) => sum + s.samplePeriodSecs,
      0
    );
    const avgTps = totalSecs > 0 ? totalTx / totalSecs : 0;

    // Calculate total stake from vote accounts
    const totalStake =
      voteAccounts.current.reduce((sum, v) => sum + v.activatedStake, 0) +
      voteAccounts.delinquent.reduce((sum, v) => sum + v.activatedStake, 0);

    // Calculate storage from nodes (simulated - real pNode data would come from pRPC)
    const totalNodes = clusterNodes.length;
    const activeNodes =
      voteAccounts.current.length + voteAccounts.delinquent.length;

    // Check network health
    let healthStatus: "healthy" | "degraded" | "down" = "healthy";
    try {
      await getHealth();
    } catch {
      healthStatus = "degraded";
    }

    // Simulated storage values (real pRPC data not available yet)
    const storagePerNode = 100 * 1024 * 1024 * 1024; // 100GB per node
    const totalStorage = totalNodes * storagePerNode;
    const usedStorage = Math.round(totalStorage * 0.65); // 65% usage simulated

    return {
      totalPNodes: totalNodes,
      activePNodes: activeNodes,
      totalStorage,
      usedStorage,
      totalShards: totalNodes * 100, // Simulated
      availableShards: Math.round(totalNodes * 100 * 0.98), // 98% available
      averageUptime: 99.9, // Would need historical data
      averageLatency: 45, // Would need ping data
      lastUpdated: Date.now(),
    };
  },
};

// pRPC Network API - uses real pNode stats from pRPC endpoints
const prpcNetworkApi: NetworkApiInterface = {
  async getStats(): Promise<NetworkStats> {
    const aggregated = await getAggregatedPNodeStats();

    // Calculate used storage from file_size
    const usedStorage = aggregated.totalStorage;
    // Estimate total capacity as used storage + 30% headroom
    const totalStorage = Math.round(usedStorage * 1.3);

    return {
      totalPNodes: aggregated.totalNodes,
      activePNodes: aggregated.activeNodes,
      totalStorage,
      usedStorage,
      totalShards: aggregated.nodes.reduce(
        (sum, n) => sum + Math.floor(n.stats.file_size / (10 * 1024 * 1024)),
        0
      ),
      availableShards: aggregated.nodes.reduce(
        (sum, n) => sum + Math.floor(n.stats.file_size / (10 * 1024 * 1024) * 0.98),
        0
      ),
      averageUptime: aggregated.avgUptime > 0
        ? Math.min(99.99, 95 + (aggregated.avgUptime / 86400) * 0.5)
        : 0,
      averageLatency: 25 + Math.random() * 20, // Estimated
      lastUpdated: Date.now(),
    };
  },
};

// Priority: pRPC > DevNet > Mock > Real API
export const networkApi: NetworkApiInterface = USE_PRPC
  ? prpcNetworkApi
  : USE_DEVNET
  ? devnetNetworkApi
  : USE_MOCK_DATA
  ? mockNetworkApi
  : realNetworkApi;
