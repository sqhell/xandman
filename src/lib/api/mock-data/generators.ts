import type { PNode, UptimeDataPoint } from "@/features/pnodes/types";
import type { NetworkStats } from "@/features/network/types";

const REGIONS = [
  "US-East",
  "US-West",
  "EU-West",
  "EU-Central",
  "Asia-Pacific",
  "South America",
];
const DATA_CENTERS = ["AWS", "GCP", "Azure", "Hetzner", "OVH", "DigitalOcean"];

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

export function generateMockPublicKey(seed?: string): string {
  const chars =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const rand = seed ? seededRandom(seed) : Math.random;
  let key = "";
  for (let i = 0; i < 44; i++) {
    key += chars[Math.floor(rand() * chars.length)];
  }
  return key;
}

export function generateUptimeHistory(
  days: number,
  baseUptime: number
): UptimeDataPoint[] {
  const points: UptimeDataPoint[] = [];
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const variance = (Math.random() - 0.5) * 4;
    points.push({
      timestamp: now - i * 24 * 60 * 60 * 1000,
      uptime: Math.max(0, Math.min(100, baseUptime + variance)),
    });
  }
  return points;
}

export function generateMockPNode(publicKey?: string): PNode {
  const pk = publicKey || generateMockPublicKey();
  const rand = seededRandom(pk);

  const statusRand = rand();
  const status: PNode["status"] =
    statusRand > 0.1 ? (statusRand > 0.05 ? "active" : "delinquent") : "inactive";

  const baseUptime =
    status === "active"
      ? 95 + rand() * 5
      : status === "delinquent"
      ? 70 + rand() * 20
      : rand() * 50;

  const storageCapacity = (100 + Math.floor(rand() * 900)) * 1024 * 1024 * 1024;
  const storageUsed = Math.floor(storageCapacity * (0.3 + rand() * 0.6));
  const shardsTotal = 100 + Math.floor(rand() * 400);

  return {
    publicKey: pk,
    identity: rand() > 0.5 ? `pNode-${pk.slice(0, 8)}` : undefined,
    gossipAddress: `${Math.floor(rand() * 255)}.${Math.floor(
      rand() * 255
    )}.${Math.floor(rand() * 255)}.${Math.floor(rand() * 255)}:8001`,
    version: `0.4.${Math.floor(rand() * 10)}`,
    status,
    lastSeen:
      Date.now() -
      (status === "active"
        ? Math.floor(rand() * 60000)
        : Math.floor(rand() * 3600000)),
    uptime: baseUptime,
    uptimeHistory: generateUptimeHistory(30, baseUptime),
    storageUsed,
    storageCapacity,
    storageUtilization: (storageUsed / storageCapacity) * 100,
    shardsAvailable: Math.floor(shardsTotal * (0.9 + rand() * 0.1)),
    shardsTotal,
    shardAvailability: 90 + rand() * 10,
    latency: 10 + rand() * 100,
    dataCenter: DATA_CENTERS[Math.floor(rand() * DATA_CENTERS.length)],
    region: REGIONS[Math.floor(rand() * REGIONS.length)],
    activatedAt:
      Date.now() - Math.floor(rand() * 180 * 24 * 60 * 60 * 1000),
  };
}

let cachedPNodes: PNode[] | null = null;

export function generateMockPNodes(count: number): PNode[] {
  if (cachedPNodes && cachedPNodes.length === count) {
    return cachedPNodes;
  }

  const seed = seededRandom("xandeum-pnodes-list-v1");
  const publicKeys: string[] = [];

  for (let i = 0; i < count; i++) {
    let key = "";
    const chars =
      "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    for (let j = 0; j < 44; j++) {
      key += chars[Math.floor(seed() * chars.length)];
    }
    publicKeys.push(key);
  }

  cachedPNodes = publicKeys.map(generateMockPNode);
  return cachedPNodes;
}

export function generateMockNetworkStats(): NetworkStats {
  const pnodes = generateMockPNodes(150);
  const activePNodes = pnodes.filter((p) => p.status === "active").length;
  const totalStorage = pnodes.reduce((acc, p) => acc + p.storageCapacity, 0);
  const usedStorage = pnodes.reduce((acc, p) => acc + p.storageUsed, 0);
  const totalShards = pnodes.reduce((acc, p) => acc + p.shardsTotal, 0);
  const availableShards = pnodes.reduce((acc, p) => acc + p.shardsAvailable, 0);
  const averageUptime =
    pnodes.reduce((acc, p) => acc + p.uptime, 0) / pnodes.length;
  const averageLatency =
    pnodes.reduce((acc, p) => acc + p.latency, 0) / pnodes.length;

  return {
    totalPNodes: pnodes.length,
    activePNodes,
    totalStorage,
    usedStorage,
    totalShards,
    availableShards,
    averageUptime,
    averageLatency,
    lastUpdated: Date.now(),
  };
}
