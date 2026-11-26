import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo.jsx';

const act = ({ isActive }) => (isActive ? 'act' : undefined);

export default function Header({ brand, services, scrolled, onOpenMenu, menuOpen }) {
  return (
    <header className={scrolled ? 'sh' : undefined}>
      <Logo brand={brand} />
      <nav className="tabs" aria-label="Main">
        <NavLink to="/" end className={act}>Home</NavLink>
        <NavLink to="/about" className={act}>About</NavLink>
        <div className="dd">
          <NavLink to="/services" className={act}>Services ▾</NavLink>
          <div className="menu">
            {services.map((s) => (
              <Link key={s.id} to={`/services/${s.id}`}>{s.title}</Link>
            ))}
          </div>
        </div>
        <NavLink to="/work" className={act}>Work</NavLink>
        <NavLink to="/process" className={act}>Process</NavLink>
        <NavLink to="/faq" className={act}>FAQ</NavLink>
        <NavLink to="/contact" className={act}>Contact</NavLink>
        <NavLink to="/blog" className={act}>Blog</NavLink>
      </nav>
      <div className="right">
        <Link className="btn" to="/contact">Get quote</Link>
        <button className="burger" id="open" type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={onOpenMenu}>
          <i />Menu
        </button>
      </div>
    </header>
  );
}
