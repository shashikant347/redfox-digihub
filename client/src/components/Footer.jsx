import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import SocialLinks from './SocialLinks.jsx';

export default function Footer({ brand, services }) {
  return (
    <footer>
      <div className="in">
        <div className="cols">
          <div>
            <Logo brand={brand} light />
            <p style={{ marginTop: 16 }}>Branding, websites, marketing and Photo, Video & Reel from one team.</p>
          </div>
          <div>
            <h4>Pages</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/work">Our work</Link>
            <Link to="/process">Process</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/blog">Blog</Link>
          </div>
          <div>
            <h4>Services</h4>
            {services.map((s) => (
              <Link key={s.id} to={`/services/${s.id}`}>{s.title}</Link>
            ))}
          </div>
          <div>
            <h4>Contact</h4>
            <p><a href={brand.phoneHref}>{brand.phone}</a></p>
            <p>{brand.website}</p>
            <p>{brand.email}</p>
            <p><a href={brand.mapUrl} target="_blank" rel="noopener noreferrer">{brand.address}</a></p>
            <h4 style={{ marginTop: 18 }}>Follow us</h4>
            <SocialLinks social={brand.social} />
          </div>
        </div>
        <div className="copy">© {brand.name} Advertising &amp; Marketing · {brand.motto}</div>
      </div>
    </footer>
  );
}
