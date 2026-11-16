import { Link } from 'react-router-dom';

/** Header: dark wordmark. Footer (light): white-text wordmark for the dark background. */
export default function Logo({ brand, light = false }) {
  return (
    <Link className="logo" to="/" aria-label={`${brand.name} ${brand.tagline} — home`}>
      <img
        className="logo-img"
        src={light ? '/logo-word-light.png' : '/logo-word.png'}
        alt={`${brand.name} ${brand.tagline}`}
        width="841"
        height="191"
      />
    </Link>
  );
}
