"use client";

import { useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface NodeLocation {
  publicKey: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  status: "active" | "inactive" | "delinquent";
  stake?: number;
}

interface WorldMapProps {
  nodes: NodeLocation[];
  className?: string;
}

export function WorldMap({ nodes, className = "" }: WorldMapProps) {
  const markers = useMemo(() => nodes, [nodes]);

  return (
    <div className={`relative ${className}`}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [0, 30],
        }}
        style={{
          width: "100%",
          height: "auto",
        }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "hsl(var(--muted-foreground) / 0.3)" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {markers.map((node) => (
            <Marker key={node.publicKey} coordinates={node.coordinates}>
              <circle
                r={node.stake ? Math.max(4, Math.min(12, node.stake / 1000)) : 5}
                fill={
                  node.status === "active"
                    ? "hsl(142.1 76.2% 36.3%)"
                    : node.status === "delinquent"
                    ? "hsl(38 92% 50%)"
                    : "hsl(0 84.2% 60.2%)"
                }
                stroke="#fff"
                strokeWidth={1.5}
                className="cursor-pointer transition-all hover:opacity-80"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                }}
              />
              <title>
                {node.name}
                {node.stake ? ` - ${node.stake.toLocaleString()} stake` : ""}
              </title>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 text-xs space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Delinquent</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span>Inactive</span>
        </div>
      </div>
    </div>
  );
}
