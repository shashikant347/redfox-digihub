import { useEffect } from 'react';

function setMeta(attr, name, value) {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

/** Title + description for a page (admin: SEO). Pass a page key, or a service for service pages. */
export function seoFor(content, key, service) {
  const { siteName, pages } = content.seo;
  if (service) {
    return {
      title: `${service.seoTitle || service.title} — ${siteName}`,
      description: service.seoDescription || service.text || pages.services.description,
    };
  }
  const m = pages[key] || pages.home;
  return { title: key === 'home' ? m.title : `${m.title} — ${siteName}`, description: m.description };
}

export default function useSeo(content, key, service) {
  const { title, description } = seoFor(content, key, service);
  useEffect(() => {
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
  }, [title, description]);
}
