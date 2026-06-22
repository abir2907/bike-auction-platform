import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gavel } from 'lucide-react';
import { clsx } from 'clsx';
import { auctionsService } from '@/services/auctions.service';
import { AuctionCard } from '@/components/auctions/AuctionCard';
import { VehicleCardSkeleton } from '@/components/vehicles/VehicleCard';
import { EmptyState } from '@/components/ui/Misc';

const tabs = [
  { key: 'LIVE', label: 'Live now' },
  { key: 'SCHEDULED', label: 'Upcoming' },
  { key: 'SETTLED', label: 'Completed' },
] as const;

export default function AuctionsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]['key']>('LIVE');

  const { data, isLoading } = useQuery({
    queryKey: ['auctions', tab],
    queryFn: () => auctionsService.list({ status: tab, limit: 24 }),
  });

  return (
    <div className="bg-surface">
      <div className="container-page py-8">
        <header className="mb-6">
          <span className="badge-accent"><Gavel className="h-3.5 w-3.5" /> Live bidding</span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Auctions</h1>
          <p className="mt-1 text-ink-muted">Bid in real time on inspected bikes. Highest bid above reserve wins.</p>
        </header>

        <div className="mb-6 inline-flex gap-1 rounded-xl border border-line bg-card p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'rounded-lg px-4 py-2 text-sm font-semibold transition',
                tab === t.key ? 'bg-brand text-white shadow-soft' : 'text-ink-soft hover:bg-surface',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        ) : !data?.items.length ? (
          <EmptyState
            icon={<Gavel className="h-7 w-7" />}
            title={tab === 'LIVE' ? 'No live auctions right now' : tab === 'SCHEDULED' ? 'No upcoming auctions' : 'No completed auctions yet'}
            description="Check back soon — new auctions go live regularly."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((a) => (
              <AuctionCard key={a.id} auction={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
