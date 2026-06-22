import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ListChecks, Heart, Gavel, MessageSquare, Plus, ArrowRight } from 'lucide-react';
import { vehiclesService } from '@/services/vehicles.service';
import { usersService } from '@/services/misc.service';
import { useAuthStore } from '@/store/auth';
import { ListingBadge } from '@/components/ui/Misc';
import { SmartImage } from '@/components/ui/SmartImage';
import { formatINR } from '@/lib/format';

export default function DashboardOverview() {
  const { user } = useAuthStore();
  const { data: listings = [] } = useQuery({ queryKey: ['my-listings'], queryFn: vehiclesService.mine });
  const { data: saved = [] } = useQuery({ queryKey: ['saved'], queryFn: usersService.saved });
  const { data: bids = [] } = useQuery({ queryKey: ['my-bids'], queryFn: usersService.bids });
  const { data: inquiries = [] } = useQuery({ queryKey: ['my-inquiries'], queryFn: usersService.inquiries });

  const stats = [
    { label: 'My listings', value: listings.length, icon: ListChecks, to: '/dashboard/listings', color: 'bg-brand-50 text-brand' },
    { label: 'Saved bikes', value: saved.length, icon: Heart, to: '/dashboard/saved', color: 'bg-danger-soft text-danger' },
    { label: 'Active bids', value: bids.length, icon: Gavel, to: '/dashboard/bids', color: 'bg-accent-soft text-accent-600' },
    { label: 'Inquiries', value: inquiries.length, icon: MessageSquare, to: '/dashboard/inquiries', color: 'bg-success-soft text-success' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Hi, {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-ink-muted">Here's what's happening with your account.</p>
        </div>
        <Link to="/dashboard/listings/new" className="btn-accent"><Plus className="h-4 w-4" /> New listing</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, to, color }) => (
          <Link key={label} to={to} className="card-hover p-5">
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span>
            <p className="mt-4 text-3xl font-extrabold">{value}</p>
            <p className="text-sm text-ink-muted">{label}</p>
          </Link>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent listings</h2>
          <Link to="/dashboard/listings" className="btn-ghost btn-sm">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {listings.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">You haven't listed any bikes yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {listings.slice(0, 5).map((v) => (
              <li key={v.id} className="flex items-center gap-3 py-3">
                <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                  <SmartImage src={v.images?.[0]?.url} alt="" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{v.title}</p>
                  <p className="text-sm text-ink-muted">{formatINR(v.price)}</p>
                </div>
                <ListingBadge status={v.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
