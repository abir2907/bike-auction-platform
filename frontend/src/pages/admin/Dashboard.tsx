import { useQuery } from '@tanstack/react-query';
import { Users, Bike, MessageSquare, IndianRupee, Gavel, CheckCircle2, ShoppingBag, Clock } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { PageLoader } from '@/components/ui/Spinner';
import { formatINR, formatNumber, formatDate } from '@/lib/format';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: adminService.dashboard });
  if (isLoading || !data) return <PageLoader />;

  const m = data.metrics;
  const cards = [
    { label: 'Total users', value: formatNumber(m.totalUsers), icon: Users, color: 'bg-brand-50 text-brand' },
    { label: 'Active listings', value: formatNumber(m.activeVehicles), icon: Bike, color: 'bg-accent-soft text-accent-600' },
    { label: 'Total inquiries', value: formatNumber(m.totalInquiries), icon: MessageSquare, color: 'bg-success-soft text-success' },
    { label: 'GMV (settled)', value: formatINR(m.grossMerchandiseValue, { compact: true }), icon: IndianRupee, color: 'bg-ink/5 text-ink' },
  ];
  const sub = [
    { label: 'Live auctions', value: m.liveAuctions, icon: Gavel },
    { label: 'Settled auctions', value: m.settledAuctions, icon: CheckCircle2 },
    { label: 'Bikes sold', value: m.soldVehicles, icon: ShoppingBag },
    { label: 'New inquiries', value: m.newInquiries, icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span>
            </div>
            <p className="mt-4 text-3xl font-extrabold">{value}</p>
            <p className="text-sm text-ink-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {sub.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card flex items-center gap-3 p-4">
            <Icon className="h-5 w-5 text-ink-muted" />
            <div>
              <p className="text-xl font-extrabold">{formatNumber(value)}</p>
              <p className="text-xs text-ink-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-bold">Recent inquiries</h2>
          <ul className="mt-4 divide-y divide-line">
            {data.recentInquiries.map((inq) => (
              <li key={inq.id} className="py-3">
                <p className="font-semibold">{inq.name} <span className="font-normal text-ink-muted">· {inq.vehicle?.title}</span></p>
                <p className="truncate text-sm text-ink-muted">{inq.message}</p>
              </li>
            ))}
            {data.recentInquiries.length === 0 && <li className="py-6 text-center text-sm text-ink-muted">No inquiries yet.</li>}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-bold">New users</h2>
          <ul className="mt-4 divide-y divide-line">
            {data.recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-sm text-ink-muted">{u.email}</p>
                </div>
                <span className="text-xs text-ink-muted">{formatDate(u.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
