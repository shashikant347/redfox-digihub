import { Link } from 'react-router-dom';
import Stat from './Stat.jsx';

/** Short About block for the home page (the full story is on /about). */
export default function AboutIntro({ checklist, stats }) {
  return (
    <section id="about">
      <div className="two">
        <div>
          <span className="tag">About REDFOX</span>
          <h2>One team for your whole brand</h2>
          <p className="lead" style={{ fontSize: 19, maxWidth: '66ch' }}>
            REDFOX designs the brand, builds the website, shoots the photos and runs the campaigns, so everything looks and
            sounds like one business. We plan first, then make it to your budget.
          </p>
          <ul className="chk">
            {checklist.map((item) => (<li key={item}>{item}</li>))}
          </ul>
          <div className="cta" style={{ marginTop: 36 }}>
            <Link className="btn" to="/about">More about us</Link>
            <Link className="btn ghost" to="/services">Our services</Link>
          </div>
        </div>
        <div className="about-visual" aria-hidden="true">
          <span className="visual-orb one">R</span>
          <span className="visual-orb two">✦</span>
          <span className="visual-spark" />
          <div className="brand-card">
            <div className="brand-card-top">
              <span className="brand-card-label">REDFOX online</span>
              <span className="brand-card-mark"><img src="/logo-mark.png" alt="" /></span>
            </div>
            <div>
              <h3>One brand.<br />One bold idea.</h3>
              <p>DESIGN · BUILD · GROW</p>
            </div>
            <div className="brand-card-bottom">
              <span>Identity / 2025</span>
              <span>01 — 06</span>
            </div>
          </div>
        </div>
      </div>
      <div className="stats">
        {stats.map((s) => (<Stat key={s.label} value={s.value} label={s.label} />))}
      </div>
    </section>
  );
}
