import { Link } from 'react-router-dom';

const Chevron = () => (
  <li className="crumb-sep" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7" /></svg>
  </li>
);

/** Home / [trail…] / current. `trail` is an optional list of { label, to }. */
export default function Breadcrumb({ current, trail = [] }) {
  return (
    <nav className="crumb rvx" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link to="/">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /><path d="M10 19.5v-5h4v5" />
            </svg>
            Home
          </Link>
        </li>
        {trail.map((t) => (
          <FragmentItem key={t.to} t={t} />
        ))}
        <Chevron />
        <li className="crumb-now" aria-current="page"><span>{current}</span></li>
      </ol>
    </nav>
  );
}

function FragmentItem({ t }) {
  return (
    <>
      <Chevron />
      <li><Link to={t.to}>{t.label}</Link></li>
    </>
  );
}
