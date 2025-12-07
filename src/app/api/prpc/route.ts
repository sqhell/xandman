import { NextRequest, NextResponse } from "next/server";
import http from "http";

// pRPC server-side proxy to bypass browser/fetch port 6000 blocking
// Uses Node.js native http module which doesn't have port restrictions

interface PNodeStats {
  active_streams: number;
  cpu_percent: number;
  current_index: number;
  file_size: number;
  last_updated: number;
  packets_received: number;
  packets_sent: number;
  ram_total: number;
  ram_used: number;
  total_bytes: number;
  total_pages: number;
  uptime: number;
}

interface PRpcResponse {
  jsonrpc: string;
  id: number;
  result: PNodeStats | null;
  error: { code: number; message: string } | null;
}

// Known pNodes with open pRPC ports (port 6000)
const OPEN_PRPC_NODES = [
  "173.212.203.145",
  "173.212.220.65",
  "161.97.97.41",
  "192.190.136.36",
  "192.190.136.37",
  "192.190.136.38",
  "192.190.136.28",
  "192.190.136.29",
  "207.244.255.1",
];

// Validate IP is in our allowed list
function isValidPNodeIP(ip: string): boolean {
  return OPEN_PRPC_NODES.includes(ip);
}

// GET /api/prpc?ip=192.190.136.36 - Get stats for a specific pNode
// GET /api/prpc?all=true - Get stats for all pNodes
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ip = searchParams.get("ip");
  const all = searchParams.get("all");

  if (all === "true") {
    // Fetch all pNodes in parallel
    const results = await Promise.allSettled(
      OPEN_PRPC_NODES.map(async (nodeIp) => {
        const stats = await fetchPNodeStats(nodeIp);
        return stats ? { ip: nodeIp, stats } : null;
      })
    );

    const nodes = results
      .filter(
        (r): r is PromiseFulfilledResult<{ ip: string; stats: PNodeStats }> =>
          r.status === "fulfilled" && r.value !== null
      )
      .map((r) => r.value);

    return NextResponse.json({
      success: true,
      totalNodes: OPEN_PRPC_NODES.length,
      activeNodes: nodes.length,
      nodes,
    });
  }

  if (!ip) {
    return NextResponse.json(
      { error: "Missing 'ip' parameter. Use ?ip=<ip_address> or ?all=true" },
      { status: 400 }
    );
  }

  if (!isValidPNodeIP(ip)) {
    return NextResponse.json(
      { error: "Invalid pNode IP address" },
      { status: 400 }
    );
  }

  const stats = await fetchPNodeStats(ip);

  if (!stats) {
    return NextResponse.json(
      { error: "Failed to fetch pNode stats", ip },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true, ip, stats });
}

// Use native http module to bypass port restrictions in fetch/undici
function fetchPNodeStats(ip: string): Promise<PNodeStats | null> {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      jsonrpc: "2.0",
      method: "get-stats",
      id: 1,
    });

    const options: http.RequestOptions = {
      hostname: ip,
      port: 6000,
      path: "/rpc",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsed: PRpcResponse = JSON.parse(data);
          resolve(parsed.result);
        } catch {
          resolve(null);
        }
      });
    });

    req.on("error", (error) => {
      console.error(`pRPC proxy error for ${ip}:`, error.message);
      resolve(null);
    });

    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}
