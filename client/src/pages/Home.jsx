import Hero from '../components/Hero.jsx';
import Marquee from '../components/Marquee.jsx';
import AboutIntro from '../components/AboutIntro.jsx';
import Services from '../components/Services.jsx';
import Why from '../components/Why.jsx';
import Work from '../components/Work.jsx';
import Band from '../components/Band.jsx';
import InfoCards from '../components/InfoCards.jsx';
import FindUs from '../components/FindUs.jsx';
import CtaBand from '../components/CtaBand.jsx';
import VideoShowcase from '../components/VideoShowcase.jsx';
import Reviews from '../components/Reviews.jsx';
import useSeo from '../hooks/useSeo.js';

export default function Home({ content }) {
  useSeo(content, 'home');
  const { brand, services, extra, pages } = content;
  return (
    <main>
      <Hero p={pages.home} />
      <Marquee words={services.map((s) => s.title)} repeat={4} />
      <AboutIntro checklist={content.checklist} stats={content.stats} />
      <Services services={services} />
      <Why items={content.why} {...pages.why} />
      <InfoCards {...extra.approach} />
      <Work filters={content.workFilters} items={content.work} preview {...pages.work} />
      <Reviews whatsapp={brand.whatsapp} />
      <VideoShowcase channel={brand.social?.find((item) => item.id === 'youtube')?.url} />
      <InfoCards {...extra.industries} variant="chips" />
      <Band title={pages.band.title} />
      <Marquee words={['Design. Build. Grow.']} repeat={8} className="mq sun rev" />
      <CtaBand motto={brand.motto} title={pages.cta.title} />
    </main>
  );
}
