import { useState } from 'react';
import { clsx } from 'clsx';

// A few on-brand gradients; picked deterministically so each vehicle gets a
// consistent, designed placeholder even when no photo is available.
const GRADIENTS = [
  'from-brand-600 to-brand-700',
  'from-[#0050FF] to-[#3478F5]',
  'from-accent-600 to-pink',
  'from-pink to-[#7c1d38]',
  'from-[#12AA00] to-[#0b7a00]',
  'from-night to-[#2b2f3a]',
];

function gradientFor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

function BikeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <path d="M16 42c0-5 4-9 9-9s9 4 9 9" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="20" cy="46" r="6" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="46" cy="46" r="6" stroke="currentColor" strokeWidth="3.5" />
      <path d="M25 33l9-10 7 10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface Props {
  src?: string | null;
  alt?: string;
  /** Shown on the placeholder (e.g. "Honda Activa 6G"). */
  label?: string;
  /** Extra classes for the <img> (e.g. hover zoom). */
  className?: string;
  /** Enable a subtle hover zoom (for cards). */
  zoom?: boolean;
}

/**
 * Image with a guaranteed graceful state. A branded gradient (with a bike glyph
 * + optional label) is always rendered behind; the real photo fades in over it
 * on load and is hidden on error — so the UI never shows a blank/broken box.
 */
export function SmartImage({ src, alt = '', label, className, zoom }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Only show the branded placeholder when there is no usable photo yet —
  // i.e. no src, the image errored, or it hasn't finished loading. Once the
  // real photo is in, the placeholder (and its label) is removed entirely so
  // it never bleeds through beneath the image.
  const showPlaceholder = !src || failed || !loaded;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {showPlaceholder && (
        <div className={clsx('absolute inset-0 flex items-center justify-center bg-gradient-to-br', gradientFor(label || alt || src || 'vutto'))}>
          <div className="flex flex-col items-center gap-1.5 px-3 text-center text-white/85">
            <BikeGlyph className="h-9 w-9" />
            {label && <span className="line-clamp-1 text-[11px] font-semibold">{label}</span>}
          </div>
        </div>
      )}
      {src && !failed && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={clsx(
            'absolute inset-0 h-full w-full object-cover transition-all duration-500',
            zoom && 'group-hover:scale-105',
            loaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
        />
      )}
    </div>
  );
}
