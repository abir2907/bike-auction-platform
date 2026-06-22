import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { usersService } from '@/services/misc.service';
import { EmptyState } from '@/components/ui/Misc';
import { PageLoader } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/format';

const statusStyles: Record<string, string> = {
  NEW: 'badge-accent',
  CONTACTED: 'badge-brand',
  CLOSED: 'badge-muted',
};

export default function MyInquiries() {
  const { data = [], isLoading } = useQuery({ queryKey: ['my-inquiries'], queryFn: usersService.inquiries });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">My inquiries</h1>
      {data.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-7 w-7" />}
          title="No inquiries yet"
          description="Inquiries you send to sellers will appear here."
          action={<Link to="/buy" className="btn-primary mt-2">Browse bikes</Link>}
        />
      ) : (
        <div className="space-y-3">
          {data.map((inq) => (
            <div key={inq.id} className="card p-5">
              <div className="flex items-center justify-between gap-2">
                <Link to={inq.vehicle ? `/buy/${inq.vehicle.slug}` : '#'} className="font-bold hover:text-brand">
                  {inq.vehicle?.title ?? 'Vehicle'}
                </Link>
                <span className={statusStyles[inq.status]}>{inq.status.toLowerCase()}</span>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{inq.message}</p>
              <p className="mt-2 text-xs text-ink-muted">Sent on {formatDate(inq.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
