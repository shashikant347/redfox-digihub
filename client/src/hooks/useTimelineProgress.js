import { useEffect } from 'react';

/** Fills the process timeline line (--p) and lights up the steps as you scroll past them. */
export default function useTimelineProgress(ref, ready) {
  useEffect(() => {
    const tl = ref.current;
    if (!ready || !tl) return;
    const steps = Array.from(tl.children);

    const update = () => {
      const r = tl.getBoundingClientRect();
      const line = window.innerHeight * 0.62;
      const p = Math.max(0, Math.min(1, (line - r.top) / r.height));
      tl.style.setProperty('--p', `${p * 100}%`);
      steps.forEach((step) => {
        step.classList.toggle('on', step.getBoundingClientRect().top < line);
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ref, ready]);
}
