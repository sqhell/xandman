"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import type { UptimeDataPoint } from "@/features/pnodes/types";

interface UptimeChartProps {
  data: UptimeDataPoint[];
  height?: number;
}

export function UptimeChart({ data, height = 300 }: UptimeChartProps) {
  const formattedData = data.map((point) => ({
    ...point,
    date: format(new Date(point.timestamp), "MMM d"),
    uptimeFormatted: point.uptime.toFixed(2),
  }));

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
          />
          <YAxis
            domain={[90, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(222, 84%, 5%)",
              border: "1px solid hsl(217, 33%, 17%)",
              borderRadius: "8px",
              color: "hsl(210, 40%, 98%)",
            }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, "Uptime"]}
          />
          <Area
            type="monotone"
            dataKey="uptime"
            stroke="hsl(263, 70%, 50%)"
            fill="url(#uptimeGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
