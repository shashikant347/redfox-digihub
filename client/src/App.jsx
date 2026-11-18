import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { getContent } from './api/client.js';
import useScrollState from './hooks/useScrollState.js';
import useReveal from './hooks/useReveal.js';
import useTilt from './hooks/useTilt.js';
import useSpotlight from './hooks/useSpotlight.js';

import Intro from './components/Intro.jsx';
import Header from './components/Header.jsx';
import Drawer from './components/Drawer.jsx';
import Footer from './components/Footer.jsx';
import ScrollUi from './components/ScrollUi.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

import Home from './pages/Home.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import ServiceDetail from './pages/ServiceDetail.jsx';
import WorkPage from './pages/WorkPage.jsx';
import ProcessPage from './pages/ProcessPage.jsx';
import FaqPage from './pages/FaqPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const load = useCallback(() => {
    setError('');
    getContent().then(setContent).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const ready = !!content;
  const { progress, scrolled, showUp } = useScrollState();
  useSpotlight();
  useReveal(ready, pathname); // re-run for every page
  useTilt(ready, pathname);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useEffect(() => setMenuOpen(false), [pathname]);

  if (error) {
    return (
      <div className="app-state">
        <h2>We couldn’t load the page</h2>
        <p>{error}</p>
        <button className="btn" type="button" onClick={load}>Try again</button>
      </div>
    );
  }
  if (!content) return <div className="app-state" aria-busy="true"><p>Loading…</p></div>;

  const { brand, services } = content;
  return (
    <>
      <Intro name={brand.name} />
      <div className="spot" aria-hidden="true" />
      <div className="cursor-ring" aria-hidden="true" />
      <ScrollToTop />
      <Header brand={brand} services={services} scrolled={scrolled} menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} />
      <Drawer services={services} open={menuOpen} onClose={closeMenu} />
      <Routes>
        <Route path="/" element={<Home content={content} />} />
        <Route path="/about" element={<AboutPage content={content} />} />
        <Route path="/services" element={<ServicesPage content={content} />} />
        <Route path="/services/:id" element={<ServiceDetail content={content} />} />
        <Route path="/work" element={<WorkPage content={content} />} />
        <Route path="/process" element={<ProcessPage content={content} />} />
        <Route path="/faq" element={<FaqPage content={content} />} />
        <Route path="/contact" element={<ContactPage content={content} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer brand={brand} services={services} />
      <ScrollUi progress={progress} showUp={showUp} />
    </>
  );
}
