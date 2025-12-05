"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/status-badge";
import { CopyButton } from "@/components/common/copy-button";
import { usePNodes } from "@/features/pnodes/hooks/use-pnodes";
import {
  formatBytes,
  formatPercentage,
  formatLatency,
  truncatePublicKey,
} from "@/lib/utils";
import type { PNodeFilters } from "@/features/pnodes/types";

const REGIONS = [
  "All Regions",
  "US-East",
  "US-West",
  "EU-West",
  "EU-Central",
  "Asia-Pacific",
  "South America",
];

export default function PNodesPage() {
  const [filters, setFilters] = useState<PNodeFilters>({
    status: "all",
    page: 1,
    limit: 25,
  });
  const [search, setSearch] = useState("");

  const { data, isLoading } = usePNodes({
    ...filters,
    search: search || undefined,
  });

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      status: e.target.value as PNodeFilters["status"],
      page: 1,
    }));
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      region: e.target.value === "All Regions" ? undefined : e.target.value,
      page: 1,
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">pNodes</h1>
        <p className="text-muted-foreground mt-2">
          Browse and search all pNodes in the Xandeum network
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by public key or identity..."
            value={search}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filters.status} onChange={handleStatusChange}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="delinquent">Delinquent</option>
          </Select>
          <Select
            value={filters.region || "All Regions"}
            onChange={handleRegionChange}
          >
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && data && (
        <p className="text-sm text-muted-foreground">
          Showing {data.pnodes.length} of {data.total} pNodes
        </p>
      )}

      {/* pNode List */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(10)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="flex items-center gap-6">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : data?.pnodes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No pNodes found matching your criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          data?.pnodes.map((pnode) => (
            <Link key={pnode.publicKey} href={`/pnodes/${pnode.publicKey}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <StatusBadge status={pnode.status} />
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {truncatePublicKey(pnode.publicKey, 8)}
                        </span>
                        <CopyButton value={pnode.publicKey} />
                      </div>
                      {pnode.identity && (
                        <span className="text-sm text-muted-foreground">
                          ({pnode.identity})
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                      <div className="flex flex-col items-end">
                        <span className="text-muted-foreground text-xs">
                          Uptime
                        </span>
                        <span className="font-medium">
                          {formatPercentage(pnode.uptime)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-muted-foreground text-xs">
                          Storage
                        </span>
                        <span className="font-medium">
                          {formatBytes(pnode.storageUsed)} /{" "}
                          {formatBytes(pnode.storageCapacity)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-muted-foreground text-xs">
                          Latency
                        </span>
                        <span className="font-medium">
                          {formatLatency(pnode.latency)}
                        </span>
                      </div>
                      {pnode.region && (
                        <div className="flex flex-col items-end">
                          <span className="text-muted-foreground text-xs">
                            Region
                          </span>
                          <span className="font-medium">{pnode.region}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.total > (filters.limit || 25) && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange((filters.page || 1) - 1)}
            disabled={(filters.page || 1) <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {filters.page || 1} of{" "}
            {Math.ceil(data.total / (filters.limit || 25))}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange((filters.page || 1) + 1)}
            disabled={!data.hasMore}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
