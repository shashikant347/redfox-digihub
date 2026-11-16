import { useEffect, useState } from 'react';

/** Scroll progress (0-100), "header is scrolled" and "show back-to-top" flags. */
export default function useScrollState() {
  const [state, setState] = useState({ progress: 0, scrolled: false, showUp: false });

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setState({
        progress: max > 0 ? (y / max) * 100 : 0,
        scrolled: y > 40,
        showUp: y > 600,
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return state;
}
