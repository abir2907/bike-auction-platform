import { ReactNode } from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';
import type { AuctionStatus, ListingStatus } from '@/types';

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {icon && <div className="rounded-2xl bg-brand-50 p-4 text-brand">{icon}</div>}
      <h3 className="text-lg font-bold">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      {action}
    </div>
  );
}

export function RatingStars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={clsx('flex gap-0.5', className)} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={clsx('h-4 w-4', i < rating ? 'fill-accent text-accent' : 'text-line-strong')} />
      ))}
    </div>
  );
}

const auctionStyles: Record<AuctionStatus, string> = {
  LIVE: 'badge-success animate-pulse-ring',
  SCHEDULED: 'badge-accent',
  ENDED: 'badge-muted',
  SETTLED: 'badge-brand',
  CANCELLED: 'badge-danger',
};
export function AuctionBadge({ status }: { status: AuctionStatus }) {
  const label = status === 'LIVE' ? 'Live now' : status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span className={auctionStyles[status]}>
      {status === 'LIVE' && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
      {label}
    </span>
  );
}

const listingStyles: Record<ListingStatus, string> = {
  ACTIVE: 'badge-success',
  PENDING: 'badge-accent',
  DRAFT: 'badge-muted',
  SOLD: 'badge-brand',
  REJECTED: 'badge-danger',
  ARCHIVED: 'badge-muted',
};
export function ListingBadge({ status }: { status: ListingStatus }) {
  return <span className={listingStyles[status]}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('skeleton rounded-xl', className)} />;
}
