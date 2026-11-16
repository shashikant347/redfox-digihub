import { useEffect, useState, useCallback } from 'react';

/**
 * Horizontal scroller helpers: mouse drag-to-scroll plus previous/next arrow buttons.
 * Returns { dragging, scrollByStep }.
 */
export default function useDragScroll(ref) {
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startLeft = 0;

    const onDown = (e) => {
      if (e.pointerType !== 'mouse') return; // touch uses native swipe
      down = true;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) setDragging(true);
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      down = false;
      setDragging(false);
    };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [ref]);

  const scrollByStep = useCallback(
    (direction) => {
      const el = ref.current;
      if (!el) return;
      const step = Math.min(el.clientWidth * 0.8, 330);
      el.scrollBy({ left: direction * step, behavior: 'smooth' });
    },
    [ref]
  );

  return { dragging, scrollByStep };
}
