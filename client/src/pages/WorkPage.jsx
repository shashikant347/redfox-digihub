import PageHead from '../components/PageHead.jsx';
import Work from '../components/Work.jsx';
import InfoCards from '../components/InfoCards.jsx';
import FindUs from '../components/FindUs.jsx';
import Band from '../components/Band.jsx';
import useSeo from '../hooks/useSeo.js';

export default function WorkPage({ content }) {
  useSeo(content, 'work');
  const { pages } = content;
  return (
    <main>
      <PageHead crumb="Work" title={pages.work.pageTitle} lead={pages.work.lead} />
      <Work filters={content.workFilters} items={content.work} heading={false} />
      <InfoCards {...content.extra.approach} />
      <Band title={pages.band.title} />
    </main>
  );
}
