export default function Why({
  items,
  tag = 'Why REDFOX',
  title = 'Built to make your business easy to choose',
  lead = 'Everything you need to look good and get found, handled together.',
}) {
  return (
    <div className="dark">
      <section id="why">
        <span className="tag">{tag}</span>
        <h2>{title}</h2>
        <p className="lead">{lead}</p>
        <div className="why">
          {items.map((w) => (
            <div key={w.n}>
              <em>{w.n}</em>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
