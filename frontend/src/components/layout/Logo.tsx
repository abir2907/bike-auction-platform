import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link to="/" onClick={onClick} className={clsx('flex items-center gap-2', className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-soft">
        <svg viewBox="0 0 64 64" className="h-6 w-6">
          <path d="M18 40c0-5 4-9 9-9s9 4 9 9" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <circle cx="22" cy="44" r="5" fill="none" stroke="currentColor" strokeWidth="5" />
          <circle cx="44" cy="44" r="5" fill="none" stroke="currentColor" strokeWidth="5" />
          <path d="M27 31l8-9 6 9" fill="none" stroke="#FF8B2B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-ink">
        vutto<span className="text-brand">auctions</span>
      </span>
    </Link>
  );
}
