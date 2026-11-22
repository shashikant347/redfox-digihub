import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { requireAdmin, setSession, clearSession } from '../middleware/adminAuth.js';
import { Admin, Service, WorkItem, Setting, Quote } from '../models/index.js';
import { invalidateContent } from '../services/contentStore.js';
import { upload, removeUpload } from '../services/uploads.js';
import { PAGE_SCHEMA, SEO_PAGES } from '../services/pageDefaults.js';

const router = Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const fail = (res, status, message, errors) => res.status(status).json({ ok: false, message, ...(errors && { errors }) });

// ---------- sanitizers ----------
const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const str = (v, max = 500) => String(v ?? '').replace(CTRL, '').trim().slice(0, max);
const strList = (v, max = 30, len = 300) => (Array.isArray(v) ? v.map((x) => str(x, len)).filter(Boolean).slice(0, max) : []);
const pairs = (v) =>
  Array.isArray(v)
    ? v.map((p) => ({ title: str(p?.title, 120), text: str(p?.text, 800) })).filter((p) => p.title || p.text).slice(0, 20)
    : [];
const qas = (v) =>
  Array.isArray(v)
    ? v.map((p) => ({ q: str(p?.q, 300), a: str(p?.a, 2000) })).filter((p) => p.q && p.a).slice(0, 50)
    : [];
// Only our own images: built-in /images/... or uploaded /uploads/...
const imageUrl = (v) => {
  const s = str(v, 300);
  return /^\/(images|uploads)\/[\w\-./]+$/.test(s) && !s.includes('..') ? s : '';
};
const slugify = (t, fallback = 'service') =>
  str(t, 80).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || fallback;

async function uniqueSlug(base, exceptId) {
  let slug = base;
  for (let n = 2; await Service.slugExists(slug, exceptId); n++) slug = `${base}-${n}`;
  return slug;
}

const cleanService = (b) => ({
  title: str(b.title, 100),
  text: str(b.text, 400),
  points: strList(b.points, 10, 200),
  image: imageUrl(b.image),
  seoTitle: str(b.seoTitle, 120),
  seoDescription: str(b.seoDescription, 300),
  detail: {
    headline: str(b.detail?.headline, 200),
    intro: str(b.detail?.intro, 2000),
    benefits: pairs(b.detail?.benefits),
    deliverables: strList(b.detail?.deliverables, 20, 200),
    steps: pairs(b.detail?.steps),
    forWho: strList(b.detail?.forWho, 20, 120),
    faqs: qas(b.detail?.faqs),
  },
});

// Save a Setting and delete uploaded files that are no longer used by it.
const uploadsIn = (v, set = new Set()) => {
  if (typeof v === 'string') { if (v.startsWith('/uploads/')) set.add(v); }
  else if (Array.isArray(v)) v.forEach((x) => uploadsIn(x, set));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => uploadsIn(x, set));
  return set;
};
async function saveSetting(key, value) {
  const old = await Setting.get(key);
  await Setting.set(key, value);
  const keep = uploadsIn(value);
  uploadsIn(old).forEach((u) => !keep.has(u) && removeUpload(u));
  invalidateContent();
}
const getSetting = async (key, fallback) => (await Setting.get(key)) ?? fallback;

// ---------- auth (public) ----------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12); // keeps timing equal when the email is unknown

router.post(
  '/login',
  loginLimiter,
  wrap(async (req, res) => {
    const email = str(req.body?.email, 200).toLowerCase();
    const password = String(req.body?.password ?? '');
    const admin = await Admin.findByEmail(email);
    const ok = await bcrypt.compare(password, admin ? admin.passwordHash : DUMMY_HASH);
    if (!admin || !ok) return fail(res, 401, 'Wrong email or password.');
    setSession(res, admin);
    res.json({ ok: true, admin: { email: admin.email, name: admin.name } });
  })
);

router.post('/logout', (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

// ---------- everything below needs a logged-in admin ----------
router.use(requireAdmin);

router.get('/me', (req, res) => res.json({ ok: true, admin: { email: req.admin.email, name: req.admin.name } }));

router.post(
  '/password',
  wrap(async (req, res) => {
    const current = String(req.body?.current ?? '');
    const next = String(req.body?.next ?? '');
    if (!(await bcrypt.compare(current, req.admin.passwordHash))) return fail(res, 400, 'Current password is wrong.');
    if (next.length < 10) return fail(res, 400, 'New password must be at least 10 characters.');
    const updated = await Admin.setPassword(req.admin._id, await bcrypt.hash(next, 12)); // also logs out every other device
    setSession(res, updated);
    res.json({ ok: true });
  })
);

router.get(
  '/stats',
  wrap(async (_req, res) => {
    const [services, work, quotesTotal, quotesNew, latest] = await Promise.all([
      Service.count(),
      WorkItem.count(),
      Quote.count(),
      Quote.count({ status: 'new' }),
      Quote.list({}, { limit: 5 }),
    ]);
    res.json({ ok: true, services, work, quotesTotal, quotesNew, latest });
  })
);

// ---------- image upload ----------
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return fail(res, 400, 'Choose an image file.');
  res.status(201).json({ ok: true, url: `/uploads/${req.file.filename}` });
});

// ---------- services ----------
router.get('/services', wrap(async (_req, res) => {
  res.json({ ok: true, items: await Service.list() });
}));

router.get('/services/:id', wrap(async (req, res) => {
  const item = await Service.get(req.params.id);
  if (!item) return fail(res, 404, 'Service not found.');
  res.json({ ok: true, item });
}));

router.post('/services', wrap(async (req, res) => {
  const data = cleanService(req.body || {});
  if (data.title.length < 2) return fail(res, 400, 'Enter a service title.', { title: 'Enter a service title.' });
  const slug = await uniqueSlug(slugify(req.body?.slug || data.title));
  const item = await Service.create({ ...data, slug, order: (await Service.lastOrder()) + 1 });
  invalidateContent();
  res.status(201).json({ ok: true, item });
}));

router.put('/services/:id', wrap(async (req, res) => {
  const current = await Service.get(req.params.id);
  if (!current) return fail(res, 404, 'Service not found.');
  const data = cleanService(req.body || {});
  if (data.title.length < 2) return fail(res, 400, 'Enter a service title.', { title: 'Enter a service title.' });
  if (current.image !== data.image) removeUpload(current.image);
  const item = await Service.update(req.params.id, data); // the slug stays the same so existing links keep working
  invalidateContent();
  res.json({ ok: true, item });
}));

router.delete('/services/:id', wrap(async (req, res) => {
  const item = await Service.remove(req.params.id);
  if (!item) return fail(res, 404, 'Service not found.');
  removeUpload(item.image);
  invalidateContent();
  res.json({ ok: true });
}));

const reorder = (Model) => wrap(async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(String) : [];
  await Model.reorder(ids);
  invalidateContent();
  res.json({ ok: true });
});
router.post('/services/reorder', reorder(Service));

// ---------- work ----------
const getFilters = async () => ((await Setting.get('workFilters')) || []).filter((f) => f.key !== 'all');

router.get('/work', wrap(async (_req, res) => {
  res.json({ ok: true, items: await WorkItem.list(), categories: await getFilters() });
}));

router.put('/work/categories', wrap(async (req, res) => {
  const old = await getFilters();
  const existing = new Set(old.map((o) => o.key));
  const input = Array.isArray(req.body?.items) ? req.body.items.slice(0, 12) : [];
  const used = new Set();
  const out = [];
  for (const it of input) {
    const label = str(it?.label, 30);
    if (!label) continue;
    let key = str(it?.key, 30);
    if (!existing.has(key) || used.has(key)) {
      const base = slugify(label, 'category').slice(0, 20);
      key = base;
      for (let n = 2; used.has(key) || existing.has(key) || key === 'all'; n++) key = `${base}-${n}`;
    }
    used.add(key);
    out.push({ key, label });
  }
  if (!out.length) return fail(res, 400, 'Keep at least one category.');
  const removed = old.filter((o) => !used.has(o.key));
  if (removed.length) {
    const inUse = await WorkItem.countInCategories(removed.map((r) => r.key));
    if (inUse) return fail(res, 400, `Move or delete the ${inUse} work item(s) in ${removed.map((r) => `"${r.label}"`).join(', ')} first.`);
  }
  await saveSetting('workFilters', [{ key: 'all', label: 'All' }, ...out]);
  res.json({ ok: true, categories: out });
}));

async function cleanWork(b) {
  const categories = await getFilters();
  const category = str(b.category, 40);
  const errors = {};
  const title = str(b.title, 100);
  if (title.length < 2) errors.title = 'Enter a title.';
  if (!categories.some((c) => c.key === category)) errors.category = 'Choose a category.';
  const label = categories.find((c) => c.key === category)?.label;
  return { errors, data: { title, category, kind: str(b.kind, 60) || label || '', image: imageUrl(b.image) } };
}

router.post('/work', wrap(async (req, res) => {
  const { errors, data } = await cleanWork(req.body || {});
  if (Object.keys(errors).length) return fail(res, 400, 'Please fix the highlighted fields.', errors);
  const item = await WorkItem.create({ ...data, order: (await WorkItem.lastOrder()) + 1 });
  invalidateContent();
  res.status(201).json({ ok: true, item });
}));

router.put('/work/:id', wrap(async (req, res) => {
  const current = await WorkItem.get(req.params.id);
  if (!current) return fail(res, 404, 'Work item not found.');
  const { errors, data } = await cleanWork(req.body || {});
  if (Object.keys(errors).length) return fail(res, 400, 'Please fix the highlighted fields.', errors);
  if (current.image !== data.image) removeUpload(current.image);
  const item = await WorkItem.update(req.params.id, data);
  invalidateContent();
  res.json({ ok: true, item });
}));

router.delete('/work/:id', wrap(async (req, res) => {
  const item = await WorkItem.remove(req.params.id);
  if (!item) return fail(res, 404, 'Work item not found.');
  removeUpload(item.image);
  invalidateContent();
  res.json({ ok: true });
}));
router.post('/work/reorder', reorder(WorkItem));

// ---------- FAQ ----------
router.get('/faq', wrap(async (_req, res) => {
  res.json({ ok: true, items: (await Setting.get('faq')) || [] });
}));
router.put('/faq', wrap(async (req, res) => {
  const items = qas(req.body?.items);
  await Setting.set('faq', items);
  invalidateContent();
  res.json({ ok: true, items });
}));

// ---------- brand: phone, email, address, social links ----------
router.get('/brand', wrap(async (_req, res) => {
  res.json({ ok: true, brand: (await Setting.get('brand')) || {} });
}));
router.put('/brand', wrap(async (req, res) => {
  const b = req.body || {};
  const old = (await Setting.get('brand')) || {};
  const email = str(b.email, 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 400, 'Enter a valid email.', { email: 'Enter a valid email.' });
  const phone = str(b.phone, 30);
  const httpUrl = (v) => (/^https?:\/\/\S+$/i.test(str(v, 500)) ? str(v, 500) : '');
  const social = (Array.isArray(b.social) ? b.social : [])
    .map((s) => ({
      id: slugify(s?.id || s?.label),
      label: str(s?.label, 40),
      handle: str(s?.handle, 80),
      url: httpUrl(s?.url),
    }))
    .filter((s) => s.label && s.url)
    .slice(0, 12);
  const brand = {
    ...old,
    name: str(b.name, 60) || old.name,
    tagline: str(b.tagline, 100),
    website: str(b.website, 100),
    email,
    phone,
    phoneHref: phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : '',
    whatsapp: httpUrl(b.whatsapp),
    address: str(b.address, 200),
    mapUrl: httpUrl(b.mapUrl),
    social,
  };
  await Setting.set('brand', brand);
  invalidateContent();
  res.json({ ok: true, brand });
}));

// ---------- quotes (leads) ----------
const STATUSES = ['new', 'contacted', 'won', 'closed'];
function quoteFilter(query) {
  const filter = {};
  const status = str(query.status, 20);
  if (STATUSES.includes(status)) filter.status = status;
  const q = str(query.q, 100);
  if (q) filter.q = q;
  return filter;
}

router.get('/quotes', wrap(async (req, res) => {
  const filter = quoteFilter(req.query);
  const limit = 25;
  const total = await Quote.count(filter);
  const pages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), pages);
  const items = await Quote.list(filter, { limit, offset: (page - 1) * limit });
  res.json({ ok: true, items, total, page, pages });
}));

// CSV for Excel / Google Sheets. Same filters as the list.
const csvCell = (v) => {
  let t = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`; // stops spreadsheet formula injection
  return `"${t.replace(/"/g, '""')}"`;
};
router.get('/quotes/export.csv', wrap(async (req, res) => {
  const items = await Quote.list(quoteFilter(req.query), { limit: 5000 });
  const head = ['Date', 'Name', 'Contact', 'Service', 'Status', 'Details', 'Notes'];
  const rows = items.map((q) => [new Date(q.createdAt).toISOString(), q.name, q.contact, q.service, q.status, q.details, q.notes]);
  const csv = '\uFEFF' + [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="redfox-quotes-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
}));

router.patch('/quotes/:id', wrap(async (req, res) => {
  const update = {};
  if (req.body?.status !== undefined) {
    const status = str(req.body.status, 20);
    if (!STATUSES.includes(status)) return fail(res, 400, 'Invalid status.');
    update.status = status;
  }
  if (req.body?.notes !== undefined) update.notes = str(req.body.notes, 2000);
  if (!Object.keys(update).length) return fail(res, 400, 'Nothing to update.');
  const item = (await Quote.get(req.params.id)) && (await Quote.update(req.params.id, update));
  if (!item) return fail(res, 404, 'Quote not found.');
  res.json({ ok: true, item });
}));
router.delete('/quotes/:id', wrap(async (req, res) => {
  const item = await Quote.remove(req.params.id);
  if (!item) return fail(res, 404, 'Quote not found.');
  res.json({ ok: true });
}));

// ---------- page text (home banner, page titles, section headings) ----------
router.get('/pages', wrap(async (_req, res) => {
  res.json({
    ok: true,
    schema: PAGE_SCHEMA.map((g) => ({
      group: g.group,
      fields: g.fields.map(({ path, label, def, area, max }) => ({ path, label, def, area: !!area, max: max || 200 })),
    })),
    values: await getSetting('pages', {}),
  });
}));
router.put('/pages', wrap(async (req, res) => {
  const input = req.body?.values || {};
  const out = {};
  for (const g of PAGE_SCHEMA) for (const fl of g.fields) {
    const v = str(input[fl.path], fl.max || 200);
    if (v) out[fl.path] = v; // empty = use the default text
  }
  await saveSetting('pages', out);
  res.json({ ok: true, values: out });
}));

// ---------- SEO: title + description for each page ----------
router.get('/seo', wrap(async (_req, res) => {
  res.json({ ok: true, pages: SEO_PAGES, value: await getSetting('seo', {}) });
}));
router.put('/seo', wrap(async (req, res) => {
  const b = req.body || {};
  const pages = {};
  for (const p of SEO_PAGES) {
    const title = str(b.pages?.[p.key]?.title, 120);
    const description = str(b.pages?.[p.key]?.description, 300);
    if (title || description) pages[p.key] = { title, description };
  }
  const value = { siteName: str(b.siteName, 60) || 'REDFOX', pages };
  await saveSetting('seo', value);
  res.json({ ok: true, value });
}));

// ---------- site content: stats, why, process, checklist, about, extra sections, page images ----------
const EXTRA_KINDS = { mission: 'pairs', values: 'pairs', industries: 'strings', included: 'pairs', approach: 'pairs', needFromYou: 'strings', afterSend: 'pairs' };
const IMAGE_KEYS = ['aboutHero', 'aboutStory', 'process', 'contact'];

const SECTIONS = {
  stats: (b) => (Array.isArray(b) ? b : []).map((x) => ({ value: str(x?.value, 20), label: str(x?.label, 80) })).filter((x) => x.label && x.value).slice(0, 8),
  why: (b) => pairs(b).map((x, i) => ({ n: String(i + 1).padStart(2, '0'), ...x })).slice(0, 8),
  process: (b) => pairs(b).slice(0, 12),
  checklist: (b) => strList(b, 8, 160),
  about: (b) => ({
    title: str(b?.title, 150),
    lead: str(b?.lead, 600),
    story: strList(b?.story, 8, 1500),
    quote: str(b?.quote, 300),
    team: (Array.isArray(b?.team) ? b.team : [])
      .map((t) => ({ role: str(t?.role, 60), text: str(t?.text, 400), image: imageUrl(t?.image) }))
      .filter((t) => t.role)
      .slice(0, 10),
  }),
  extra: (b) => {
    const out = {};
    for (const [key, kind] of Object.entries(EXTRA_KINDS)) {
      const x = b?.[key] || {};
      out[key] = { tag: str(x.tag, 60), title: str(x.title, 150), items: kind === 'pairs' ? pairs(x.items) : strList(x.items, 30, 160) };
      if (x.lead !== undefined) out[key].lead = str(x.lead, 400);
    }
    return out;
  },
};

router.get('/content/:section', wrap(async (req, res) => {
  const { section } = req.params;
  if (!SECTIONS[section] && section !== 'images') return fail(res, 404, 'Unknown section.');
  res.json({ ok: true, value: await getSetting(section, section === 'about' || section === 'extra' || section === 'images' ? {} : []) });
}));

router.put('/content/:section', wrap(async (req, res) => {
  const { section } = req.params;
  const body = req.body?.value;
  let value;
  if (section === 'images') {
    const old = await getSetting('images', {});
    value = {};
    for (const k of IMAGE_KEYS) {
      value[k] = { src: imageUrl(body?.[k]?.src) || old[k]?.src || '', alt: str(body?.[k]?.alt, 200) || old[k]?.alt || '' };
    }
  } else if (SECTIONS[section]) {
    value = SECTIONS[section](body);
  } else {
    return fail(res, 404, 'Unknown section.');
  }
  await saveSetting(section, value);
  res.json({ ok: true, value });
}));

export default router;
