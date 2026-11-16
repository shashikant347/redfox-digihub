import { Link } from 'react-router-dom';
import PageHead from '../components/PageHead.jsx';
import Faq from '../components/Faq.jsx';
import InfoCards from '../components/InfoCards.jsx';
import FindUs from '../components/FindUs.jsx';
import Band from '../components/Band.jsx';
import useSeo from '../hooks/useSeo.js';

export default function FaqPage({ content }) {
  useSeo(content, 'faq');
  const { pages } = content;
  return (
    <main>
      <PageHead crumb="FAQ" title={pages.faq.title} lead={pages.faq.lead} />
      <Faq items={content.faq} heading={false} />
      <InfoCards {...content.extra.needFromYou} variant="checks" />
      <section className="faq-more">
        <h2>{pages.faq.moreTitle}</h2>
        <p className="lead">{pages.faq.moreText}</p>
        <Link className="btn ghost" to="/contact">Contact us</Link>
      </section>
      <Band title={pages.band.title} />
    </main>
  );
}
