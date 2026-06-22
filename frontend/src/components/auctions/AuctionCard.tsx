import { Link } from 'react-router-dom';
import { Clock, Gavel, MapPin } from 'lucide-react';
import type { Auction } from '@/types';
import { formatINR } from '@/lib/format';
import { AuctionBadge } from '@/components/ui/Misc';
import { CountdownInline } from './Countdown';

export function AuctionCard({ auction }: { auction: Auction }) {
  const v = auction.vehicle;
  const primary = v?.images?.find((i) => i.isPrimary) ?? v?.images?.[0];

  return (
    <article className="card-hover group flex flex-col overflow-hidden">
      <Link to={`/auctions/${auction.id}`} className="relative block aspect-[4/3] overflow-hidden bg-surface">
        {primary ? (
          <img src={primary.url} alt={v?.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center text-ink-muted">No image</div>
        )}
        <div className="absolute left-3 top-3">
          <AuctionBadge status={auction.status} />
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs shadow-soft backdrop-blur">
          <Clock className="h-3.5 w-3.5 text-ink-muted" />
          {auction.status === 'SCHEDULED' ? (
            <CountdownInline endTime={auction.startTime} prefix="Starts in " />
          ) : auction.status === 'LIVE' ? (
            <CountdownInline endTime={auction.endTime} />
          ) : (
            <span className="font-semibold text-ink-muted">Closed</span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/auctions/${auction.id}`}>
          <h3 className="line-clamp-1 text-base font-bold transition group-hover:text-brand">{v?.title}</h3>
        </Link>
        <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
          <MapPin className="h-3.5 w-3.5" /> {v?.city} · {v?.year}
        </p>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              {auction.totalBids > 0 ? `Current bid · ${auction.totalBids} bids` : 'Starting price'}
            </p>
            <p className="text-xl font-extrabold">{formatINR(auction.currentPrice)}</p>
          </div>
          <Link to={`/auctions/${auction.id}`} className="btn-accent btn-sm">
            <Gavel className="h-4 w-4" /> {auction.status === 'LIVE' ? 'Bid' : 'View'}
          </Link>
        </div>
      </div>
    </article>
  );
}
