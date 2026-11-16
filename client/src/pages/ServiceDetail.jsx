import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb.jsx';
import InfoCards from '../components/InfoCards.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import Band from '../components/Band.jsx';
import NotFound from './NotFound.jsx';
import useSeo from '../hooks/useSeo.js';
import { assetUrl } from '../api/config.js';

export default function ServiceDetail({ content }) {
  const { id } = useParams();
  const { services, brand } = content;
  const idx = services.findIndex((s) => s.id === id);
  const s = services[idx];
  useSeo(content, 'services', s);
  if (!s) return <NotFound />;

  const d = s.detail;
  const prev = services[(idx - 1 + services.length) % services.length];
  const next = services[(idx + 1) % services.length];
  const others = services.filter((x) => x.id !== s.id).slice(0, 3);
  const quote = `/contact?service=${encodeURIComponent(s.title)}`;

  return (
    <main>
      <section className="ab-hero sd-hero">
        <div className="ab-hero-copy">
          <Breadcrumb current={s.title} trail={[{ label: 'Services', to: '/services' }]} />
          <span className="sd-kicker rvx">{s.title}</span>
          <h1 className="rvx">{d.headline}</h1>
          <p className="lead rvx">{d.intro}</p>
          <div className="cta rvx">
            <Link className="btn" to={quote}>Get quote for {s.title}</Link>
            <Link className="btn ghost" to="/process">How we work</Link>
          </div>
        </div>
        <figure className="pg-fig ab-hero-fig rvx">
          <img src={assetUrl(s.image)} alt={`${s.title} illustration`} />
        </figure>
      </section>

      <section className="sd-quick">
        <ul className="sd-points">
          {s.points.map((pt) => (<li className="rvx" key={pt}>{pt}</li>))}
        </ul>
      </section>

      <InfoCards tag="Why it matters" title={`What ${s.title} does for your business`} items={d.benefits} />

      <div className="dark">
        <section className="xc xc-sec sd-deliver">
          <span className="tag">What you get</span>
          <h2>Everything included in {s.title}</h2>
          <p className="lead">Share your needs and we shape the list around them. These are the things we commonly deliver.</p>
          <ul className="chk sd-list">
            {d.deliverables.map((it) => (<li key={it}>{it}</li>))}
          </ul>
        </section>
      </div>

      <section className="xc xc-sec">
        <span className="tag">How it works</span>
        <h2>Our {s.title.toLowerCase()} process</h2>
        <ol className="sd-steps">
          {d.steps.map((st, i) => (
            <li className="rvx" key={st.title}>
              <span>{i + 1}</span>
              <h3>{st.title}</h3>
              <p>{st.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <InfoCards tag="Great for" title={`Who ${s.title} is for`} items={d.forWho} variant="chips" />

      <section className="xc xc-sec sd-faq">
        <span className="tag">Questions</span>
        <h2>{s.title} FAQs</h2>
        {d.faqs.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>

      <section className="xc xc-sec">
        <span className="tag">Keep exploring</span>
        <h2>Other services you may need</h2>
        <div className="svc-grid svc-grid-3">
          {others.map((o) => (<ServiceCard key={o.id} service={o} compact />))}
        </div>
        <nav className="sd-pager" aria-label="More services">
          <Link to={`/services/${prev.id}`}><small>← Previous</small>{prev.title}</Link>
          <Link to="/services" className="sd-all">All services</Link>
          <Link to={`/services/${next.id}`}><small>Next →</small>{next.title}</Link>
        </nav>
      </section>

      <Band title={`Ready to start with ${s.title}?`} />
    </main>
  );
}
