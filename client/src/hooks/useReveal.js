import { useEffect } from 'react';

// Elements that fade/slide in when they scroll into view.
const SELECTOR = [
  '.two>*', '.stats>div', '.why>div', '.tl>div', 'details', '.info', '#qf',
  'section>h2', 'section>.lead', 'section>.tag', '.band', '.cta2 section>*',
  '.work .tile', '.fil', '.rvx',
].join(',');

/** Adds the "rv" class to the elements above, then "in" when they become visible. */
export default function useReveal(ready, routeKey) {
  useEffect(() => {
    if (!ready) return;
    const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const els = document.querySelectorAll(SELECTOR);
    els.forEach((el) => {
      const index = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--d', `${Math.min(index, 5) * 0.08}s`); // stagger siblings
      el.classList.add('rv');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ready, routeKey]);
}
