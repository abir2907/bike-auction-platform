import { useState } from 'react';
import { clsx } from 'clsx';

interface AvatarProps {
  src?: string | null;
  name: string;
  /** Sizing + rounding classes, e.g. "h-10 w-10 rounded-full". */
  className?: string;
}

/**
 * Renders the user's image when available; on missing/broken image falls back
 * to a coloured circle with the first letter of their name.
 */
export function Avatar({ src, name, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase();

  if (src && !failed) {
    return (
      <img src={src} alt={name} onError={() => setFailed(true)} className={clsx('object-cover', className)} />
    );
  }
  return (
    <span className={clsx('grid place-items-center bg-gradient-to-br from-brand to-brand-700 font-bold text-white', className)}>
      {initial}
    </span>
  );
}
