import { NextResponse } from "next/server";
import { getLatestNetworkStats } from "@/lib/db/sync-service";

// GET /api/db/network - Get latest network stats from database (fast!)
export async function GET() {
  try {
    const stats = await getLatestNetworkStats();

    if (!stats) {
      return NextResponse.json({
        success: true,
        stats: null,
        message: "No data available. Run sync first.",
        timestamp: new Date().toISOString(),
      });
    }

    // Transform to NetworkStats format expected by frontend
    const networkStats = {
      totalPNodes: stats.totalPNodes,
      activePNodes: stats.activePNodes,
      totalStorage: Number(stats.totalStorage),
      usedStorage: Number(stats.usedStorage),
      totalShards: stats.totalShards,
      availableShards: stats.availableShards,
      averageUptime: stats.averageUptime,
      averageLatency: stats.averageLatency,
      lastUpdated: stats.createdAt.getTime(),
    };

    return NextResponse.json({
      success: true,
      stats: networkStats,
      lastUpdated: stats.createdAt.toISOString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("DB network stats error:", error);
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
