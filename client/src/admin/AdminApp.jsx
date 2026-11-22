import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import './admin.css';
import { api } from './api.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { ServiceList, ServiceForm } from './pages/Services.jsx';
import WorkAdmin from './pages/Work.jsx';
import FaqAdmin from './pages/Faq.jsx';
import QuotesAdmin from './pages/Quotes.jsx';
import SettingsAdmin from './pages/Settings.jsx';
import PageText from './pages/PageText.jsx';
import SiteContent from './pages/SiteContent.jsx';
import SeoAdmin from './pages/Seo.jsx';

export default function AdminApp() {
  const [admin, setAdmin] = useState(undefined); // undefined = checking, null = logged out
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Admin | REDFOX';
    api.me().then((r) => setAdmin(r.admin)).catch(() => setAdmin(null));
    const out = () => setAdmin(null);
    window.addEventListener('rf-admin-401', out);
    return () => window.removeEventListener('rf-admin-401', out);
  }, []);

  if (admin === undefined) return <div className="ad-center">Loading…</div>;
  if (!admin) return <Login onLogin={(a) => { setAdmin(a); navigate('/admin'); }} />;

  const logout = async () => {
    await api.logout().catch(() => {});
    setAdmin(null);
  };

  return (
    <div className="ad-shell">
      <aside className="ad-side">
        <div className="ad-brand">REDFOX <small>Admin</small></div>
        <nav>
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/services">Services</NavLink>
          <NavLink to="/admin/work">Work</NavLink>
          <NavLink to="/admin/faq">FAQ</NavLink>
          <NavLink to="/admin/page-text">Page text</NavLink>
          <NavLink to="/admin/content">Site content</NavLink>
          <NavLink to="/admin/seo">SEO</NavLink>
          <NavLink to="/admin/quotes">Quotes</NavLink>
          <NavLink to="/admin/settings">Settings</NavLink>
        </nav>
        <div className="ad-side-foot">
          <a href="/" target="_blank" rel="noreferrer">View site ↗</a>
          <span>{admin.email}</span>
          <button type="button" className="ad-btn ghost" onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="ad-main">
        <Routes>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/services" element={<ServiceList />} />
          <Route path="/admin/services/new" element={<ServiceForm />} />
          <Route path="/admin/services/:id" element={<ServiceForm />} />
          <Route path="/admin/work" element={<WorkAdmin />} />
          <Route path="/admin/faq" element={<FaqAdmin />} />
          <Route path="/admin/page-text" element={<PageText />} />
          <Route path="/admin/content" element={<SiteContent />} />
          <Route path="/admin/seo" element={<SeoAdmin />} />
          <Route path="/admin/quotes" element={<QuotesAdmin />} />
          <Route path="/admin/settings" element={<SettingsAdmin />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
