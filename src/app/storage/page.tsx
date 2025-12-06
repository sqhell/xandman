"use client";

import { useMemo } from "react";
import { HardDrive, PieChart, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "@/components/common/metric-card";
import { StakeTreemap } from "@/components/charts/stake-treemap";
import { useNetworkStats } from "@/features/network/hooks/use-network-stats";
import { usePNodes } from "@/features/pnodes/hooks/use-pnodes";
import { formatBytes, formatPercentage } from "@/lib/utils";

export default function StoragePage() {
  const { data: stats, isLoading: statsLoading } = useNetworkStats();
  const { data: pnodesData, isLoading: pnodesLoading } = usePNodes({ limit: 100 });

  // Transform pNode data for the treemap
  const storageNodes = useMemo(() => {
    if (!pnodesData?.pnodes) return [];

    return pnodesData.pnodes.map((node) => ({
      publicKey: node.publicKey,
      name: `${node.publicKey.slice(0, 4)}...${node.publicKey.slice(-4)}`,
      stake: Math.round(node.storageCapacity / 1024 / 1024), // MB
      status: node.status,
    }));
  }, [pnodesData]);

  // Group nodes by status for breakdown
  const statusBreakdown = useMemo(() => {
    if (!pnodesData?.pnodes) return { active: 0, delinquent: 0, inactive: 0 };

    return pnodesData.pnodes.reduce(
      (acc, node) => {
        acc[node.status] = (acc[node.status] || 0) + node.storageCapacity;
        return acc;
      },
      { active: 0, delinquent: 0, inactive: 0 } as Record<string, number>
    );
  }, [pnodesData]);

  const isLoading = statsLoading || pnodesLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Storage Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Analyze storage distribution and allocation across the Xandeum network
        </p>
      </div>

      {/* Storage Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <MetricCard
              title="Total Storage"
              value={formatBytes(stats?.totalStorage || 0)}
              description="Network capacity"
              icon={HardDrive}
            />
            <MetricCard
              title="Used Storage"
              value={formatBytes(stats?.usedStorage || 0)}
              description={`${formatPercentage(
                ((stats?.usedStorage || 0) / (stats?.totalStorage || 1)) * 100
              )} utilized`}
              icon={BarChart3}
            />
            <MetricCard
              title="Free Storage"
              value={formatBytes(
                (stats?.totalStorage || 0) - (stats?.usedStorage || 0)
              )}
              description="Available capacity"
              icon={HardDrive}
            />
            <MetricCard
              title="Active Nodes"
              value={pnodesData?.pnodes.filter((p) => p.status === "active").length || 0}
              description={`of ${pnodesData?.total || 0} total`}
              icon={PieChart}
            />
          </>
        )}
      </div>

      {/* Storage by Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <HardDrive className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Active Storage</p>
                <p className="text-2xl font-bold">
                  {formatBytes(statusBreakdown.active)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <HardDrive className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Delinquent Storage</p>
                <p className="text-2xl font-bold">
                  {formatBytes(statusBreakdown.delinquent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <HardDrive className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Inactive Storage</p>
                <p className="text-2xl font-bold">
                  {formatBytes(statusBreakdown.inactive)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage Treemap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Node Storage Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pnodesLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          ) : (
            <StakeTreemap nodes={storageNodes} className="min-h-[400px]" />
          )}
        </CardContent>
      </Card>

      {/* Storage Utilization Bars */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Storage Utilization by Node
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pnodesLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {pnodesData?.pnodes
                .sort((a, b) => b.storageUtilization - a.storageUtilization)
                .map((node) => (
                  <div key={node.publicKey}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-mono text-muted-foreground">
                        {node.publicKey.slice(0, 8)}...{node.publicKey.slice(-6)}
                      </span>
                      <span className="font-medium">
                        {formatPercentage(node.storageUtilization)}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          node.status === "active"
                            ? "bg-green-500"
                            : node.status === "delinquent"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${node.storageUtilization}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
