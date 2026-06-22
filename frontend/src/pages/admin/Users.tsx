import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Search, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/format';

export default function AdminUsers() {
  const qc = useQueryClient();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['admin-users', q, page],
    queryFn: () => adminService.users({ q: q || undefined, page }),
    placeholderData: keepPreviousData,
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof adminService.updateUser>[1] }) => adminService.updateUser(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast('User updated', 'success');
    },
    onError: (e) => toast(getApiErrorMessage(e), 'error'),
  });

  const del = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast('User deleted', 'success');
      setToDelete(null);
    },
    onError: (e) => toast(getApiErrorMessage(e), 'error'),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Users</h1>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="h-4 w-4 text-ink-muted" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name or email" className="bg-transparent py-2.5 text-sm outline-none" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data?.items.map((u) => (
                <tr key={u.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-ink-muted">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={u.role === 'ADMIN' ? 'badge-brand' : 'badge-muted'}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={u.isActive ? 'badge-success' : 'badge-danger'}>{u.isActive ? 'Active' : 'Disabled'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        title={u.role === 'ADMIN' ? 'Demote to user' : 'Promote to admin'}
                        onClick={() => update.mutate({ id: u.id, body: { role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' } })}
                        className="btn-ghost btn-sm"
                      >
                        {u.role === 'ADMIN' ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => update.mutate({ id: u.id, body: { isActive: !u.isActive } })}
                        className="btn-ghost btn-sm"
                      >
                        {u.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => setToDelete(u.id)} className="btn-ghost btn-sm text-danger"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />}

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete user?" size="sm">
        <p className="text-sm text-ink-muted">This permanently deletes the user and all their listings, bids and inquiries.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" loading={del.isPending} onClick={() => toDelete && del.mutate(toDelete)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
