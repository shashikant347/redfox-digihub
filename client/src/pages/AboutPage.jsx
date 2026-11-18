import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb.jsx';
import Stat from '../components/Stat.jsx';
import Why from '../components/Why.jsx';
import Marquee from '../components/Marquee.jsx';
import InfoCards from '../components/InfoCards.jsx';
import FindUs from '../components/FindUs.jsx';
import CtaBand from '../components/CtaBand.jsx';
import useSeo from '../hooks/useSeo.js';
import { assetUrl } from '../api/config.js';

export default function AboutPage({ content }) {
  useSeo(content, 'about');
  const { about, images, stats, why, process, brand, services, extra, pages } = content;

  return (
    <main>
      {/* 1. Hero */}
      <section className="ab-hero">
        <div className="ab-hero-copy">
          <Breadcrumb current="About" />
          <h1 className="rvx">{about.title}</h1>
          <p className="lead rvx">{about.lead}</p>
          <div className="cta rvx">
            <Link className="btn" to="/contact">Get quote</Link>
            <Link className="btn ghost" to="/services">Our services</Link>
          </div>
        </div>
        <figure className="pg-fig ab-hero-fig rvx">
          <img src={assetUrl(images.aboutHero.src)} alt={images.aboutHero.alt} />
        </figure>
      </section>

      {/* 2. Numbers */}
      <section className="ab-numbers">
        <div className="stats">
          {stats.map((s) => (<Stat key={s.label} value={s.value} label={s.label} />))}
        </div>
      </section>

      {/* 3. Story */}
      <section className="ab-story" id="story">
        <figure className="pg-fig ab-story-fig rvx">
          <img src={assetUrl(images.aboutStory.src)} alt={images.aboutStory.alt} loading="lazy" />
        </figure>
        <div>
          <span className="tag rvx">{pages.about.storyTag}</span>
          <h2 className="rvx">{pages.about.storyTitle}</h2>
          {about.story.map((p, i) => (<p className="ab-p rvx" key={i}>{p}</p>))}
          <blockquote className="ab-quote rvx">{about.quote}</blockquote>
          <div className="cta rvx">
            <Link className="btn" to="/process">See how we work</Link>
          </div>
        </div>
      </section>

      {/* 4. What we stand for */}
      <Why
        items={why}
        tag="What we stand for"
        title="Four promises we keep on every project"
        lead="No surprises. You know the plan, the timeline and the price before we start."
      />

      <InfoCards {...extra.mission} />
      <InfoCards {...extra.values} dark />

      {/* 5. Team */}
      <section className="ab-team-sec" id="team">
        <span className="tag">{pages.about.teamTag}</span>
        <h2>{pages.about.teamTitle}</h2>
        <p className="lead">{pages.about.teamLead}</p>
        <div className="ab-team">
          {about.team.map((t) => (
            <article className="ab-card rvx" key={t.role}>
              <img src={assetUrl(t.image)} alt="" loading="lazy" />
              <div>
                <h3>{t.role}</h3>
                <p>{t.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 6. How a project runs */}
      <section className="ab-steps-sec">
        <span className="tag">How a project runs</span>
        <h2>From first message to results</h2>
        <ol className="ab-steps">
          {process.map((s, i) => (
            <li className="rvx" key={s.title}>
              <span>{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <InfoCards {...extra.industries} variant="chips" />
      <FindUs brand={brand} />
      <Marquee words={services.map((s) => s.title)} repeat={4} className="mq about-scroll" />
      <CtaBand motto={brand.motto} title="Tell us about your project" />
    </main>
  );
}
