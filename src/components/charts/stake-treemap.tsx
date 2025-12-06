"use client";

import { useMemo } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

interface StakeNode {
  publicKey: string;
  name: string;
  stake: number;
  status: "active" | "inactive" | "delinquent";
}

interface StakeTreemapProps {
  nodes: StakeNode[];
  className?: string;
}

const COLORS = {
  active: [
    "hsl(142, 76%, 36%)",
    "hsl(142, 70%, 40%)",
    "hsl(142, 65%, 45%)",
    "hsl(142, 60%, 50%)",
    "hsl(142, 55%, 55%)",
  ],
  delinquent: [
    "hsl(38, 92%, 50%)",
    "hsl(38, 85%, 55%)",
    "hsl(38, 80%, 60%)",
  ],
  inactive: [
    "hsl(0, 84%, 60%)",
    "hsl(0, 75%, 65%)",
  ],
};

interface TreemapContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  value: number;
  status: string;
  index: number;
}

const CustomContent = ({
  x,
  y,
  width,
  height,
  name,
  value,
  status,
  index,
}: TreemapContentProps) => {
  const colors = COLORS[status as keyof typeof COLORS] || COLORS.active;
  const color = colors[index % colors.length];
  const showLabel = width > 50 && height > 30;
  const showValue = width > 70 && height > 45;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="hsl(var(--background))"
        strokeWidth={2}
        rx={4}
        className="transition-opacity hover:opacity-80 cursor-pointer"
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showValue ? 8 : 0)}
          textAnchor="middle"
          fill="#fff"
          fontSize={11}
          fontWeight={600}
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
        >
          {name.length > 10 ? `${name.slice(0, 4)}...${name.slice(-4)}` : name}
        </text>
      )}
      {showValue && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 12}
          textAnchor="middle"
          fill="rgba(255,255,255,0.8)"
          fontSize={10}
        >
          {formatStake(value)}
        </text>
      )}
    </g>
  );
};

function formatStake(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

interface TooltipPayload {
  payload: {
    name: string;
    value: number;
    status: string;
    publicKey: string;
  };
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-sm">
      <p className="font-medium text-foreground">{data.name}</p>
      <p className="text-muted-foreground text-xs mt-1 font-mono">
        {data.publicKey}
      </p>
      <div className="flex items-center justify-between mt-2 gap-4">
        <span className="text-muted-foreground">Storage:</span>
        <span className="font-semibold">{formatStake(data.value)} MB</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Status:</span>
        <span
          className={`capitalize font-medium ${
            data.status === "active"
              ? "text-green-500"
              : data.status === "delinquent"
              ? "text-yellow-500"
              : "text-red-500"
          }`}
        >
          {data.status}
        </span>
      </div>
    </div>
  );
};

export function StakeTreemap({ nodes, className = "" }: StakeTreemapProps) {
  const data = useMemo(() => {
    // Sort by stake descending and take top nodes
    const sorted = [...nodes].sort((a, b) => b.stake - a.stake);

    return sorted.map((node, index) => ({
      name: node.name || `${node.publicKey.slice(0, 4)}...${node.publicKey.slice(-4)}`,
      value: node.stake,
      status: node.status,
      publicKey: node.publicKey,
      index,
    }));
  }, [nodes]);

  const totalStake = useMemo(
    () => nodes.reduce((sum, n) => sum + n.stake, 0),
    [nodes]
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Total Storage: <span className="font-semibold text-foreground">{formatStake(totalStake)} MB</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-500" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-yellow-500" />
            <span>Delinquent</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <Treemap
          data={data}
          dataKey="value"
          aspectRatio={4 / 3}
          stroke="hsl(var(--background))"
          content={<CustomContent x={0} y={0} width={0} height={0} name="" value={0} status="" index={0} />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
