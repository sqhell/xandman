import { NextResponse } from "next/server";
import { getLatestPNodeSnapshots } from "@/lib/db/sync-service";

// GET /api/db/pnodes - Get latest pNode data from database (fast!)
export async function GET() {
  try {
    const snapshots = await getLatestPNodeSnapshots();

    if (snapshots.length === 0) {
      return NextResponse.json({
        success: true,
        total: 0,
        pnodes: [],
        message: "No data available. Run sync first.",
        timestamp: new Date().toISOString(),
      });
    }

    // Transform to PNode format expected by frontend
    const pnodes = snapshots.map((snapshot) => ({
      publicKey: snapshot.ipAddress.replace(/\./g, ""),
      identity: `pNode-${snapshot.ipAddress}`,
      gossipAddress: `${snapshot.ipAddress}:6000`,
      version: snapshot.version,
      status: snapshot.status as "active" | "inactive" | "delinquent",
      lastSeen: Number(snapshot.lastUpdated) * 1000 || Date.now(),
      uptime: Math.min(
        99.99,
        95 + (Number(snapshot.uptimeSeconds) / 86400) * 0.5
      ),
      uptimeHistory: [],
      storageUsed: Number(snapshot.storageUsed),
      storageCapacity: Number(snapshot.storageCapacity),
      storageUtilization:
        (Number(snapshot.storageUsed) / Number(snapshot.storageCapacity)) * 100,
      shardsAvailable: Math.floor(
        Number(snapshot.fileSize) / (1024 * 1024 * 10)
      ),
      shardsTotal:
        Math.floor(Number(snapshot.fileSize) / (1024 * 1024 * 10)) + 100,
      shardAvailability: 98,
      latency: Math.floor(20 + Math.random() * 30),
      dataCenter: "pRPC Node",
      region: snapshot.region || "Unknown",
      activatedAt:
        Date.now() - Number(snapshot.uptimeSeconds) * 1000,
      // Extra pRPC fields
      cpuPercent: snapshot.cpuPercent,
      ramUsed: Number(snapshot.ramUsed),
      ramTotal: Number(snapshot.ramTotal),
      activeStreams: snapshot.activeStreams,
      packetsReceived: Number(snapshot.packetsReceived),
      packetsSent: Number(snapshot.packetsSent),
      ipAddress: snapshot.ipAddress,
    }));

    return NextResponse.json({
      success: true,
      total: pnodes.length,
      pnodes,
      lastUpdated: snapshots[0]?.createdAt?.toISOString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("DB pnodes error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
