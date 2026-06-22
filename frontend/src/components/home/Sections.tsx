import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck, Banknote, Headphones, FileCheck2, Gauge,
  Search, Gavel, KeyRound, Plus, Minus, Users, Bike, Trophy, Zap, ArrowRight,
} from 'lucide-react';
import { cmsService } from '@/services/misc.service';
import { vehiclesService } from '@/services/vehicles.service';
import { VehicleCard, VehicleCardSkeleton } from '@/components/vehicles/VehicleCard';
import { RatingStars } from '@/components/ui/Misc';
import { formatNumber } from '@/lib/format';

export function FeaturedVehicles() {
  const { data, isLoading } = useQuery({ queryKey: ['featured'], queryFn: vehiclesService.featured });

  return (
    <section className="section container-page">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Handpicked</p>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Featured bikes</h2>
        </div>
        <Link to="/buy" className="btn-ghost btn-sm hidden sm:inline-flex">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)
          : data?.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
      </div>
    </section>
  );
}

const reasons = [
  { icon: FileCheck2, title: '200-point inspection', text: 'Every bike is thoroughly inspected and graded with a transparent condition score.' },
  { icon: ShieldCheck, title: 'Verified sellers', text: 'KYC-verified sellers and clear ownership paperwork on every listing.' },
  { icon: Gavel, title: 'Fair live auctions', text: 'Real-time bidding with anti-sniping so the best price always wins.' },
  { icon: Banknote, title: 'Best prices', text: 'No middlemen markups — buy and sell at genuine market value.' },
  { icon: Gauge, title: 'Quality assured', text: 'Service history and odometer verification you can rely on.' },
  { icon: Headphones, title: 'Dedicated support', text: 'Real humans to help you through buying, selling and transfer.' },
];

export function WhyChooseUs() {
  return (
    <section className="bg-cream">
      <div className="section container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Why Vutto</p>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Built on trust, priced to win</h2>
          <p className="mt-3 text-ink-muted">Everything you need to buy or sell a pre-owned two-wheeler with total confidence.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card-hover p-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Stats() {
  const { data } = useQuery({ queryKey: ['stats'], queryFn: cmsService.stats });
  const items = [
    { icon: Bike, label: 'Bikes listed', value: data?.vehiclesListed ?? 0, suffix: '+' },
    { icon: Trophy, label: 'Bikes sold', value: data?.vehiclesSold ?? 0, suffix: '+' },
    { icon: Users, label: 'Happy customers', value: data?.happyCustomers ?? 0, suffix: '+' },
    { icon: Zap, label: 'Live auctions', value: data?.liveAuctions ?? 0, suffix: '' },
  ];
  return (
    <section className="section container-page">
      <div className="grid gap-4 rounded-2.5xl bg-night p-8 text-white sm:grid-cols-2 lg:grid-cols-4 lg:p-10">
        {items.map(({ icon: Icon, label, value, suffix }) => (
          <div key={label} className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-accent">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-3xl font-extrabold">{formatNumber(value)}{suffix}</p>
              <p className="text-sm text-white/60">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const steps = [
  { icon: Search, title: 'Browse & shortlist', text: 'Filter inspected bikes by brand, budget, fuel type and city.' },
  { icon: Gavel, title: 'Bid or buy now', text: 'Join a transparent live auction or buy instantly at a fixed price.' },
  { icon: KeyRound, title: 'Pay & ride home', text: 'Secure payment, smooth RC transfer, and the keys are yours.' },
];

export function HowItWorks() {
  return (
    <section className="bg-cream">
      <div className="section container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Simple & transparent</p>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">How it works</h2>
        </div>
        <div className="relative mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="card relative p-6 text-center">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                Step {i + 1}
              </span>
              <span className="mx-auto mt-3 grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent-600">
                <Icon className="h-7 w-7" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const { data } = useQuery({ queryKey: ['testimonials'], queryFn: cmsService.testimonials });
  if (!data?.length) return null;
  return (
    <section className="section container-page">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Loved by riders</p>
        <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">What our customers say</h2>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {data.map((t) => (
          <figure key={t.id} className="card flex flex-col p-6">
            <RatingStars rating={t.rating} />
            <blockquote className="mt-4 flex-1 text-ink-soft">“{t.content}”</blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-700 font-bold text-white">
                {t.authorName.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-bold">{t.authorName}</p>
                {t.authorTitle && <p className="text-xs text-ink-muted">{t.authorTitle}</p>}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function Faqs() {
  const { data } = useQuery({ queryKey: ['faqs'], queryFn: cmsService.faqs });
  const [open, setOpen] = useState<string | null>(null);
  if (!data?.length) return null;
  return (
    <section className="bg-cream">
      <div className="section container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Got questions?</p>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Frequently asked questions</h2>
        </div>
        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {data.map((f) => {
            const isOpen = open === f.id;
            return (
              <div key={f.id} className="card overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : f.id)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-ink">{f.question}</span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-ink-soft">
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                {isOpen && <p className="px-5 pb-5 text-sm leading-relaxed text-ink-muted">{f.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CtaBanner() {
  return (
    <section className="container-page py-16">
      <div className="relative overflow-hidden rounded-2.5xl bg-gradient-to-br from-brand via-brand-600 to-[#0a2470] px-6 py-14 text-center text-white shadow-lifted lg:px-16 lg:py-20">
        {/* soft glow orbs */}
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-light/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        {/* dotted grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '22px 22px' }}
        />

        <div className="relative mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold backdrop-blur">
            <Zap className="h-3.5 w-3.5" /> Get started in minutes
          </span>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">Ready to find your next ride?</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg">
            Browse 200-point inspected bikes or list yours in minutes — and join thousands of riders buying and selling smarter on Vutto.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/buy" className="btn rounded-xl bg-white px-6 text-brand-700 shadow-soft hover:bg-white/90">
              Browse bikes <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/dashboard/listings/new" className="btn rounded-xl border border-white/40 px-6 text-white hover:bg-white/10">
              Sell your bike
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
