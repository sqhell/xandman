"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  HardDrive,
  Layers,
  Zap,
  Globe,
  Server,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "@/components/common/metric-card";
import { StatusBadge } from "@/components/common/status-badge";
import { CopyButton } from "@/components/common/copy-button";
import { UptimeChart } from "@/components/charts/uptime-chart";
import { StorageChart } from "@/components/charts/storage-chart";
import { usePNode, usePNodeHistory } from "@/features/pnodes/hooks/use-pnodes";
import {
  formatBytes,
  formatPercentage,
  formatLatency,
  formatTimeAgo,
} from "@/lib/utils";

interface PageProps {
  params: Promise<{ publicKey: string }>;
}

export default function PNodeDetailPage({ params }: PageProps) {
  const { publicKey } = use(params);
  const { data: pnode, isLoading } = usePNode(publicKey);
  const { data: history } = usePNodeHistory(publicKey);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!pnode) {
    return (
      <div className="space-y-6">
        <Link
          href="/pnodes"
          className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to pNodes
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">pNode not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/pnodes"
            className="-ml-2 inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to pNodes
          </Link>
          <div className="flex items-center gap-3">
            <StatusBadge status={pnode.status} />
            <h1 className="text-2xl font-bold tracking-tight">
              {pnode.identity || "pNode Details"}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{pnode.publicKey}</span>
            <CopyButton value={pnode.publicKey} />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Last seen: {formatTimeAgo(pnode.lastSeen)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Server className="h-4 w-4" />
            Version: {pnode.version}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Uptime"
          value={formatPercentage(pnode.uptime)}
          icon={Activity}
        />
        <MetricCard
          title="Storage Used"
          value={formatBytes(pnode.storageUsed)}
          description={`of ${formatBytes(pnode.storageCapacity)}`}
          icon={HardDrive}
        />
        <MetricCard
          title="Shards Available"
          value={`${pnode.shardsAvailable} / ${pnode.shardsTotal}`}
          description={formatPercentage(pnode.shardAvailability)}
          icon={Layers}
        />
        <MetricCard
          title="Latency"
          value={formatLatency(pnode.latency)}
          icon={Zap}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Uptime History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Uptime History (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history && history.length > 0 ? (
              <UptimeChart data={history} height={250} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No history data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StorageChart
              used={pnode.storageUsed}
              total={pnode.storageCapacity}
              height={250}
            />
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Gossip Address</p>
              <p className="font-mono text-sm mt-1">{pnode.gossipAddress}</p>
            </div>
            {pnode.region && (
              <div>
                <p className="text-sm text-muted-foreground">Region</p>
                <p className="flex items-center gap-2 mt-1">
                  <Globe className="h-4 w-4" />
                  {pnode.region}
                </p>
              </div>
            )}
            {pnode.dataCenter && (
              <div>
                <p className="text-sm text-muted-foreground">Data Center</p>
                <p className="flex items-center gap-2 mt-1">
                  <Server className="h-4 w-4" />
                  {pnode.dataCenter}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Activated</p>
              <p className="mt-1">
                {new Date(pnode.activatedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Storage Utilization
              </p>
              <p className="mt-1">
                {formatPercentage(pnode.storageUtilization)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shard Availability</p>
              <p className="mt-1">
                {formatPercentage(pnode.shardAvailability)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
