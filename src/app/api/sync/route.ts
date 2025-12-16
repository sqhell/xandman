import { NextRequest, NextResponse } from "next/server";
import { syncPNodeData, cleanupOldSnapshots } from "@/lib/db/sync-service";

// POST /api/sync - Trigger a sync of pRPC data to database
// Protected with API key for cron job security
export async function POST(request: NextRequest) {
  // Verify API key
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.SYNC_API_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid API key" },
      { status: 401 }
    );
  }

  try {
    // Run sync
    const result = await syncPNodeData();

    // Cleanup old data (keep last 24 hours)
    const cleanup = await cleanupOldSnapshots(24);

    return NextResponse.json({
      success: result.success,
      sync: {
        nodesQueried: result.nodesQueried,
        nodesSuccess: result.nodesSuccess,
        nodesFailed: result.nodesFailed,
        durationMs: result.durationMs,
        error: result.error,
      },
      cleanup: {
        deletedPNodes: cleanup.deletedPNodes,
        deletedNetworkStats: cleanup.deletedNetworkStats,
        deletedSyncLogs: cleanup.deletedSyncLogs,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sync error:", error);
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

// GET /api/sync - Get sync status (no auth required)
export async function GET() {
  try {
    const { prisma } = await import("@/lib/db/prisma");

    // Get last sync log
    const lastSync = await prisma.syncLog.findFirst({
      orderBy: { startedAt: "desc" },
    });

    // Get snapshot counts
    const pnodeCount = await prisma.pNodeSnapshot.count();
    const networkStatsCount = await prisma.networkStatsSnapshot.count();

    return NextResponse.json({
      lastSync: lastSync
        ? {
            startedAt: lastSync.startedAt,
            completedAt: lastSync.completedAt,
            nodesQueried: lastSync.nodesQueried,
            nodesSuccess: lastSync.nodesSuccess,
            nodesFailed: lastSync.nodesFailed,
            durationMs: lastSync.durationMs,
            error: lastSync.error,
          }
        : null,
      snapshotCounts: {
        pnodes: pnodeCount,
        networkStats: networkStatsCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sync status error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
