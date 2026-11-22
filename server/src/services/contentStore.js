import fs from 'node:fs/promises';
import { config } from '../config.js';
import { Service, WorkItem, Setting } from '../models/index.js';
import { buildPages, buildSeo } from './pageDefaults.js';

let cache = null;
export const invalidateContent = () => {
  cache = null;
};

export function publicService(s) {
  const d = s.detail || {};
  return {
    id: s.slug,
    title: s.title,
    text: s.text,
    points: s.points || [],
    image: s.image,
    seoTitle: s.seoTitle || '',
    seoDescription: s.seoDescription || '',
    detail: {
      headline: d.headline || '',
      intro: d.intro || '',
      benefits: d.benefits || [],
      deliverables: d.deliverables || [],
      steps: d.steps || [],
      forWho: d.forWho || [],
      faqs: d.faqs || [],
    },
  };
}

/** Builds the same JSON shape the React site always used, now from MySQL. */
export async function getContent() {
  if (cache) return cache;
  const [services, work, s] = await Promise.all([Service.list(), WorkItem.list(), Setting.all()]);
  cache = {
    brand: s.brand || {},
    services: services.map(publicService),
    checklist: s.checklist || [],
    stats: s.stats || [],
    why: s.why || [],
    process: s.process || [],
    workFilters: s.workFilters || [],
    work: work.map((w, i) => ({
      id: String(w._id),
      category: w.category,
      kind: w.kind,
      title: w.title,
      image: w.image || '',
      tone: `t${(i % 6) + 1}`, // colour style of tiles that have no photo
    })),
    faq: s.faq || [],
    images: s.images || {},
    about: s.about || {},
    extra: s.extra || {},
    pages: buildPages(s.pages),
    seo: buildSeo(s.seo),
  };
  return cache;
}

/** Service names accepted by the quote form (service titles + "Multiple services"). */
export async function getServiceOptions() {
  const content = await getContent();
  return [...content.services.map((s) => s.title), 'Multiple services'];
}

/** First start: copy data/content.json into MySQL. Runs only once. */
export async function seedIfEmpty() {
  if (await Setting.has('_seeded')) return;
  const seed = JSON.parse(await fs.readFile(config.seedFile, 'utf-8'));

  if ((await Service.count()) === 0) {
    await Service.insertMany(
      seed.services.map((s, i) => ({
        slug: s.id,
        title: s.title,
        text: s.text,
        points: s.points,
        image: s.image,
        detail: s.detail,
        order: i,
      }))
    );
  }
  if ((await WorkItem.count()) === 0) {
    await WorkItem.insertMany(
      seed.work.map((w, i) => ({ title: w.title, category: w.category, kind: w.kind, order: i }))
    );
  }
  const keys = ['brand', 'faq', 'checklist', 'stats', 'why', 'process', 'workFilters', 'images', 'about', 'extra'];
  for (const key of keys) {
    await Setting.setIfMissing(key, seed[key] ?? null);
  }
  await Setting.set('_seeded', true);
  console.log('Seeded MySQL from data/content.json');
}
