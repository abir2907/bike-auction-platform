/** Indian-rupee currency formatting (₹1,42,000) used across the app. */
export function formatINR(value: number | string, opts: { compact?: boolean } = {}): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(n)) return '₹0';
  if (opts.compact && n >= 100000) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    return `₹${(n / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatKm(km: number): string {
  return `${formatNumber(km)} km`;
}

export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(value: string | Date): string {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function ownerLabel(count: number): string {
  const map: Record<number, string> = { 1: '1st owner', 2: '2nd owner', 3: '3rd owner' };
  return map[count] ?? `${count}th owner`;
}
