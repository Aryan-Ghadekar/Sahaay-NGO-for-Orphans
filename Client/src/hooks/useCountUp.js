import { useEffect, useRef, useState } from 'react';

// Animates a number climbing to its target once it scrolls into view.
// Non-numeric values (e.g. "₹9.4L", "89%") pass through untouched on the
// final frame — only the numeric part is worth animating.
export function useCountUp(target, { duration = 1200 } = {}) {
  const rawNumberStr = typeof target === 'number' ? String(target) : String(target).match(/[0-9.]+/)?.[0] ?? '';
  const numeric = parseFloat(rawNumberStr);
  // Preserve the target's own decimal precision (e.g. "9.4" must land on
  // 9.4, not round to 9) while still animating smoothly toward it.
  const decimals = rawNumberStr.includes('.') ? rawNumberStr.split('.')[1].length : 0;
  const prefix = typeof target === 'string' ? target.match(/^[^0-9]*/)?.[0] ?? '' : '';
  const suffix = typeof target === 'string' ? target.match(/[^0-9]*$/)?.[0] ?? '' : '';
  const [value, setValue] = useState(Number.isFinite(numeric) ? 0 : target);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!Number.isFinite(numeric) || !ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = numeric * eased;
            setValue(decimals ? Number(current.toFixed(decimals)) : Math.round(current));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [numeric, duration, decimals]);

  const display = Number.isFinite(numeric)
    ? `${prefix}${value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
    : value;
  return [ref, display];
}
