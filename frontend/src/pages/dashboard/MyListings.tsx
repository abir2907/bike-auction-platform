import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pencil, Trash2, Plus, ListChecks, Eye, Gavel } from 'lucide-react';
import { vehiclesService } from '@/services/vehicles.service';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/api';
import { ListingBadge, EmptyState } from '@/components/ui/Misc';
import { SmartImage } from '@/components/ui/SmartImage';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { CreateAuctionModal } from '@/components/auctions/CreateAuctionModal';
import { formatINR, formatKm } from '@/lib/format';
import type { Vehicle } from '@/types';

export default function MyListings() {
  const qc = useQueryClient();
  const toast = useToast();
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [auctionFor, setAuctionFor] = useState<Vehicle | null>(null);

  const { data: listings = [], isLoading } = useQuery({ queryKey: ['my-listings'], queryFn: vehiclesService.mine });

  const del = useMutation({
    mutationFn: (id: string) => vehiclesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-listings'] });
      toast('Listing deleted', 'success');
      setToDelete(null);
    },
    onError: (e) => toast(getApiErrorMessage(e), 'error'),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">My listings</h1>
        <Link to="/dashboard/listings/new" className="btn-accent"><Plus className="h-4 w-4" /> New listing</Link>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="h-7 w-7" />}
          title="No listings yet"
          description="List your two-wheeler in a couple of minutes and reach thousands of buyers."
          action={<Link to="/dashboard/listings/new" className="btn-primary mt-2">Create your first listing</Link>}
        />
      ) : (
        <div className="space-y-3">
          {listings.map((v) => (
            <div key={v.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl sm:w-36">
                <SmartImage src={v.images?.[0]?.url} alt="" label={`${v.brand} ${v.model}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    to={v.status === 'ACTIVE' ? `/buy/${v.slug}` : `/dashboard/listings/${v.id}/edit`}
                    className="truncate font-bold transition hover:text-brand"
                  >
                    {v.title}
                  </Link>
                  <ListingBadge status={v.status} />
                </div>
                <p className="mt-1 text-sm text-ink-muted">{v.year} · {formatKm(v.kmDriven)} · {v.city}</p>
                <p className="mt-1 text-lg font-extrabold text-brand">{formatINR(v.price)}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted"><Eye className="h-3.5 w-3.5" /> {v.viewCount} views</p>
              </div>
              <div className="flex gap-2 sm:flex-col lg:flex-row">
                {v.listingType === 'AUCTION' && !v.auction && (
                  <button onClick={() => setAuctionFor(v)} className="btn-accent btn-sm"><Gavel className="h-4 w-4" /> Create auction</button>
                )}
                <Link to={`/dashboard/listings/${v.id}/edit`} className="btn-outline btn-sm"><Pencil className="h-4 w-4" /> Edit</Link>
                <button onClick={() => setToDelete(v.id)} className="btn-ghost btn-sm text-danger"><Trash2 className="h-4 w-4" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete listing?" size="sm">
        <p className="text-sm text-ink-muted">This permanently removes the listing and its images. This action cannot be undone.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" loading={del.isPending} onClick={() => toDelete && del.mutate(toDelete)}>Delete</Button>
        </div>
      </Modal>

      <CreateAuctionModal vehicle={auctionFor} onClose={() => setAuctionFor(null)} />
    </div>
  );
}
