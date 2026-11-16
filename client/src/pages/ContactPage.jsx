import PageHead from '../components/PageHead.jsx';
import Quote from '../components/Quote.jsx';
import InfoCards from '../components/InfoCards.jsx';
import FindUs from '../components/FindUs.jsx';
import useSeo from '../hooks/useSeo.js';

export default function ContactPage({ content }) {
  useSeo(content, 'contact');
  const { brand, images, extra, services, pages } = content;
  return (
    <main>
      <PageHead crumb="Contact" title={pages.contact.title} lead={pages.contact.lead} />
      <Quote brand={brand} services={services} image={images.contact} />
      <InfoCards {...extra.afterSend} />
      <FindUs brand={brand} cta={false} />
    </main>
  );
}
