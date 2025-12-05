// Xandeum DevNet RPC Client
const XANDEUM_DEVNET_RPC = "https://api.devnet.xandeum.com:8899";

interface XandeumRpcResponse<T> {
  jsonrpc: string;
  result: T;
  id: number;
}

interface ClusterNode {
  pubkey: string;
  gossip: string;
  rpc: string | null;
  tpu: string;
  tvu: string;
  version: string;
  featureSet: number;
  shredVersion: number;
}

interface VoteAccount {
  votePubkey: string;
  nodePubkey: string;
  activatedStake: number;
  epochVoteAccount: boolean;
  epochCredits: [number, number, number][];
  commission: number;
  lastVote: number;
  rootSlot: number;
}

interface VoteAccountsResult {
  current: VoteAccount[];
  delinquent: VoteAccount[];
}

async function rpcCall<T>(method: string, params: unknown[] = []): Promise<T> {
  const response = await fetch(XANDEUM_DEVNET_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC error: ${response.statusText}`);
  }

  const data: XandeumRpcResponse<T> = await response.json();
  return data.result;
}

export async function getClusterNodes(): Promise<ClusterNode[]> {
  return rpcCall<ClusterNode[]>("getClusterNodes");
}

export async function getVoteAccounts(): Promise<VoteAccountsResult> {
  return rpcCall<VoteAccountsResult>("getVoteAccounts");
}

export async function getEpochInfo(): Promise<{
  epoch: number;
  slotIndex: number;
  slotsInEpoch: number;
  absoluteSlot: number;
  blockHeight: number;
}> {
  return rpcCall("getEpochInfo");
}

export async function getHealth(): Promise<string> {
  return rpcCall<string>("getHealth");
}

export async function getVersion(): Promise<{ "solana-core": string; "feature-set": number }> {
  return rpcCall("getVersion");
}

export interface PerformanceSample {
  slot: number;
  numTransactions: number;
  numSlots: number;
  samplePeriodSecs: number;
}

export async function getRecentPerformanceSamples(limit = 10): Promise<PerformanceSample[]> {
  return rpcCall<PerformanceSample[]>("getRecentPerformanceSamples", [limit]);
}

export async function getSlot(): Promise<number> {
  return rpcCall<number>("getSlot");
}

export async function getBlockTime(slot: number): Promise<number | null> {
  return rpcCall<number | null>("getBlockTime", [slot]);
}

export { XANDEUM_DEVNET_RPC };
export type { ClusterNode, VoteAccount, VoteAccountsResult };
