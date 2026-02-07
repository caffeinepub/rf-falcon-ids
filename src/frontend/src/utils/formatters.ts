export function formatOrderStatus(status: string): string {
  if (!status) return '';
  const statusStr = typeof status === 'string' ? status : String(status);
  return statusStr.charAt(0).toUpperCase() + statusStr.slice(1);
}

export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000);
  return date.toLocaleString();
}
