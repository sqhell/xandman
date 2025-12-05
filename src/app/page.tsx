"use client";

import Link from "next/link";
import {
  Database,
  HardDrive,
  Activity,
  Zap,
  ArrowRight,
  Server,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "@/components/common/metric-card";
import { StatusBadge } from "@/components/common/status-badge";
import { useNetworkStats } from "@/features/network/hooks/use-network-stats";
import { usePNodes } from "@/features/pnodes/hooks/use-pnodes";
import {
  formatBytes,
  formatPercentage,
  formatLatency,
  truncatePublicKey,
} from "@/lib/utils";

export default function DashboardPage() {
  const { data: networkStats, isLoading: networkLoading } = useNetworkStats();
  const { data: pnodesData, isLoading: pnodesLoading } = usePNodes({
    limit: 5,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor Xandeum pNode network health and performance
        </p>
      </div>

      {/* Network Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {networkLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <MetricCard
              title="Total pNodes"
              value={networkStats?.totalPNodes || 0}
              description={`${networkStats?.activePNodes || 0} active`}
              icon={Server}
            />
            <MetricCard
              title="Network Storage"
              value={formatBytes(networkStats?.totalStorage || 0)}
              description={`${formatBytes(networkStats?.usedStorage || 0)} used`}
              icon={HardDrive}
            />
            <MetricCard
              title="Average Uptime"
              value={formatPercentage(networkStats?.averageUptime || 0)}
              icon={Activity}
            />
            <MetricCard
              title="Average Latency"
              value={formatLatency(networkStats?.averageLatency || 0)}
              icon={Zap}
            />
          </>
        )}
      </div>

      {/* Network Health & Top pNodes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Network Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Network Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {networkLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Active pNodes
                  </span>
                  <span className="font-medium">
                    {networkStats?.activePNodes} /{" "}
                    {networkStats?.totalPNodes}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Storage Utilization
                  </span>
                  <span className="font-medium">
                    {formatPercentage(
                      ((networkStats?.usedStorage || 0) /
                        (networkStats?.totalStorage || 1)) *
                        100
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Shard Availability
                  </span>
                  <span className="font-medium">
                    {formatPercentage(
                      ((networkStats?.availableShards || 0) /
                        (networkStats?.totalShards || 1)) *
                        100
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Network Uptime
                  </span>
                  <span className="font-medium text-success">
                    {formatPercentage(networkStats?.averageUptime || 0)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top pNodes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Top pNodes
            </CardTitle>
            <a
              href="/pnodes"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium h-9 px-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              suppressHydrationWarning
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </CardHeader>
          <CardContent>
            {pnodesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {pnodesData?.pnodes.map((pnode) => (
                  <Link
                    key={pnode.publicKey}
                    href={`/pnodes/${pnode.publicKey}`}
                    className="flex justify-between items-center hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <StatusBadge status={pnode.status} />
                      <span className="font-mono text-sm">
                        {truncatePublicKey(pnode.publicKey, 6)}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatPercentage(pnode.uptime)} uptime
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <Link href="/pnodes">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Browse pNodes</h3>
                <p className="text-sm text-muted-foreground">
                  View all pNodes in the network
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <Link href="/network">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Network Health</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor network performance
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <a
            href="https://docs.xandeum.network"
            target="_blank"
            rel="noreferrer"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Documentation</h3>
                <p className="text-sm text-muted-foreground">
                  Learn about Xandeum
                </p>
              </div>
            </CardContent>
          </a>
        </Card>
      </div>
    </div>
  );
}
