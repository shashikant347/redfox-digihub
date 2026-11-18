import { useRef } from 'react';
import { Link } from 'react-router-dom';
import useSpotlight from '../hooks/useSpotlight.js';

export default function Hero({ p }) {
  const ref = useRef(null);
  useSpotlight(ref);

  return (
    <div className="hc" id="hc" ref={ref}>
      <div className="badge" aria-hidden="true">
        <svg viewBox="0 0 150 150">
          <circle cx="75" cy="75" r="72" fill="#ffd24a" stroke="#1b1b1b" strokeWidth="3" />
          <defs>
            <path id="cp" d="M75 75 m-52 0 a52 52 0 1 1 104 0 a52 52 0 1 1 -104 0" />
          </defs>
          <text fontFamily="Plus Jakarta Sans,sans-serif" fontWeight="800" fontSize="15" letterSpacing="3" fill="#1b1b1b">
            <textPath href="#cp">DESIGN · BUILD · GROW · CREATING NEXT ·</textPath>
          </text>
          <path d="M75 55l6 14 15 1-12 10 4 15-13-8-13 8 4-15-12-10 15-1z" fill="#e8321a" stroke="#1b1b1b" strokeWidth="2" />
        </svg>
      </div>
      <span className="fl a" />
      <span className="fl b" />
      <span className="fl c" />
      <div className="spot" />
      <div className="hcin">
        <div>
          <span className="chip">{p.chip}</span>
          <h1>
            {p.title1}<br />
            <span className="gr">{p.titleAccent}</span>
          </h1>
          <p>{p.text}</p>
          <div className="cta">
            <Link className="btn glow" to="/contact">{p.btnPrimary}</Link>
            <Link className="btn ghost" to="/services">{p.btnSecondary}</Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-orbit hero-orbit-outer" />
          <div className="hero-orbit hero-orbit-inner" />
          <div className="hero-artboard">
            <div className="hero-artboard-head">
              <span className="hero-brand-dot" />
              <span>REDFOX / CREATIVE STUDIO</span>
              <span>01 — 06</span>
            </div>
            <div className="hero-artwork">
              <span className="hero-artwork-label">BRAND SYSTEMS · 2026</span>
              <strong>MAKE<br />IT MATTER.</strong>
              <span className="hero-artwork-mark">R</span>
            </div>
            <div className="hero-artboard-foot">
              <span>IDENTITY</span>
              <span>WEB</span>
              <span>GROWTH</span>
            </div>
          </div>
          <div className="hero-float hero-float-brand"><span>01</span><b>Brand<br />identity</b></div>
          <div className="hero-float hero-float-web"><span className="hero-live-dot" /><b>Web experience<small>READY TO LAUNCH</small></b></div>
          <div className="hero-stamp">DESIGN<br />BUILD<br />GROW</div>
        </div>
      </div>
    </div>
  );
}
