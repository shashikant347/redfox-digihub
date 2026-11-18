import { Link } from 'react-router-dom';

/** Header: dark wordmark. Footer (light): white-text wordmark for the dark background. */
export default function Logo({ brand, light = false }) {
  return (
    <Link className={`logo${light ? ' logo-light' : ' logo-mark-only'}`} to="/" aria-label={`${brand.name} ${brand.tagline} — home`}>
      <img
        className="logo-img"
        src={light ? '/logo-word-light.png' : '/logo-mark.png'}
        alt={light ? `${brand.name} ${brand.tagline}` : `${brand.name} fox mark`}
        width={light ? 841 : 507}
        height={light ? 191 : 422}
      />
    </Link>
  );
}
