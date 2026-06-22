import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Trash2, Mail, Phone } from 'lucide-react';
import { clsx } from 'clsx';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/api';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/format';

const statuses = ['', 'NEW', 'CONTACTED', 'CLOSED'];

export default function AdminInquiries() {
  const qc = useQueryClient();
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['admin-inquiries', status, page],
    queryFn: () => adminService.inquiries({ status: status || undefined, page }),
    placeholderData: keepPreviousData,
  });

  const update = useMutation({
    mutationFn: ({ id, s }: { id: string; s: string }) => adminService.updateInquiry(id, s),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-inquiries'] }),
    onError: (e) => toast(getApiErrorMessage(e), 'error'),
  });
  const del = useMutation({
    mutationFn: (id: string) => adminService.deleteInquiry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-inquiries'] });
      toast('Inquiry deleted', 'success');
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Inquiries</h1>
        <div className="flex gap-1">
          {statuses.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => { setStatus(s); setPage(1); }}
              className={clsx('rounded-lg px-3 py-1.5 text-xs font-semibold', status === s ? 'bg-ink text-white' : 'border border-line bg-white text-ink-soft')}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {data?.items.map((inq) => (
          <div key={inq.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold">{inq.name} <span className="font-normal text-ink-muted">· {inq.vehicle?.title}</span></p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
                  <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {inq.email}</span>
                  <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {inq.phone}</span>
                  <span>{formatDate(inq.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">{inq.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={inq.status}
                  onChange={(e) => update.mutate({ id: inq.id, s: e.target.value })}
                  className="rounded-lg border border-line bg-white px-2 py-1.5 text-xs font-semibold"
                >
                  {['NEW', 'CONTACTED', 'CLOSED'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => del.mutate(inq.id)} className="btn-ghost btn-sm text-danger"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {data?.items.length === 0 && <p className="py-10 text-center text-sm text-ink-muted">No inquiries found.</p>}
      </div>

      {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />}
    </div>
  );
}
