import { useEffect, useRef, useState } from 'react';

/**
 * Animated counter — counts from 0 to `target` over `duration` ms
 * with an ease-out cubic curve for a satisfying deceleration.
 */
export function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0 && prev.current === 0) { setValue(0); return; }

    const from = prev.current;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (target - from) * eased);
      setValue(current);

      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        prev.current = target;
      }
    };

    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return value;
}

/**
 * Animated decimal counter — same as useCountUp but returns a number
 * with `decimals` fractional digits for currency values like £0.09.
 */
export function useCountUpDecimal(target: number, decimals = 2, duration = 1400) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0 && prev.current === 0) { setValue(0); return; }

    const from = prev.current;
    const start = performance.now();
    const factor = Math.pow(10, decimals);

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round((from + (target - from) * eased) * factor) / factor;
      setValue(current);

      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        prev.current = target;
      }
    };

    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, decimals, duration]);

  return value;
}
