import { Link } from 'react-router-dom';
import { Calendar, Fuel, Gauge, MapPin, Heart } from 'lucide-react';
import { clsx } from 'clsx';
import type { Vehicle } from '@/types';
import { formatINR, formatKm, ownerLabel } from '@/lib/format';
import { AuctionBadge } from '@/components/ui/Misc';
import { SmartImage } from '@/components/ui/SmartImage';

interface Props {
  vehicle: Vehicle;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
  view?: 'grid' | 'list';
}

export function VehicleCard({ vehicle, saved, onToggleSave, view = 'grid' }: Props) {
  const primary = vehicle.images?.find((i) => i.isPrimary) ?? vehicle.images?.[0];
  const isAuction = vehicle.listingType === 'AUCTION' && vehicle.auction;
  const href = isAuction ? `/auctions/${vehicle.auction!.id}` : `/buy/${vehicle.slug}`;
  const price = isAuction ? Number(vehicle.auction!.currentPrice) : Number(vehicle.price);

  return (
    <article className={clsx('card-hover group flex overflow-hidden', view === 'grid' ? 'flex-col' : 'flex-col sm:flex-row')}>
      <Link to={href} className={clsx('relative block overflow-hidden bg-surface', view === 'grid' ? 'aspect-[4/3]' : 'aspect-[4/3] sm:w-64 sm:shrink-0')}>
        <SmartImage src={primary?.url} alt={vehicle.title} label={`${vehicle.brand} ${vehicle.model}`} zoom />
        <div className="absolute left-3 top-3 flex gap-2">
          {isAuction ? <AuctionBadge status={vehicle.auction!.status} /> : null}
          {vehicle.featured && !isAuction && <span className="badge-accent">Featured</span>}
        </div>
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleSave(vehicle.id);
            }}
            aria-label={saved ? 'Remove from saved' : 'Save bike'}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-soft backdrop-blur transition hover:scale-110"
          >
            <Heart className={clsx('h-4 w-4', saved ? 'fill-danger text-danger' : 'text-ink-soft')} />
          </button>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
          <span>{vehicle.year}</span>
          <span className="h-1 w-1 rounded-full bg-line-strong" />
          <span>{ownerLabel(vehicle.ownerCount)}</span>
          <span className="h-1 w-1 rounded-full bg-line-strong" />
          <span className="inline-flex items-center gap-1 capitalize">
            <Fuel className="h-3.5 w-3.5" />
            {vehicle.fuelType.toLowerCase()}
          </span>
        </div>

        <Link to={href} className="mt-1.5">
          <h3 className="line-clamp-1 text-base font-bold transition group-hover:text-brand">{vehicle.title}</h3>
        </Link>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {formatKm(vehicle.kmDriven)}</span>
          <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {vehicle.year}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {vehicle.city}</span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            {isAuction && <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Current bid</p>}
            <p className="text-xl font-extrabold text-ink">{formatINR(price)}</p>
          </div>
          <Link to={href} className="btn-outline btn-sm">
            {isAuction ? 'Bid now' : 'View'}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function VehicleCardSkeleton({ view = 'grid' }: { view?: 'grid' | 'list' }) {
  return (
    <div className={clsx('card overflow-hidden', view === 'list' && 'sm:flex')}>
      <div className={clsx('skeleton', view === 'grid' ? 'aspect-[4/3]' : 'aspect-[4/3] sm:w-64')} />
      <div className="space-y-3 p-4">
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="skeleton h-7 w-1/3 rounded" />
      </div>
    </div>
  );
}
