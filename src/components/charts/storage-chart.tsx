"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatBytes } from "@/lib/utils";

interface StorageChartProps {
  used: number;
  total: number;
  height?: number;
}

export function StorageChart({ used, total, height = 200 }: StorageChartProps) {
  const free = total - used;
  const usedPercent = ((used / total) * 100).toFixed(1);

  const data = [
    { name: "Used", value: used, color: "hsl(263, 70%, 50%)" },
    { name: "Free", value: free, color: "hsl(217, 33%, 17%)" },
  ];

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(222, 84%, 5%)",
              border: "1px solid hsl(217, 33%, 17%)",
              borderRadius: "8px",
              color: "hsl(210, 40%, 98%)",
            }}
            formatter={(value: number) => formatBytes(value)}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-4">
        <p className="text-2xl font-bold">{usedPercent}%</p>
        <p className="text-sm text-muted-foreground">
          {formatBytes(used)} / {formatBytes(total)}
        </p>
      </div>
    </div>
  );
}
