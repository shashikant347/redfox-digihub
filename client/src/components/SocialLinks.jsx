const ICONS = {
  facebook: 'M13.5 21v-7.5h2.5l.5-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.5v3h2.5V21h3.5z',
  instagram: 'M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3zm0 1.8A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9zM12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 1.8a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4zm4.7-2.6a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1z',
  youtube: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z',
  linkedin: 'M4.5 3a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8zM3 9h3v12H3V9zm5.5 0h2.9v1.7c.5-.9 1.6-1.9 3.4-1.9 3.4 0 4.2 2.2 4.2 5.1V21h-3v-6.2c0-1.5 0-3.3-2-3.3s-2.4 1.6-2.4 3.2V21h-3V9z',
  x: 'M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z',
  behance: 'M3 6.5h5.4c2.1 0 3.4 1 3.4 2.8 0 1.2-.6 2-1.6 2.4 1.3.3 2.1 1.3 2.1 2.7 0 2-1.5 3.1-3.8 3.1H3V6.5zm2.5 4.4h2.2c.8 0 1.3-.3 1.3-1s-.5-1-1.3-1H5.5v2zm0 4.6h2.5c.9 0 1.4-.4 1.4-1.2s-.5-1.2-1.4-1.2H5.5v2.4zM14.5 6h5v1.2h-5V6zm2.6 3.4c2.4 0 3.9 1.7 3.9 4.2v.5h-5.5c.1 1 .8 1.6 1.8 1.6.8 0 1.3-.3 1.5-.8h2.1c-.4 1.5-1.8 2.5-3.6 2.5-2.3 0-3.9-1.6-3.9-3.9 0-2.4 1.6-4.1 3.7-4.1zm-1.6 3.2h3.1c-.1-.9-.7-1.5-1.5-1.5-.9 0-1.5.5-1.6 1.5z',
};

export default function SocialLinks({ social = [], showHandle = false, className = '' }) {
  if (!social.length) return null;
  return (
    <ul className={`social ${showHandle ? 'social-list' : ''} ${className}`.trim()}>
      {social.map((s) => (
        <li key={s.id}>
          <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${s.label} — ${s.handle}`} title={s.label}>
            <svg className={`social-icon-${s.id}`} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d={ICONS[s.id]} /></svg>
            {showHandle && <span><b>{s.label}</b>{s.handle}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}
