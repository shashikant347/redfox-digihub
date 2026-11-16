import { useEffect } from 'react';

/** Shifts the hero cube slightly toward the mouse (CSS vars --px/--py on .cubewrap). */
export default function useCubeParallax(heroRef, cubeRef) {
  useEffect(() => {
    const hc = heroRef.current;
    const cw = cubeRef.current;
    if (!hc || !cw) return;
    const ok =
      window.matchMedia('(hover:hover)').matches &&
      !window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (!ok) return;

    const move = (e) => {
      const r = hc.getBoundingClientRect();
      cw.style.setProperty('--px', `${((e.clientX - r.left) / r.width - 0.5) * 28}px`);
      cw.style.setProperty('--py', `${((e.clientY - r.top) / r.height - 0.5) * 22}px`);
    };
    const leave = () => {
      cw.style.setProperty('--px', '0px');
      cw.style.setProperty('--py', '0px');
    };
    hc.addEventListener('mousemove', move);
    hc.addEventListener('mouseleave', leave);
    return () => {
      hc.removeEventListener('mousemove', move);
      hc.removeEventListener('mouseleave', leave);
    };
  }, [heroRef, cubeRef]);
}
