import { useEffect } from 'react';

/** Smoothly follows the pointer with the site-wide spotlight. */
export default function useSpotlight() {
  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canHover || prefersReducedMotion) return;

    const root = document.documentElement;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;
    let initialized = false;
    const render = () => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      root.style.setProperty('--cursor-x', `${currentX}px`);
      root.style.setProperty('--cursor-y', `${currentY}px`);

      if (Math.abs(targetX - currentX) > 0.25 || Math.abs(targetY - currentY) > 0.25) {
        frame = window.requestAnimationFrame(render);
      } else {
        currentX = targetX;
        currentY = targetY;
        root.style.setProperty('--cursor-x', `${currentX}px`);
        root.style.setProperty('--cursor-y', `${currentY}px`);
        frame = 0;
      }
    };
    const move = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!initialized) {
        currentX = targetX;
        currentY = targetY;
        root.style.setProperty('--cursor-x', `${currentX}px`);
        root.style.setProperty('--cursor-y', `${currentY}px`);
        initialized = true;
      } else if (!frame) {
        frame = window.requestAnimationFrame(render);
      }
      root.classList.add('cursor-spotlight-active');
    };
    const hide = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      initialized = false;
      root.classList.remove('cursor-spotlight-active');
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('blur', hide);
    document.addEventListener('pointerleave', hide);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('blur', hide);
      document.removeEventListener('pointerleave', hide);
      root.classList.remove('cursor-spotlight-active');
      root.style.removeProperty('--cursor-x');
      root.style.removeProperty('--cursor-y');
    };
  }, []);
}
