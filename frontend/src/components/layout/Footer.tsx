import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from './Logo';

const columns = [
  {
    title: 'Marketplace',
    links: [
      { to: '/buy', label: 'Buy a bike' },
      { to: '/auctions', label: 'Live auctions' },
      { to: '/dashboard/listings/new', label: 'Sell your bike' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About us' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/privacy', label: 'Privacy policy' },
      { to: '/terms', label: 'Terms & conditions' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-cream">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              India's trusted marketplace for inspected, pre-owned two-wheelers — with transparent live auctions and the best prices in Delhi NCR.
            </p>
            <div className="mt-5 space-y-2 text-sm text-ink-soft">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand" /> Gurugram, Haryana, India</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand" /> +91 99999 00000</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand" /> hello@vutto-auctions.in</p>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold uppercase tracking-wide text-ink">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-ink-muted transition hover:text-brand">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line-strong pt-6 text-sm text-ink-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Vutto Auctions. Built as a demo inspired by vutto.in.</p>
          <p>Made with ♥ for two-wheeler enthusiasts.</p>
        </div>
      </div>
    </footer>
  );
}
