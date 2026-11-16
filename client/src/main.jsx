import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import App from './App.jsx';
import './styles/global.css';
import './styles/app.css';
import './styles/pages.css';

// Play the intro animation only on the first visit of a browser session.
try {
  if (sessionStorage.rf) document.documentElement.classList.add('ni');
  else sessionStorage.rf = 1;
} catch {
  /* storage blocked: just play the intro */
}

// The admin panel is loaded only when someone opens /admin, so the public site stays light.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

function Root() {
  const { pathname } = useLocation();
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return (
      <Suspense fallback={<div className="app-state"><p>Loading…</p></div>}>
        <AdminApp />
      </Suspense>
    );
  }
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </React.StrictMode>
);
