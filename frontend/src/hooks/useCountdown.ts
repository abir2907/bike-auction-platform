import { useEffect, useState } from 'react';

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isOver: boolean;
}

function compute(target: number): Countdown {
  const totalMs = Math.max(0, target - Date.now());
  const totalSec = Math.floor(totalMs / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    totalMs,
    isOver: totalMs <= 0,
  };
}

/** Live countdown to a target time, ticking every second. */
export function useCountdown(targetTime: string | Date | undefined): Countdown {
  const target = targetTime ? new Date(targetTime).getTime() : Date.now();
  const [state, setState] = useState<Countdown>(() => compute(target));

  useEffect(() => {
    setState(compute(target));
    const id = setInterval(() => setState(compute(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return state;
}
