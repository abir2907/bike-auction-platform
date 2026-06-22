import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Heart, Share2, MapPin, Calendar, Gauge, Fuel, Cog, Palette, ShieldCheck, BadgeCheck,
  Banknote, Phone, ChevronLeft, ChevronRight, Gavel,
} from 'lucide-react';
import { clsx } from 'clsx';
import { vehiclesService } from '@/services/vehicles.service';
import { inquiriesService } from '@/services/misc.service';
import { getApiErrorMessage } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useSaved } from '@/hooks/useSaved';
import { useAuthStore } from '@/store/auth';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/Misc';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { SmartImage } from '@/components/ui/SmartImage';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { formatINR, formatKm, ownerLabel } from '@/lib/format';

export default function VehicleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { savedIds, toggle } = useSaved();
  const { user } = useAuthStore();
  const toast = useToast();

  const { data: vehicle, isLoading, isError } = useQuery({
    queryKey: ['vehicle', slug],
    queryFn: () => vehiclesService.getBySlug(slug!),
    enabled: !!slug,
  });

  const { data: similar } = useQuery({
    queryKey: ['similar', vehicle?.id],
    queryFn: () => vehiclesService.similar(vehicle!.id),
    enabled: !!vehicle?.id,
  });

  if (isLoading) return <PageLoader />;
  if (isError || !vehicle)
    return (
      <div className="container-page py-16">
        <EmptyState title="Vehicle not found" description="This listing may have been sold or removed." action={<Link to="/buy" className="btn-primary mt-2">Browse other bikes</Link>} />
      </div>
    );

  const isAuction = vehicle.listingType === 'AUCTION' && vehicle.auction;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: vehicle.title, url }).catch(() => {});
    else {
      await navigator.clipboard.writeText(url);
      toast('Link copied to clipboard', 'success');
    }
  };

  const specs = [
    { icon: Calendar, label: 'Year', value: vehicle.year },
    { icon: Gauge, label: 'KM driven', value: formatKm(vehicle.kmDriven) },
    { icon: Fuel, label: 'Fuel', value: vehicle.fuelType.toLowerCase() },
    { icon: Cog, label: 'Transmission', value: vehicle.transmission.toLowerCase() },
    { icon: BadgeCheck, label: 'Ownership', value: ownerLabel(vehicle.ownerCount) },
    { icon: Palette, label: 'Color', value: vehicle.color || '—' },
    ...(vehicle.engineCapacityCc ? [{ icon: Cog, label: 'Engine', value: `${vehicle.engineCapacityCc} cc` }] : []),
    { icon: MapPin, label: 'Location', value: vehicle.city },
  ];

  return (
    <div className="bg-surface">
      <div className="container-page py-6">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-ink-muted">
          <Link to="/" className="hover:text-brand">Home</Link> <span>/</span>
          <Link to="/buy" className="hover:text-brand">Buy</Link> <span>/</span>
          <span className="truncate text-ink-soft">{vehicle.title}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Gallery images={vehicle.images.map((i) => i.url)} title={vehicle.title} />

            {/* Title + price (mobile) */}
            <div className="card p-5 lg:hidden">
              <TitleBlock vehicle={vehicle} />
            </div>

            {/* Specs */}
            <section className="card p-6">
              <h2 className="text-lg font-bold">Overview</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {specs.map((s) => (
                  <div key={s.label} className="rounded-xl bg-surface p-3">
                    <s.icon className="h-5 w-5 text-brand" />
                    <p className="mt-2 text-xs text-ink-muted">{s.label}</p>
                    <p className="text-sm font-bold capitalize">{s.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Description */}
            <section className="card p-6">
              <h2 className="text-lg font-bold">Description</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">{vehicle.description}</p>
            </section>

            {/* Inspection / condition */}
            <section className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Inspection score</h2>
                <span className="badge-success">{vehicle.conditionScore}/100</span>
              </div>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-surface">
                <div className="h-full rounded-full bg-success transition-all" style={{ width: `${vehicle.conditionScore}%` }} />
              </div>
              <p className="mt-3 text-sm text-ink-muted">
                Based on a 200-point inspection covering engine, brakes, electricals, tyres and documentation.
              </p>
            </section>

            {/* Financing + warranty */}
            <div className="grid gap-6 sm:grid-cols-2">
              <InfoCard icon={Banknote} title="Easy financing" tone="brand">
                EMIs starting at <strong>{formatINR(Math.round(Number(vehicle.price) / 24))}/mo</strong> over 24 months.
                Get instant pre-approval with minimal paperwork.
              </InfoCard>
              <InfoCard icon={ShieldCheck} title="Warranty included" tone="accent">
                Every purchase includes a <strong>6-month engine & gearbox warranty</strong> and a 7-day money-back guarantee.
              </InfoCard>
            </div>
          </div>

          {/* Sticky sidebar */}
          <aside className="space-y-5">
            <div className="card hidden p-6 lg:block">
              <TitleBlock vehicle={vehicle} />
              <div className="mt-5 flex gap-2">
                <Button variant="outline" onClick={() => toggle(vehicle.id)} className="flex-1">
                  <Heart className={clsx('h-4 w-4', savedIds.has(vehicle.id) && 'fill-danger text-danger')} />
                  {savedIds.has(vehicle.id) ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" onClick={share} aria-label="Share">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {isAuction && (
                <Link to={`/auctions/${vehicle.auction!.id}`} className="btn-accent mt-3 w-full">
                  <Gavel className="h-4 w-4" /> Go to live auction
                </Link>
              )}
            </div>

            <SellerCard vehicle={vehicle} />
            {!isAuction && user?.role !== 'ADMIN' && <InquiryForm vehicleId={vehicle.id} vehicleTitle={vehicle.title} />}
          </aside>
        </div>

        {/* Similar */}
        {similar && similar.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-extrabold">Similar bikes</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((v) => (
                <VehicleCard key={v.id} vehicle={v} saved={savedIds.has(v.id)} onToggleSave={toggle} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TitleBlock({ vehicle }: { vehicle: import('@/types').Vehicle }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {vehicle.featured && <span className="badge-accent">Featured</span>}
        <span className="badge-muted">{vehicle.year}</span>
        <span className="badge-muted">{ownerLabel(vehicle.ownerCount)}</span>
      </div>
      <h1 className="mt-3 text-2xl font-extrabold leading-tight">{vehicle.title}</h1>
      <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
        <MapPin className="h-4 w-4" /> {vehicle.city}
        {vehicle.registrationState ? ` · ${vehicle.registrationState}` : ''}
      </p>
      <p className="mt-4 text-3xl font-extrabold text-brand">{formatINR(vehicle.price)}</p>
      <p className="text-xs text-ink-muted">Fixed price · negotiable</p>
    </>
  );
}

function InfoCard({ icon: Icon, title, children, tone }: { icon: typeof Banknote; title: string; children: React.ReactNode; tone: 'brand' | 'accent' }) {
  return (
    <div className="card p-5">
      <span className={clsx('grid h-11 w-11 place-items-center rounded-xl', tone === 'brand' ? 'bg-brand-50 text-brand' : 'bg-accent-soft text-accent-600')}>
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{children}</p>
    </div>
  );
}

function SellerCard({ vehicle }: { vehicle: import('@/types').Vehicle }) {
  const seller = vehicle.seller;
  if (!seller) return null;
  return (
    <div className="card p-6">
      <h3 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Seller</h3>
      <div className="mt-3 flex items-center gap-3">
        {seller.avatarUrl ? (
          <img src={seller.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-lg font-bold text-brand">
            {seller.name.charAt(0)}
          </span>
        )}
        <div>
          <p className="font-bold">{seller.name}</p>
          <p className="flex items-center gap-1 text-xs text-success">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified seller
          </p>
        </div>
      </div>
    </div>
  );
}

function InquiryForm({ vehicleId, vehicleTitle }: { vehicleId: string; vehicleTitle: string }) {
  const { user } = useAuthStore();
  const toast = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ name: string; email: string; phone: string; message: string }>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      message: `Hi, I'm interested in the ${vehicleTitle}. Is it still available?`,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: { name: string; email: string; phone: string; message: string }) =>
      inquiriesService.create({ vehicleId, ...values }),
    onSuccess: (res) => {
      toast(res.message || 'Inquiry sent!', 'success');
      reset();
    },
    onError: (err) => toast(getApiErrorMessage(err), 'error'),
  });

  return (
    <div className="card p-6">
      <h3 className="flex items-center gap-2 text-lg font-bold">
        <Phone className="h-5 w-5 text-brand" /> Contact seller
      </h3>
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="mt-4 space-y-3" noValidate>
        <Input placeholder="Your name" error={errors.name?.message} {...register('name', { required: 'Required' })} />
        <Input type="email" placeholder="Email" error={errors.email?.message} {...register('email', { required: 'Required' })} />
        <Input type="tel" placeholder="Phone" error={errors.phone?.message} {...register('phone', { required: 'Required' })} />
        <Textarea placeholder="Message" rows={3} error={errors.message?.message} {...register('message', { required: 'Required' })} />
        <Button type="submit" fullWidth loading={mutation.isPending}>
          Send inquiry
        </Button>
      </form>
    </div>
  );
}

function Gallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  if (!images.length) return <div className="card grid aspect-[16/10] place-items-center text-ink-muted">No images</div>;
  const go = (dir: number) => setIndex((i) => (i + dir + images.length) % images.length);
  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-[16/10] bg-surface">
        <SmartImage src={images[index]} alt={`${title} — photo ${index + 1}`} label={title} />
        {images.length > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-soft hover:scale-105">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-soft hover:scale-105">
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-night/70 px-2.5 py-1 text-xs font-semibold text-white">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto p-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={clsx('h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2', i === index ? 'border-brand' : 'border-transparent')}
            >
              <SmartImage src={img} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
