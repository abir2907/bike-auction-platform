import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Gavel, Heart, LayoutDashboard, LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/auth';
import { Logo } from './Logo';
import { LinkButton } from '@/components/ui/Button';

const links = [
  { to: '/buy', label: 'Buy' },
  { to: '/auctions', label: 'Auctions' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const { user, status, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                clsx(
                  'rounded-lg px-3.5 py-2 text-sm font-semibold transition',
                  isActive ? 'text-brand' : 'text-ink-soft hover:text-ink',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {status === 'authenticated' && user ? (
            <>
              <LinkButton to="/dashboard/listings/new" variant="accent" size="sm">
                <Gavel className="h-4 w-4" /> Sell your bike
              </LinkButton>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-xl border border-line px-2.5 py-1.5 text-sm font-semibold hover:border-line-strong"
                >
                  <Avatar user={user} />
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="h-4 w-4 text-ink-muted" />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="animate-fade-up absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-card">
                      <MenuLink to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} onClick={() => setMenuOpen(false)}>
                        Dashboard
                      </MenuLink>
                      <MenuLink to="/dashboard/saved" icon={<Heart className="h-4 w-4" />} onClick={() => setMenuOpen(false)}>
                        Saved bikes
                      </MenuLink>
                      <MenuLink to="/dashboard/profile" icon={<UserIcon className="h-4 w-4" />} onClick={() => setMenuOpen(false)}>
                        Profile
                      </MenuLink>
                      {user.role === 'ADMIN' && (
                        <MenuLink to="/admin" icon={<Shield className="h-4 w-4" />} onClick={() => setMenuOpen(false)}>
                          Admin panel
                        </MenuLink>
                      )}
                      <button
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-danger hover:bg-danger-soft"
                      >
                        <LogOut className="h-4 w-4" /> Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost btn-sm">
                Log in
              </Link>
              <LinkButton to="/register" size="sm">
                Get started
              </LinkButton>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="animate-fade-up border-t border-line bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-surface"
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-line pt-3">
              {status === 'authenticated' && user ? (
                <>
                  <LinkButton to="/dashboard" variant="outline" size="sm">
                    Dashboard
                  </LinkButton>
                  {user.role === 'ADMIN' && (
                    <LinkButton to="/admin" variant="outline" size="sm">
                      Admin panel
                    </LinkButton>
                  )}
                  <LinkButton to="/dashboard/listings/new" variant="accent" size="sm">
                    Sell your bike
                  </LinkButton>
                  <button onClick={handleLogout} className="btn-ghost btn-sm text-danger">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <LinkButton to="/login" variant="outline" size="sm">
                    Log in
                  </LinkButton>
                  <LinkButton to="/register" size="sm">
                    Get started
                  </LinkButton>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Avatar({ user }: { user: { name: string; avatarUrl?: string | null } }) {
  if (user.avatarUrl) return <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-lg object-cover" />;
  return (
    <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-xs font-bold text-brand">
      {user.name.charAt(0).toUpperCase()}
    </span>
  );
}

function MenuLink({ to, icon, children, onClick }: { to: string; icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-surface">
      {icon} {children}
    </Link>
  );
}
