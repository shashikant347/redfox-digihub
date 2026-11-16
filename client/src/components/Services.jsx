import { useRef } from 'react';
import { Link } from 'react-router-dom';
import useDragScroll from '../hooks/useDragScroll.js';

/** Home page service carousel. */
export default function Services({ services }) {
  const scrollRef = useRef(null);
  const { dragging, scrollByStep } = useDragScroll(scrollRef);

  return (
    <section id="services">
      <h2>Services</h2>
      <p className="lead">Swipe, drag or use the arrows.</p>
      <div className="arr">
        <button type="button" id="pv" aria-label="Previous service" onClick={() => scrollByStep(-1)}>←</button>
        <button type="button" id="nx" aria-label="Next service" onClick={() => scrollByStep(1)}>→</button>
      </div>
      <div className={dragging ? 'scr dg' : 'scr'} id="scr" ref={scrollRef}>
        {services.map((s) => (
          <div className="sc" key={s.id}>
            <i />
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <Link className="svc-more" to={`/services/${s.id}`}>Learn more <span aria-hidden="true">→</span></Link>
          </div>
        ))}
      </div>
      <div className="cta" style={{ marginTop: 12 }}>
        <Link className="btn ghost" to="/services">All services</Link>
      </div>
    </section>
  );
}
