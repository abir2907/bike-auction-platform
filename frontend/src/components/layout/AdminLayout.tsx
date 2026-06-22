import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Bike, MessageSquare, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from './Navbar';
import { ScrollToTop } from './ScrollToTop';

const items = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/vehicles', label: 'Vehicles', icon: Bike },
  { to: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
  { to: '/admin/cms', label: 'Content (CMS)', icon: FileText },
];

export function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <ScrollToTop />
      <Navbar />
      <div className="container-page flex-1 py-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="badge-brand">Admin</span>
          <h1 className="text-2xl font-extrabold">Control center</h1>
        </div>
        <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
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
                      isActive ? 'bg-night text-white' : 'text-ink-soft hover:bg-surface',
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
