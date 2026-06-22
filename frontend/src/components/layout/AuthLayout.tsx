import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck, Gavel, BadgeCheck } from 'lucide-react';
import { Logo } from './Logo';

/** Split-screen layout for auth pages: brand panel + form. */
export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-night p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <Logo className="relative [&_span:last-child]:text-white" />
        <div className="relative">
          <h2 className="max-w-md text-4xl font-extrabold leading-tight">
            The trusted way to buy & sell pre-owned two-wheelers.
          </h2>
          <ul className="mt-8 space-y-4 text-white/80">
            <li className="flex items-center gap-3"><BadgeCheck className="h-5 w-5 text-accent" /> 200-point inspected vehicles</li>
            <li className="flex items-center gap-3"><Gavel className="h-5 w-5 text-accent" /> Transparent real-time auctions</li>
            <li className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-accent" /> Secure payments & paperwork</li>
          </ul>
        </div>
        <p className="relative text-sm text-white/50">© {new Date().getFullYear()} Vutto Auctions</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Logo />
          <Link to="/" className="text-sm font-semibold text-ink-muted">
            ← Home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
