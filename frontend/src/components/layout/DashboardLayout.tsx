import { NavLink, Outlet } from 'react-router-dom';
import { Heart, LayoutGrid, ListChecks, MessageSquare, Gavel, UserCog } from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from './Navbar';
import { ScrollToTop } from './ScrollToTop';

const items = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/dashboard/listings', label: 'My listings', icon: ListChecks },
  { to: '/dashboard/bids', label: 'My bids', icon: Gavel },
  { to: '/dashboard/saved', label: 'Saved bikes', icon: Heart },
  { to: '/dashboard/inquiries', label: 'Inquiries', icon: MessageSquare },
  { to: '/dashboard/profile', label: 'Profile', icon: UserCog },
];

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <ScrollToTop />
      <Navbar />
      <div className="container-page flex-1 py-8">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="card flex gap-1 overflow-x-auto p-2 lg:flex-col">
              {items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    clsx(
                      'flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition',
                      isActive ? 'bg-brand text-white shadow-soft' : 'text-ink-soft hover:bg-surface',
                    )
                  }
                >
                  <Icon className="h-4 w-4" /> {label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
