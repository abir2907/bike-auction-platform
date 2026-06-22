import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Field';
import { RatingStars } from '@/components/ui/Misc';
import type { Faq, Testimonial } from '@/types';

type Tab = 'faqs' | 'testimonials';

export default function AdminCms() {
  const [tab, setTab] = useState<Tab>('faqs');
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Content management</h1>
      <div className="inline-flex gap-1 rounded-xl border border-line bg-card p-1">
        {(['faqs', 'testimonials'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx('rounded-lg px-4 py-2 text-sm font-semibold capitalize', tab === t ? 'bg-brand text-white' : 'text-ink-soft hover:bg-surface')}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 'faqs' ? <FaqManager /> : <TestimonialManager />}
    </div>
  );
}

// ── FAQs ───────────────────────────────────────────────────────────────────
function FaqManager() {
  const qc = useQueryClient();
  const toast = useToast();
  const [editing, setEditing] = useState<Faq | null>(null);
  const [open, setOpen] = useState(false);

  const { data = [] } = useQuery({ queryKey: ['admin-faqs'], queryFn: adminService.faqs });
  const { register, handleSubmit, reset } = useForm<Partial<Faq>>();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-faqs'] });
    qc.invalidateQueries({ queryKey: ['faqs'] });
  };

  const save = useMutation({
    mutationFn: (body: Partial<Faq>) =>
      editing ? adminService.updateFaq(editing.id, body) : adminService.createFaq(body),
    onSuccess: () => {
      invalidate();
      toast('Saved', 'success');
      setOpen(false);
    },
    onError: (e) => toast(getApiErrorMessage(e), 'error'),
  });
  const del = useMutation({
    mutationFn: (id: string) => adminService.deleteFaq(id),
    onSuccess: () => { invalidate(); toast('Deleted', 'success'); },
  });

  const openForm = (faq?: Faq) => {
    setEditing(faq ?? null);
    reset(faq ?? { question: '', answer: '', category: '', sortOrder: data.length });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => openForm()}><Plus className="h-4 w-4" /> Add FAQ</Button>
      </div>
      <div className="space-y-3">
        {data.map((f) => (
          <div key={f.id} className="card flex items-start justify-between gap-4 p-5">
            <div>
              <p className="font-bold">{f.question}</p>
              <p className="mt-1 text-sm text-ink-muted">{f.answer}</p>
              {f.category && <span className="badge-muted mt-2">{f.category}</span>}
            </div>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => openForm(f)} className="btn-ghost btn-sm"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => del.mutate(f.id)} className="btn-ghost btn-sm text-danger"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit FAQ' : 'Add FAQ'}>
        <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <Input label="Question" {...register('question', { required: true })} />
          <Textarea label="Answer" rows={4} {...register('answer', { required: true })} />
          <Input label="Category" {...register('category')} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={save.isPending}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ── Testimonials ─────────────────────────────────────────────────────────────
function TestimonialManager() {
  const qc = useQueryClient();
  const toast = useToast();
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [open, setOpen] = useState(false);

  const { data = [] } = useQuery({ queryKey: ['admin-testimonials'], queryFn: adminService.testimonials });
  const { register, handleSubmit, reset } = useForm<Partial<Testimonial>>();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-testimonials'] });
    qc.invalidateQueries({ queryKey: ['testimonials'] });
  };

  const save = useMutation({
    mutationFn: (body: Partial<Testimonial>) =>
      editing ? adminService.updateTestimonial(editing.id, body) : adminService.createTestimonial(body),
    onSuccess: () => { invalidate(); toast('Saved', 'success'); setOpen(false); },
    onError: (e) => toast(getApiErrorMessage(e), 'error'),
  });
  const del = useMutation({
    mutationFn: (id: string) => adminService.deleteTestimonial(id),
    onSuccess: () => { invalidate(); toast('Deleted', 'success'); },
  });

  const openForm = (t?: Testimonial) => {
    setEditing(t ?? null);
    reset(t ?? { authorName: '', authorTitle: '', content: '', rating: 5, sortOrder: data.length });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => openForm()}><Plus className="h-4 w-4" /> Add testimonial</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {data.map((t) => (
          <div key={t.id} className="card p-5">
            <div className="flex items-start justify-between">
              <RatingStars rating={t.rating} />
              <div className="flex gap-2">
                <button onClick={() => openForm(t)} className="btn-ghost btn-sm"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => del.mutate(t.id)} className="btn-ghost btn-sm text-danger"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="mt-2 text-sm text-ink-soft">“{t.content}”</p>
            <p className="mt-2 text-sm font-bold">{t.authorName}{t.authorTitle && <span className="font-normal text-ink-muted"> · {t.authorTitle}</span>}</p>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit testimonial' : 'Add testimonial'}>
        <form onSubmit={handleSubmit((v) => save.mutate({ ...v, rating: Number(v.rating) }))} className="space-y-4">
          <Input label="Author name" {...register('authorName', { required: true })} />
          <Input label="Author title" {...register('authorTitle')} />
          <Textarea label="Content" rows={4} {...register('content', { required: true })} />
          <Input label="Rating (1–5)" type="number" min={1} max={5} {...register('rating', { valueAsNumber: true })} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={save.isPending}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
