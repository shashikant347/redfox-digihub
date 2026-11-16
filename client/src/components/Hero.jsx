import { useRef } from 'react';
import { Link } from 'react-router-dom';
import useSpotlight from '../hooks/useSpotlight.js';
import useCubeParallax from '../hooks/useCubeParallax.js';

export default function Hero({ p }) {
  const ref = useRef(null);
  const cubeRef = useRef(null);
  useSpotlight(ref);
  useCubeParallax(ref, cubeRef);

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
        <div className="cubewrap" ref={cubeRef} aria-hidden="true">
          <div className="ring" />
          <div className="ring r2" />
          <div className="cube">
            <div>Brand Design</div>
            <div>Web Development</div>
            <div>Web Design</div>
            <div>Digital Marketing</div>
            <div>Photography</div>
            <div>Graphic Design</div>
          </div>
        </div>
      </div>
    </div>
  );
}
