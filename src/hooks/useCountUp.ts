import { useEffect, useState } from 'react';

export function useCountUp(value: number, duration = 900) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = Math.max(1, Math.round(duration / 16));
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      frame = Math.min(totalFrames, frame + 1);
      setCount(value * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(value);
    };

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return count;
}
