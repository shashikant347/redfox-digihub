// Puts the right <title> and description into index.html for every URL,
// so Google, WhatsApp and Facebook previews see them without running JavaScript.
const KEYS = { '/': 'home', '/about': 'about', '/services': 'services', '/work': 'work', '/process': 'process', '/faq': 'faq', '/contact': 'contact' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function resolveMeta(content, pathname) {
  const { siteName, pages } = content.seo;
  const p = pathname.replace(/\/+$/, '') || '/';
  const key = KEYS[p];
  if (key) {
    const m = pages[key];
    return { title: key === 'home' ? m.title : `${m.title} — ${siteName}`, description: m.description, known: true };
  }
  const m = p.match(/^\/services\/([^/]+)$/);
  if (m) {
    let slug = m[1];
    try { slug = decodeURIComponent(slug); } catch { /* keep raw */ }
    const s = content.services.find((x) => x.id === slug);
    if (s) {
      return { title: `${s.seoTitle || s.title} — ${siteName}`, description: s.seoDescription || s.text || pages.services.description, known: true };
    }
  }
  return { title: pages.home.title, description: pages.home.description, known: false };
}

export function renderIndex(html, meta, { url, noindex = false } = {}) {
  const t = esc(meta.title);
  const d = esc(meta.description);
  const extra = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    url ? `<meta property="og:url" content="${esc(url)}" />` : '',
    url ? `<link rel="canonical" href="${esc(url)}" />` : '',
    noindex ? `<meta name="robots" content="noindex, nofollow" />` : '',
  ].filter(Boolean).join('\n    ');
  return html
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${t}</title>`)
    .replace(/<meta name="description"[^>]*>/, () => `<meta name="description" content="${d}" />`)
    .replace('</head>', () => `    ${extra}\n  </head>`);
}

export function buildSitemap(content, base) {
  const urls = ['/', '/about', '/services', '/work', '/process', '/faq', '/contact', ...content.services.map((s) => `/services/${encodeURIComponent(s.id)}`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${esc(base + u)}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
}
