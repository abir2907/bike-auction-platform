import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Gavel, Trophy } from 'lucide-react';
import { usersService } from '@/services/misc.service';
import { EmptyState, AuctionBadge } from '@/components/ui/Misc';
import { PageLoader } from '@/components/ui/Spinner';
import { formatINR } from '@/lib/format';
import type { Auction } from '@/types';

interface MyBidRow {
  auction: Auction;
  myLastBid: string;
  isWinning: boolean;
  isWinner: boolean;
}

export default function MyBids() {
  const { data = [], isLoading } = useQuery({ queryKey: ['my-bids'], queryFn: usersService.bids });
  const rows = data as unknown as MyBidRow[];

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">My bids</h1>
      {rows.length === 0 ? (
        <EmptyState
          icon={<Gavel className="h-7 w-7" />}
          title="No bids yet"
          description="Join a live auction and place your first bid."
          action={<Link to="/auctions" className="btn-primary mt-2">Browse auctions</Link>}
        />
      ) : (
        <div className="space-y-3">
          {rows.map(({ auction, myLastBid, isWinning, isWinner }) => {
            const v = auction.vehicle;
            return (
              <Link key={auction.id} to={`/auctions/${auction.id}`} className="card-hover flex items-center gap-4 p-4">
                <img src={v?.images?.[0]?.url} alt="" className="h-16 w-24 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-bold">{v?.title}</h3>
                    <AuctionBadge status={auction.status} />
                    {isWinner && <span className="badge-success"><Trophy className="h-3.5 w-3.5" /> Won</span>}
                    {!isWinner && isWinning && auction.status === 'LIVE' && <span className="badge-success">Winning</span>}
                    {!isWinning && auction.status === 'LIVE' && <span className="badge-danger">Outbid</span>}
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">
                    Your bid: <strong className="text-ink">{formatINR(myLastBid)}</strong> · Current: {formatINR(auction.currentPrice)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
