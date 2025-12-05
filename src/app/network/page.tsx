"use client";

import {
  Activity,
  HardDrive,
  Server,
  Zap,
  Layers,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "@/components/common/metric-card";
import { useNetworkStats } from "@/features/network/hooks/use-network-stats";
import { formatBytes, formatPercentage, formatLatency } from "@/lib/utils";

export default function NetworkPage() {
  const { data: stats, isLoading } = useNetworkStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Network Health</h1>
        <p className="text-muted-foreground mt-2">
          Monitor the overall health and performance of the Xandeum network
        </p>
      </div>

      {/* Overview Stats */}
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
              title="Total pNodes"
              value={stats?.totalPNodes || 0}
              description={`${stats?.activePNodes || 0} active`}
              icon={Server}
            />
            <MetricCard
              title="Network Storage"
              value={formatBytes(stats?.totalStorage || 0)}
              description={`${formatBytes(stats?.usedStorage || 0)} used`}
              icon={HardDrive}
            />
            <MetricCard
              title="Average Uptime"
              value={formatPercentage(stats?.averageUptime || 0)}
              icon={Activity}
            />
            <MetricCard
              title="Average Latency"
              value={formatLatency(stats?.averageLatency || 0)}
              icon={Zap}
            />
          </>
        )}
      </div>

      {/* Health Indicators */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Network Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-sm">pNode Availability</span>
                  </div>
                  <span className="font-medium">
                    {formatPercentage(
                      ((stats?.activePNodes || 0) / (stats?.totalPNodes || 1)) *
                        100
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-sm">Storage Utilization</span>
                  </div>
                  <span className="font-medium">
                    {formatPercentage(
                      ((stats?.usedStorage || 0) / (stats?.totalStorage || 1)) *
                        100
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-sm">Shard Availability</span>
                  </div>
                  <span className="font-medium">
                    {formatPercentage(
                      ((stats?.availableShards || 0) /
                        (stats?.totalShards || 1)) *
                        100
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-sm">Network Uptime</span>
                  </div>
                  <span className="font-medium text-success">
                    {formatPercentage(stats?.averageUptime || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-sm">Average Latency</span>
                  </div>
                  <span className="font-medium">
                    {formatLatency(stats?.averageLatency || 0)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Storage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Used Storage</span>
                    <span className="font-medium">
                      {formatBytes(stats?.usedStorage || 0)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${
                          ((stats?.usedStorage || 0) /
                            (stats?.totalStorage || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Free Storage</span>
                    <span className="font-medium">
                      {formatBytes(
                        (stats?.totalStorage || 0) - (stats?.usedStorage || 0)
                      )}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full"
                      style={{
                        width: `${
                          (1 -
                            (stats?.usedStorage || 0) /
                              (stats?.totalStorage || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      Available Shards
                    </span>
                    <span className="font-medium">
                      {stats?.availableShards?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full"
                      style={{
                        width: `${
                          ((stats?.availableShards || 0) /
                            (stats?.totalShards || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active pNodes</p>
                <p className="text-2xl font-bold">{stats?.activePNodes || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Shards</p>
                <p className="text-2xl font-bold">
                  {stats?.totalShards?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <HardDrive className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Capacity</p>
                <p className="text-2xl font-bold">
                  {formatBytes(stats?.totalStorage || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      {stats?.lastUpdated && (
        <p className="text-sm text-muted-foreground text-center">
          Last updated: {new Date(stats.lastUpdated).toLocaleString()}
        </p>
      )}
    </div>
  );
}
