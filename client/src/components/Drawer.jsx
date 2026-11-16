import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Drawer({ services, open, onClose }) {
  useEffect(() => {
    document.body.classList.toggle('open', open);
    return () => document.body.classList.remove('open');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div className="scrim" id="scrim" onClick={onClose} />
      <aside className="drawer" id="drawer" aria-label="Site menu" aria-hidden={!open}>
        <button className="close" id="close" type="button" onClick={onClose}>Close</button>
        <h4>Pages</h4>
        <Link to="/" onClick={onClose}>Home</Link>
        <Link to="/about" onClick={onClose}>About</Link>
        <Link to="/services" onClick={onClose}>Services</Link>
        <Link to="/work" onClick={onClose}>Our work</Link>
        <Link to="/process" onClick={onClose}>Process</Link>
        <Link to="/faq" onClick={onClose}>FAQ</Link>
        <Link to="/contact" onClick={onClose}>Contact</Link>
        <h4>Services</h4>
        {services.map((s) => (
          <Link key={s.id} className="s" to={`/services/${s.id}`} onClick={onClose}>{s.title}</Link>
        ))}
        <Link className="btn" to="/contact" onClick={onClose}>Get quote</Link>
      </aside>
    </>
  );
}
