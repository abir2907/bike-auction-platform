import { useForm } from 'react-hook-form';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Input, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const toast = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>();

  const onSubmit = async () => {
    // Demo: contact form is a front-end lead capture (no backend endpoint).
    await new Promise((r) => setTimeout(r, 600));
    toast("Thanks! We'll get back to you within one business day.", 'success');
    reset();
  };

  const info = [
    { icon: MapPin, label: 'Visit us', value: 'Cyber Hub, Gurugram, Haryana 122002' },
    { icon: Phone, label: 'Call us', value: '+91 99999 00000' },
    { icon: Mail, label: 'Email us', value: 'hello@vutto-auctions.in' },
    { icon: Clock, label: 'Hours', value: 'Mon–Sat, 9:00 AM – 8:00 PM' },
  ];

  return (
    <div className="bg-surface">
      <div className="container-page py-12">
        <div className="text-center">
          <span className="eyebrow">Contact</span>
          <h1 className="mt-3 text-4xl font-extrabold">Get in touch</h1>
          <p className="mx-auto mt-3 max-w-xl text-ink-muted">Have a question about buying, selling or auctions? We're here to help.</p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            {info.map(({ icon: Icon, label, value }) => (
              <div key={label} className="card flex items-start gap-4 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand"><Icon className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-semibold text-ink-muted">{label}</p>
                  <p className="font-bold">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold">Send us a message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Name" error={errors.name?.message} {...register('name', { required: 'Required' })} />
                <Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Required' })} />
              </div>
              <Input label="Subject" error={errors.subject?.message} {...register('subject', { required: 'Required' })} />
              <Textarea label="Message" rows={5} error={errors.message?.message} {...register('message', { required: 'Required' })} />
              <Button type="submit" loading={isSubmitting} size="lg">Send message</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
