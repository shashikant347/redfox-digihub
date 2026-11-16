import { useEffect, useState } from 'react';

const IDS = ['home', 'about', 'services', 'work', 'process', 'faq', 'quote'];

/** Returns the id of the section currently in the middle of the viewport (for the nav highlight). */
export default function useActiveSection(ready) {
  const [active, setActive] = useState('home');

  useEffect(() => {
    if (!ready || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ready]);

  return active;
}
