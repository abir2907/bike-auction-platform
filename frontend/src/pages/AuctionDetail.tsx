import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Gavel, Users, Wifi, WifiOff, Trophy, ShieldCheck, MapPin, Clock, TrendingUp, Lock,
} from 'lucide-react';
import { clsx } from 'clsx';
import { auctionsService } from '@/services/auctions.service';
import { useAuctionSocket, BidEvent, StatusEvent } from '@/hooks/useAuctionSocket';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState, AuctionBadge } from '@/components/ui/Misc';
import { SmartImage } from '@/components/ui/SmartImage';
import { Button } from '@/components/ui/Button';
import { CountdownBoxes } from '@/components/auctions/Countdown';
import { formatINR, timeAgo } from '@/lib/format';
import type { Bid } from '@/types';

interface LiveBid {
  id: string;
  amount: number;
  bidderName: string;
  createdAt: string;
}

export default function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, status: authStatus } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: auction, isLoading, isError } = useQuery({
    queryKey: ['auction', id],
    queryFn: () => auctionsService.getById(id!),
    enabled: !!id,
  });
  const { data: initialBids } = useQuery({
    queryKey: ['auction-bids', id],
    queryFn: () => auctionsService.bids(id!),
    enabled: !!id,
  });

  // Live, server-authoritative state mirrored locally.
  const [currentPrice, setCurrentPrice] = useState(0);
  const [totalBids, setTotalBids] = useState(0);
  const [endTime, setEndTime] = useState('');
  const [statusVal, setStatusVal] = useState('');
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [bids, setBids] = useState<LiveBid[]>([]);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!auction) return;
    setCurrentPrice(Number(auction.currentPrice));
    setTotalBids(auction.totalBids);
    setEndTime(auction.endTime);
    setStatusVal(auction.status);
    setWinnerId(auction.winnerId ?? null);
  }, [auction]);

  useEffect(() => {
    if (initialBids) {
      setBids(
        initialBids.map((b: Bid) => ({
          id: b.id,
          amount: Number(b.amount),
          bidderName: b.bidder?.name ?? 'Bidder',
          createdAt: b.createdAt,
        })),
      );
    }
  }, [initialBids]);

  const onBid = (e: BidEvent) => {
    setCurrentPrice(e.currentPrice);
    setTotalBids(e.totalBids);
    setEndTime(e.endTime);
    setBids((prev) => [{ id: e.bid.id, amount: e.bid.amount, bidderName: e.bid.bidderName, createdAt: e.bid.createdAt }, ...prev].slice(0, 50));
    if (e.extended) toast('⏱️ Auction extended — anti-sniping in effect', 'info');
  };
  const onStatus = (e: StatusEvent) => {
    setStatusVal(e.status);
    if (e.status === 'SETTLED') {
      setWinnerId(e.winnerId ?? null);
      if (e.finalPrice) setCurrentPrice(e.finalPrice);
    }
  };

  const { connected, placeBid } = useAuctionSocket(id, { onBid, onStatus });

  const bidIncrement = auction ? Number(auction.bidIncrement) : 500;
  const minNextBid = useMemo(
    () => (totalBids === 0 ? Number(auction?.startingPrice ?? currentPrice) : currentPrice + bidIncrement),
    [totalBids, currentPrice, bidIncrement, auction],
  );

  useEffect(() => {
    setAmount(String(minNextBid));
  }, [minNextBid]);

  if (isLoading) return <PageLoader />;
  if (isError || !auction)
    return (
      <div className="container-page py-16">
        <EmptyState title="Auction not found" description="It may have been removed." action={<Link to="/auctions" className="btn-primary mt-2">All auctions</Link>} />
      </div>
    );

  const v = auction.vehicle!;
  const primary = v.images?.find((i) => i.isPrimary) ?? v.images?.[0];
  const isLive = statusVal === 'LIVE';
  const isSeller = user?.id === v.seller?.id;
  const isAdmin = user?.role === 'ADMIN';
  const iAmWinner = winnerId && user?.id === winnerId;

  const submit = async () => {
    if (authStatus !== 'authenticated') {
      navigate('/login', { state: { from: `/auctions/${id}` } });
      return;
    }
    if (isAdmin) {
      toast('Admin accounts cannot place bids', 'error');
      return;
    }
    const value = Number(amount);
    if (!value || value < minNextBid) {
      toast(`Minimum bid is ${formatINR(minNextBid)}`, 'error');
      return;
    }
    setSubmitting(true);
    const res = await placeBid(value);
    setSubmitting(false);
    if (res.ok) toast('Bid placed! You are the highest bidder.', 'success');
    else toast(res.error || 'Could not place bid', 'error');
  };

  const quickAdds = [bidIncrement, bidIncrement * 2, bidIncrement * 5];

  return (
    <div className="bg-surface">
      <div className="container-page py-6">
        <nav className="mb-4 text-sm text-ink-muted">
          <Link to="/auctions" className="hover:text-brand">Auctions</Link> <span>/</span>{' '}
          <span className="text-ink-soft">{v.title}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Left: media + details */}
          <div className="space-y-6">
            <div className="card overflow-hidden">
              <div className="relative aspect-[16/10] bg-surface">
                <SmartImage src={primary?.url} alt={v.title} label={`${v.brand} ${v.model}`} />
                <div className="absolute left-3 top-3 z-10"><AuctionBadge status={statusVal as never} /></div>
              </div>
              {v.images.length > 1 && (
                <div className="no-scrollbar flex gap-2 overflow-x-auto p-3">
                  {v.images.slice(0, 6).map((img) => (
                    <div key={img.id} className="h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                      <SmartImage src={img.url} alt="" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <section className="card p-6">
              <h1 className="text-2xl font-extrabold">{v.title}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
                <MapPin className="h-4 w-4" /> {v.city} · {v.year} · {v.fuelType.toLowerCase()}
              </p>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-ink-soft">{v.description}</p>
            </section>
          </div>

          {/* Right: bidding panel */}
          <aside className="space-y-5">
            <div className="card p-6 lg:sticky lg:top-24">
              {/* Connection + status */}
              <div className="flex items-center justify-between">
                <span className={clsx('inline-flex items-center gap-1.5 text-xs font-semibold', connected ? 'text-success' : 'text-ink-muted')}>
                  {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                  {connected ? 'Live connected' : 'Connecting…'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                  <Users className="h-3.5 w-3.5" /> {totalBids} bids
                </span>
              </div>

              {/* Current price */}
              <div className="mt-4 rounded-2xl bg-night p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                  {totalBids > 0 ? 'Current highest bid' : 'Starting price'}
                </p>
                <p className="mt-1 text-4xl font-extrabold tabular-nums">{formatINR(currentPrice)}</p>
                <div className="mt-2 flex items-center gap-2 text-sm text-white/70">
                  {auction.reservePrice ? (
                    auction.reserveMet || currentPrice >= Number(auction.reservePrice) ? (
                      <span className="inline-flex items-center gap-1 text-success"><ShieldCheck className="h-4 w-4" /> Reserve met</span>
                    ) : (
                      <span className="inline-flex items-center gap-1"><Lock className="h-4 w-4" /> Reserve not met</span>
                    )
                  ) : (
                    <span>No reserve</span>
                  )}
                </div>
              </div>

              {/* Countdown / outcome */}
              <div className="mt-5">
                {statusVal === 'SCHEDULED' && (
                  <>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-soft"><Clock className="h-4 w-4" /> Auction starts in</p>
                    <CountdownBoxes endTime={auction.startTime} />
                  </>
                )}
                {isLive && (
                  <>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-soft"><Clock className="h-4 w-4" /> Time remaining</p>
                    <CountdownBoxes endTime={endTime} />
                  </>
                )}
                {(statusVal === 'SETTLED' || statusVal === 'ENDED') && (
                  <div className={clsx('rounded-xl p-4', iAmWinner ? 'bg-success-soft' : 'bg-surface')}>
                    {winnerId ? (
                      <p className="flex items-center gap-2 font-bold text-ink">
                        <Trophy className="h-5 w-5 text-accent" />
                        {iAmWinner ? 'Congratulations — you won!' : 'Auction won'} at {formatINR(currentPrice)}
                      </p>
                    ) : (
                      <p className="font-semibold text-ink-soft">Auction ended — reserve not met.</p>
                    )}
                  </div>
                )}
                {statusVal === 'CANCELLED' && <p className="badge-danger">This auction was cancelled</p>}
              </div>

              {/* Bid form */}
              {isLive && (
                <div className="mt-5 border-t border-line pt-5">
                  {isAdmin ? (
                    <p className="rounded-xl bg-surface p-4 text-center text-sm text-ink-muted">
                      Admin accounts cannot place bids.
                    </p>
                  ) : isSeller ? (
                    <p className="rounded-xl bg-surface p-4 text-center text-sm text-ink-muted">
                      You can't bid on your own vehicle.
                    </p>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {quickAdds.map((add) => (
                          <button
                            key={add}
                            onClick={() => setAmount(String(currentPrice + add))}
                            className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-ink-soft hover:border-brand hover:text-brand"
                          >
                            +{formatINR(add)}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2 rounded-xl border border-line-strong px-3">
                        <span className="text-ink-muted">₹</span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          step={bidIncrement}
                          min={minNextBid}
                          className="w-full bg-transparent py-3 text-lg font-bold outline-none"
                          aria-label="Bid amount"
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-ink-muted">
                        Enter {formatINR(minNextBid)} or more (increment {formatINR(bidIncrement)}).
                      </p>
                      <Button onClick={submit} loading={submitting} fullWidth size="lg" variant="accent" className="mt-3">
                        <Gavel className="h-4 w-4" />
                        {authStatus === 'authenticated' ? 'Place bid' : 'Log in to bid'}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Bid history */}
            <div className="card p-6">
              <h3 className="flex items-center gap-2 font-bold"><TrendingUp className="h-5 w-5 text-brand" /> Bid history</h3>
              <ul className="mt-4 space-y-1">
                {bids.length === 0 && <li className="py-6 text-center text-sm text-ink-muted">No bids yet — be the first!</li>}
                {bids.map((b, i) => (
                  <li key={b.id} className={clsx('flex items-center justify-between rounded-lg px-3 py-2.5 text-sm', i === 0 && 'bg-success-soft')}>
                    <span className="flex items-center gap-2 font-semibold">
                      {i === 0 && <Trophy className="h-4 w-4 text-accent" />}
                      {b.bidderName}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="font-extrabold tabular-nums">{formatINR(b.amount)}</span>
                      <span className="text-xs text-ink-muted">{timeAgo(b.createdAt)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
