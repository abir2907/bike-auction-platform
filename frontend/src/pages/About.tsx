import { Link } from 'react-router-dom';
import { Target, Eye, HeartHandshake, Bike, Users, Trophy, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cmsService } from '@/services/misc.service';
import { formatNumber } from '@/lib/format';

export default function AboutPage() {
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: cmsService.stats });
  const numbers = [
    { icon: Bike, label: 'Bikes listed', value: stats?.vehiclesListed ?? 0 },
    { icon: Trophy, label: 'Bikes sold', value: stats?.vehiclesSold ?? 0 },
    { icon: Users, label: 'Customers', value: stats?.happyCustomers ?? 0 },
    { icon: Zap, label: 'Live auctions', value: stats?.liveAuctions ?? 0 },
  ];

  return (
    <div>
      <section className="bg-cream">
        <div className="container-page py-16 text-center">
          <span className="eyebrow">About us</span>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Reinventing how India buys & sells used two-wheelers
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft">
            Vutto Auctions brings transparency, trust and fair pricing to the pre-owned two-wheeler market through
            rigorous inspections and real-time auctions.
          </p>
        </div>
      </section>

      <section className="section container-page grid gap-6 md:grid-cols-3">
        {[
          { icon: Target, title: 'Our mission', text: 'Make buying and selling a used bike as trustworthy and effortless as buying new.' },
          { icon: Eye, title: 'Our vision', text: 'Become the most loved two-wheeler marketplace in India, built on transparency.' },
          { icon: HeartHandshake, title: 'Our values', text: 'Honesty, fairness and putting riders first in every decision we make.' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-7">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand"><Icon className="h-6 w-6" /></span>
            <h3 className="mt-4 text-xl font-bold">{title}</h3>
            <p className="mt-2 text-ink-muted">{text}</p>
          </div>
        ))}
      </section>

      <section className="container-page pb-16">
        <div className="grid gap-4 rounded-2.5xl bg-night p-8 text-white sm:grid-cols-2 lg:grid-cols-4">
          {numbers.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <Icon className="mx-auto h-7 w-7 text-accent" />
              <p className="mt-2 text-3xl font-extrabold">{formatNumber(value)}+</p>
              <p className="text-sm text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-20 text-center">
        <h2 className="text-3xl font-extrabold">Join the community</h2>
        <p className="mx-auto mt-3 max-w-xl text-ink-muted">Whether buying your dream bike or selling your current ride, we've got you covered.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/buy" className="btn-primary">Browse bikes</Link>
          <Link to="/contact" className="btn-outline">Talk to us</Link>
        </div>
      </section>
    </div>
  );
}
