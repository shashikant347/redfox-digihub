export default function Faq({ items, heading = true }) {
  return (
    <section id="faq">
      {heading && (
        <>
          <h2>Questions</h2>
          <p className="lead">Quick answers before you get in touch.</p>
        </>
      )}
      {items.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </section>
  );
}
