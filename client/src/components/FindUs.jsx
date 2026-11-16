import { Link } from 'react-router-dom';

export default function FindUs({ brand, cta = true }) {
  return (
    <section className="xc find">
      <div className="find-box rvx">
        <div>
          <span className="tag">Find us</span>
          <h2>Visit our studio in Patna</h2>
          <p className="lead">Drop in, call or send us your brief online. We are happy to talk about your project.</p>
          <div className="cta">
            <a className="btn" href={brand.mapUrl} target="_blank" rel="noopener noreferrer">Open in Maps</a>
            {cta && <Link className="btn ghost" to="/contact">Send a message</Link>}
          </div>
        </div>
        <address>
          <b>{brand.name} {brand.tagline}</b>
          <span>{brand.address}</span>
          <a href={brand.phoneHref}>{brand.phone}</a>
          <span>{brand.email}</span>
          <span>{brand.website}</span>
        </address>
      </div>
    </section>
  );
}
