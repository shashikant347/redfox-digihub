import { useEffect } from 'react';

/** Moves the hero's soft spotlight (CSS vars --mx/--my) with the mouse. */
export default function useSpotlight(ref) {
  useEffect(() => {
    const hc = ref.current;
    if (!hc || !window.matchMedia('(hover:hover)').matches) return;
    const move = (e) => {
      const r = hc.getBoundingClientRect();
      hc.style.setProperty('--mx', `${e.clientX - r.left}px`);
      hc.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    hc.addEventListener('mousemove', move);
    return () => hc.removeEventListener('mousemove', move);
  }, [ref]);
}
