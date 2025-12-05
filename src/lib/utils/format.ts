export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatNumber(num: number, decimals = 2): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + "K";
  }
  return num.toFixed(decimals);
}

export function formatPercentage(value: number, decimals = 1): string {
  return value.toFixed(decimals) + "%";
}

export function formatLatency(ms: number): string {
  if (ms < 1) {
    return "<1ms";
  }
  return Math.round(ms) + "ms";
}

export function truncatePublicKey(key: string, chars = 4): string {
  if (key.length <= chars * 2 + 3) return key;
  return `${key.slice(0, chars)}...${key.slice(-chars)}`;
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
