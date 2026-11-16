import { Link } from 'react-router-dom';

export default function CtaBand({ motto, title = 'Let’s build your brand' }) {
  return (
    <div className="cta2">
      <section>
        <span className="tag">{motto}</span>
        <h2>{title}</h2>
        <Link className="btn" to="/contact">Get quote</Link>
      </section>
    </div>
  );
}
