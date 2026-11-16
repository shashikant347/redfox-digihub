import { useEffect, useRef, useState } from 'react';

/** Counts "100%" / "6" up from 0 the first time the element scrolls into view. */
export default function useCountUp(value) {
  const ref = useRef(null);
  const [text, setText] = useState(value);

  useEffect(() => {
    const el = ref.current;
    const target = parseInt(value, 10);
    const suffix = String(value).replace(/[0-9]/g, '');
    const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (!el || Number.isNaN(target) || target < 2 || reduced || !('IntersectionObserver' in window)) {
      setText(value);
      return;
    }

    let raf;
    const run = () => {
      let start = null;
      const step = (ts) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / 1200, 1);
        setText(`${Math.round(target * (1 - Math.pow(1 - p, 3)))}${suffix}`);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      setText(`0${suffix}`);
      raf = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          run();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return [ref, text];
}
