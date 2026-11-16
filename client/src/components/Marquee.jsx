/** Scrolling text strip. `words` are repeated `repeat` times so the loop is seamless. */
export default function Marquee({ words, repeat = 1, className = 'mq' }) {
  const items = Array.from({ length: repeat }, () => words).flat();
  return (
    <div className={className} aria-hidden="true">
      <div>
        {items.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
    </div>
  );
}
