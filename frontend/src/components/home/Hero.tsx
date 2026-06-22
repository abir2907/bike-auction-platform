import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SmartImage } from '@/components/ui/SmartImage';

const popular = ['Royal Enfield', 'Honda Activa', 'KTM Duke', 'Ather'];

export function Hero() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const search = (term?: string) => {
    const query = (term ?? q).trim();
    navigate(query ? `/buy?q=${encodeURIComponent(query)}` : '/buy');
  };

  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="container-page relative grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div className="animate-fade-up">
          <span className="badge-brand">
            <ShieldCheck className="h-3.5 w-3.5" /> 200-point inspected · Delhi NCR
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
            Buy & sell used <span className="text-brand">two-wheelers</span> you can trust
          </h1>
          <p className="mt-5 max-w-lg text-lg text-ink-soft">
            Inspected bikes, transparent live auctions and the best prices — all in one modern, hassle-free marketplace.
          </p>

          {/* Search */}
          <div className="mt-8 flex max-w-lg items-center gap-2 rounded-2xl border border-line bg-card p-2 shadow-soft">
            <Search className="ml-2 h-5 w-5 shrink-0 text-ink-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="Search by brand, model or city…"
              className="w-full bg-transparent px-1 py-2 text-sm outline-none placeholder:text-ink-muted"
              aria-label="Search vehicles"
            />
            <Button onClick={() => search()} className="shrink-0">
              Search
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <span>Popular:</span>
            {popular.map((p) => (
              <button key={p} onClick={() => search(p)} className="rounded-full bg-card px-3 py-1 font-medium text-ink-soft shadow-soft transition hover:text-brand">
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Visual */}
        <div className="animate-fade-up relative">
          <div className="aspect-[4/3] overflow-hidden rounded-2.5xl border border-line bg-card shadow-soft">
            <SmartImage
              src="/bikes/hero.jpg"
              alt="Featured pre-owned motorcycle"
              label="Inspected & ready to ride"
            />
          </div>
          <div className="absolute -left-4 bottom-8 hidden rounded-2xl border border-line bg-card p-4 shadow-soft sm:block">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-success-soft text-success">
                <Zap className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold">Live auctions</p>
                <p className="text-xs text-ink-muted">Bid in real time</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-3 top-8 hidden rounded-2xl border border-line bg-card p-4 shadow-soft sm:block">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 fill-accent text-accent" />
              <div>
                <p className="text-sm font-bold">4.8/5 rating</p>
                <p className="text-xs text-ink-muted">12,000+ happy riders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
