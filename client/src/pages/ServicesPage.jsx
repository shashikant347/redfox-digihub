import { Navigate, useLocation } from 'react-router-dom';
import PageHead from '../components/PageHead.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import InfoCards from '../components/InfoCards.jsx';
import CtaBand from '../components/CtaBand.jsx';
import useSeo from '../hooks/useSeo.js';

export default function ServicesPage({ content }) {
  useSeo(content, 'services');
  const { hash } = useLocation();
  const { services, brand, extra, pages } = content;

  // Old links like /services#web-design now go to the service's own page.
  const target = hash && services.find((s) => s.id === hash.slice(1));
  if (target) return <Navigate to={`/services/${target.id}`} replace />;

  return (
    <main>
      <PageHead crumb="Services" title={pages.services.title} lead={pages.services.lead} />
      <section className="svc-grid-sec">
        <div className="svc-grid">
          {services.map((s, i) => (<ServiceCard key={s.id} service={s} index={i} />))}
        </div>
      </section>
      <InfoCards {...extra.included} dark />
      <InfoCards {...extra.industries} variant="chips" />
      <CtaBand motto={brand.motto} />
    </main>
  );
}
