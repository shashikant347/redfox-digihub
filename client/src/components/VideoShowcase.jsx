const videos = [
  { number: '01', title: 'Ideas in motion', kind: 'Brand stories' },
  { number: '02', title: 'Made for the feed', kind: 'Reels & shorts' },
  { number: '03', title: 'Built to grow', kind: 'Our services' },
];
const shorts = [
  { id: 'ZukQDeW0tjg', title: 'Red Fox Short 01' },
  { id: 'Q4yfAqX8LEk', title: 'Red Fox Short 02' },
  { id: 'ZiQBTgi8Ivc', title: 'Red Fox Short 03' },
];

export default function VideoShowcase({ channel = 'https://www.youtube.com/@redfoxonline' }) {
  const channelUrl = channel || 'https://www.youtube.com/@redfoxonline';
  const handle = channelUrl.match(/@([^/?]+)/)?.[1] || 'redfoxonline';
  const featuredVideoId = 'h4V5lRwVksc';

  return (
    <section className="video-showcase" aria-labelledby="video-showcase-title">
      <div className="video-showcase-head">
        <div>
          <span className="video-kicker"><i /> Red Fox on screen</span>
          <h2 id="video-showcase-title">Good work<br /><span>looks better</span> in motion.</h2>
        </div>
        <p>Meet the people, ideas and services behind the work. Watch our latest videos and quick hits from the studio.</p>
      </div>

      <div className="video-showcase-grid">
        <div className="video-feature">
          <div className="video-player-wrap">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${featuredVideoId}`}
              title="Red Fox videos on YouTube"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <a className="video-feature-foot" href={`${channelUrl.replace(/\/$/, '')}/videos`} target="_blank" rel="noopener noreferrer"><span>See all videos on YouTube</span><span aria-hidden="true">↗</span></a>
        </div>

        <div className="video-side">
          {videos.map((video) => (
            <a className="video-link-card" key={video.number} href={channelUrl} target="_blank" rel="noopener noreferrer">
              <span className="video-card-no">{video.number}</span>
              <span className="video-card-copy"><small>{video.kind}</small><b>{video.title}</b></span>
              <span className="video-card-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
          <a className="video-channel-link" href={channelUrl} target="_blank" rel="noopener noreferrer">
            <span className="video-youtube-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" /></svg></span>
            <span><small>Follow along</small><b>@{handle}</b></span>
            <span className="video-card-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className="shorts-highlight">
        <div className="shorts-copy">
          <span className="video-kicker"><i /> YouTube Shorts</span>
          <h3>Big ideas.<br /><span>Short stories.</span></h3>
          <p>Quick creative inspiration and Red Fox moments, made for the scroll.</p>
          <a href={`${channelUrl.replace(/\/$/, '')}/shorts`} target="_blank" rel="noopener noreferrer">Explore more Shorts <span aria-hidden="true">&#8599;</span></a>
        </div>
        <div className="shorts-players">
          {shorts.map((short) => (
            <div className="shorts-player" key={short.id}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${short.id}?playsinline=1&rel=0`}
                title={short.title}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
