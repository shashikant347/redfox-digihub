import { useEffect } from 'react';

/** 3D hover tilt on service cards and work tiles (mouse devices only). */
export default function useTilt(ready, routeKey) {
  useEffect(() => {
    if (!ready) return;
    const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (reduced || !window.matchMedia('(hover:hover)').matches) return;

    const cleanups = [];
    document.querySelectorAll('.scr .sc,.work .tile').forEach((card) => {
      const move = (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-8px)`;
      };
      const leave = () => {
        card.style.transform = '';
      };
      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', leave);
      cleanups.push(() => {
        card.removeEventListener('mousemove', move);
        card.removeEventListener('mouseleave', leave);
        card.style.transform = '';
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, [ready, routeKey]);
}
