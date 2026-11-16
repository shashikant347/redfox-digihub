/** Reusable content block: numbered cards, tick list or chips. */
export default function InfoCards({ tag, title, lead, items = [], variant = 'cards', dark = false, id }) {
  const body = (
    <section className={`xc xc-sec xc-v-${variant}`} id={id}>
      {tag && <span className="tag">{tag}</span>}
      {title && <h2>{title}</h2>}
      {lead && <p className="lead">{lead}</p>}
      {variant === 'cards' && (
        <div className="xc-grid">
          {items.map((it, i) => (
            <article className="xc-card rvx" key={it.title}>
              <em>{String(i + 1).padStart(2, '0')}</em>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </article>
          ))}
        </div>
      )}
      {variant === 'chips' && (
        <ul className="xc-chips">
          {items.map((it) => (<li className="rvx" key={it}>{it}</li>))}
        </ul>
      )}
      {variant === 'checks' && (
        <ul className="chk xc-checks">
          {items.map((it) => (<li key={it}>{it}</li>))}
        </ul>
      )}
    </section>
  );
  return dark ? <div className="dark">{body}</div> : body;
}
