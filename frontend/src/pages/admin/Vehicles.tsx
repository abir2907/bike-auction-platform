import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Star, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { formatINR } from '@/lib/format';
import type { ListingStatus } from '@/types';

const statuses: (ListingStatus | '')[] = ['', 'ACTIVE', 'PENDING', 'SOLD', 'ARCHIVED', 'REJECTED'];

export default function AdminVehicles() {
  const qc = useQueryClient();
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['admin-vehicles', status, page],
    queryFn: () => adminService.vehicles({ status: status || undefined, page }),
    placeholderData: keepPreviousData,
  });

  const moderate = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { status?: string; featured?: boolean } }) => adminService.moderateVehicle(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-vehicles'] });
      toast('Listing updated', 'success');
    },
    onError: (e) => toast(getApiErrorMessage(e), 'error'),
  });

  const del = useMutation({
    mutationFn: (id: string) => adminService.deleteVehicle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-vehicles'] });
      toast('Listing deleted', 'success');
      setToDelete(null);
    },
    onError: (e) => toast(getApiErrorMessage(e), 'error'),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Vehicles</h1>
        <div className="flex flex-wrap gap-1">
          {statuses.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => { setStatus(s); setPage(1); }}
              className={clsx('rounded-lg px-3 py-1.5 text-xs font-semibold', status === s ? 'bg-ink text-white' : 'bg-white text-ink-soft border border-line')}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data?.items.map((v) => (
                <tr key={v.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={v.images?.[0]?.url} alt="" className="h-10 w-14 rounded object-cover" />
                      <Link to={`/buy/${v.slug}`} className="font-semibold hover:text-brand">{v.title}</Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{v.seller?.name}</td>
                  <td className="px-4 py-3 font-semibold">{formatINR(v.price)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={v.status}
                      onChange={(e) => moderate.mutate({ id: v.id, body: { status: e.target.value } })}
                      className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold"
                    >
                      {['ACTIVE', 'PENDING', 'SOLD', 'ARCHIVED', 'REJECTED'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        title="Toggle featured"
                        onClick={() => moderate.mutate({ id: v.id, body: { featured: !v.featured } })}
                        className="btn-ghost btn-sm"
                      >
                        <Star className={clsx('h-4 w-4', v.featured && 'fill-accent text-accent')} />
                      </button>
                      <button onClick={() => setToDelete(v.id)} className="btn-ghost btn-sm text-danger"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />}

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete listing?" size="sm">
        <p className="text-sm text-ink-muted">This permanently removes the listing and all related data.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" loading={del.isPending} onClick={() => toDelete && del.mutate(toDelete)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
