import { useCountdown } from '@/hooks/useCountdown';
import { clsx } from 'clsx';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** Compact "02:14:33" style countdown used on auction cards. */
export function CountdownInline({ endTime, prefix }: { endTime: string; prefix?: string }) {
  const c = useCountdown(endTime);
  // Colour is inherited from the surrounding chip so it reads correctly on
  // both light and dark pills; only the urgent state forces its own colour.
  if (c.isOver) return <span className="font-semibold">Ended</span>;
  const urgent = c.totalMs < 60_000;
  return (
    <span className={clsx('font-bold tabular-nums', urgent && 'text-danger')}>
      {prefix}
      {c.days > 0 && `${c.days}d `}
      {pad(c.hours)}:{pad(c.minutes)}:{pad(c.seconds)}
    </span>
  );
}

/** Boxed countdown used on the auction detail header. */
export function CountdownBoxes({ endTime }: { endTime: string }) {
  const c = useCountdown(endTime);
  const cells = [
    { v: c.days, l: 'days' },
    { v: c.hours, l: 'hrs' },
    { v: c.minutes, l: 'min' },
    { v: c.seconds, l: 'sec' },
  ];
  const urgent = c.totalMs < 60_000 && !c.isOver;
  return (
    <div className="flex gap-2">
      {cells.map((cell) => (
        <div key={cell.l} className={clsx('min-w-[58px] rounded-xl border px-2 py-2 text-center', urgent ? 'border-danger/40 bg-danger-soft' : 'border-line bg-card')}>
          <p className={clsx('text-2xl font-extrabold tabular-nums', urgent && 'text-danger')}>{pad(cell.v)}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{cell.l}</p>
        </div>
      ))}
    </div>
  );
}
