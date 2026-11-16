import PageHead from '../components/PageHead.jsx';
import Process from '../components/Process.jsx';
import InfoCards from '../components/InfoCards.jsx';
import FindUs from '../components/FindUs.jsx';
import CtaBand from '../components/CtaBand.jsx';
import useSeo from '../hooks/useSeo.js';

export default function ProcessPage({ content }) {
  useSeo(content, 'process');
  const { images, process, brand, pages } = content;
  return (
    <main>
      <PageHead crumb="Process" title={pages.process.title} lead={pages.process.lead} />
      <div className="pg-split">
        <Process steps={process} heading={false} />
        <figure className="pg-fig pg-fig-side rvx">
          <img src={images.process.src} alt={images.process.alt} loading="lazy" />
        </figure>
      </div>
      <InfoCards {...content.extra.needFromYou} variant="checks" />
      <InfoCards {...content.extra.included} dark />
      <CtaBand motto={brand.motto} />
    </main>
  );
}
