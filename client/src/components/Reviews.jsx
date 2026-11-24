export default function Reviews({ whatsapp }) {
  return (
    <section className="reviews-section" aria-labelledby="reviews-title">
      <div className="reviews-inner">
        <div className="reviews-copy">
          <span className="reviews-kicker"><i /> Client voices</span>
          <h2 id="reviews-title">Good work is a team effort.</h2>
          <p>We’re making room for honest feedback from the people we work with. Share your experience and help others know what it’s like to work with Red Fox.</p>
          <a className="reviews-cta" href={whatsapp || '/contact'} target={whatsapp ? '_blank' : undefined} rel={whatsapp ? 'noopener noreferrer' : undefined}>
            Share your experience <span aria-hidden="true">&#8599;</span>
          </a>
        </div>

        <article className="reviews-note">
          <span className="reviews-quote-mark" aria-hidden="true">“</span>
          <img className="reviews-mark" src="/logo-mark.png" alt="" />
          <span className="reviews-note-label">A note to our clients</span>
          <h3>Your words could be featured here.</h3>
          <p>Worked with us? Tell us what went well. We’d love to hear from you.</p>
          <span className="reviews-note-line" />
          <small>REDFOX · PATNA</small>
        </article>
      </div>
    </section>
  );
}
