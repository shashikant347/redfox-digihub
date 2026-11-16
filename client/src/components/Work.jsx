import { useState } from 'react';
import { Link } from 'react-router-dom';

/** preview = home page version: 3 tiles, no filter, link to the full Work page. */
export default function Work({ filters, items, preview = false, heading = true, tag, title, lead }) {
  const [filter, setFilter] = useState('all');
  const shown = preview ? items.slice(0, 3) : items;

  return (
    <section id="work">
      {heading && (
        <>
          <span className="tag">{tag}</span>
          <h2>{title}</h2>
          <p className="lead">{lead}</p>
        </>
      )}
      {!preview && (
        <div className="fil" id="f">
          {filters.map((f) => (
            <button key={f.key} type="button" className={filter === f.key ? 'on' : undefined} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      )}
      <div className="work">
        {shown.map((w) => (
          <div
            key={w.id}
            className={`tile ${w.tone || 't1'}${w.image ? ' has-img' : ''}`}
            style={w.image ? { backgroundImage: `url(${w.image})` } : undefined}
            hidden={!preview && filter !== 'all' && w.category !== filter}
          >
            <div>
              <small>{w.kind}</small>
              <h3>{w.title}</h3>
            </div>
          </div>
        ))}
      </div>
      {preview ? (
        <div className="cta" style={{ marginTop: 32 }}>
          <Link className="btn ghost" to="/work">See all work</Link>
        </div>
      ) : (
        <p className="note">Sample concepts for illustration. Ask us for real project examples.</p>
      )}
    </section>
  );
}
