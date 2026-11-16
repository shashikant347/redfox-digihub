import { Link } from 'react-router-dom';

export default function ServiceCard({ service, index, compact = false }) {
  const s = service;
  return (
    <article className="svc-card rvx">
      <Link className="svc-card-fig" to={`/services/${s.id}`} tabIndex={-1} aria-hidden="true">
        <img src={s.image} alt="" loading="lazy" />
        {typeof index === 'number' && <span className="svc-card-n">{String(index + 1).padStart(2, '0')}</span>}
      </Link>
      <div className="svc-card-body">
        <h3><Link to={`/services/${s.id}`}>{s.title}</Link></h3>
        <p>{s.text}</p>
        {!compact && (
          <ul className="chk">
            {s.points.map((pt) => (<li key={pt}>{pt}</li>))}
          </ul>
        )}
        <div className="svc-card-cta">
          <Link className="svc-more" to={`/services/${s.id}`}>Learn more <span aria-hidden="true">→</span></Link>
          {!compact && <Link className="btn ghost" to={`/contact?service=${encodeURIComponent(s.title)}`}>Get quote</Link>}
        </div>
      </div>
    </article>
  );
}
