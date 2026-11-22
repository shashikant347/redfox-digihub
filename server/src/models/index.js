// Data access for MySQL. Each export (Admin, Service, WorkItem, Setting, Quote) returns plain objects
// in the same shape the admin panel always received (_id as string, createdAt, order, ...).
import { query, transaction } from '../db.js';

const now = () => new Date();
const toId = (v) => (/^\d+$/.test(String(v)) ? Number(v) : null);
const asJson = (v, fallback) => {
  if (v === null || v === undefined || v === '') return fallback;
  if (typeof v !== 'string') return v;
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
};
const toJson = (v) => JSON.stringify(v ?? null);
const likeEscape = (t) => t.replace(/[\\%_]/g, '\\$&');

// ---------------------------------------------------------------- Admin
const adminOut = (r) =>
  !r ? null : {
    _id: String(r.id),
    email: r.email,
    name: r.name,
    passwordHash: r.password_hash,
    tokenVersion: r.token_version,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };

export const Admin = {
  async findByEmail(email) {
    return adminOut((await query('SELECT * FROM admins WHERE email = ? LIMIT 1', [email]))[0]);
  },
  async findById(id) {
    const n = toId(id);
    if (n === null) return null;
    return adminOut((await query('SELECT * FROM admins WHERE id = ? LIMIT 1', [n]))[0]);
  },
  async create({ email, passwordHash, name = 'Admin' }) {
    const t = now();
    const r = await query(
      'INSERT INTO admins (email, name, password_hash, token_version, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)',
      [email, name, passwordHash, t, t]
    );
    return Admin.findById(r.insertId);
  },
  /** Changes the password and logs out every other session (tokenVersion + 1). */
  async setPassword(id, passwordHash) {
    await query('UPDATE admins SET password_hash = ?, token_version = token_version + 1, updated_at = ? WHERE id = ?', [
      passwordHash,
      now(),
      toId(id),
    ]);
    return Admin.findById(id);
  },
};

// ---------------------------------------------------------------- Service
const detailOut = (d = {}) => ({
  headline: d.headline || '',
  intro: d.intro || '',
  benefits: d.benefits || [],
  deliverables: d.deliverables || [],
  steps: d.steps || [],
  forWho: d.forWho || [],
  faqs: d.faqs || [],
});
const serviceOut = (r) =>
  !r ? null : {
    _id: String(r.id),
    slug: r.slug,
    title: r.title,
    text: r.text,
    points: asJson(r.points, []),
    image: r.image,
    order: r.sort_order,
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
    detail: detailOut(asJson(r.detail, {})),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
const serviceCols = (d) => [
  d.title ?? '',
  d.text ?? '',
  toJson(d.points || []),
  d.image ?? '',
  d.seoTitle ?? '',
  d.seoDescription ?? '',
  toJson(detailOut(d.detail)),
];

export const Service = {
  async list() {
    return (await query('SELECT * FROM services ORDER BY sort_order ASC, created_at ASC, id ASC')).map(serviceOut);
  },
  async get(id) {
    const n = toId(id);
    if (n === null) return null;
    return serviceOut((await query('SELECT * FROM services WHERE id = ? LIMIT 1', [n]))[0]);
  },
  async count() {
    return (await query('SELECT COUNT(*) AS c FROM services'))[0].c;
  },
  async slugExists(slug, exceptId) {
    const n = toId(exceptId);
    const rows = await query('SELECT id FROM services WHERE slug = ? AND id <> ? LIMIT 1', [slug, n ?? 0]);
    return rows.length > 0;
  },
  async lastOrder() {
    const r = (await query('SELECT MAX(sort_order) AS m FROM services'))[0].m;
    return r === null ? -1 : r;
  },
  async create(d) {
    const t = now();
    const r = await query(
      'INSERT INTO services (slug, sort_order, title, `text`, points, image, seo_title, seo_description, detail, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [d.slug, d.order ?? 0, ...serviceCols(d), t, t]
    );
    return Service.get(r.insertId);
  },
  async update(id, d) {
    await query(
      'UPDATE services SET title = ?, `text` = ?, points = ?, image = ?, seo_title = ?, seo_description = ?, detail = ?, updated_at = ? WHERE id = ?',
      [...serviceCols(d), now(), toId(id)]
    );
    return Service.get(id);
  },
  async remove(id) {
    const item = await Service.get(id);
    if (!item) return null;
    await query('DELETE FROM services WHERE id = ?', [toId(id)]);
    return item;
  },
  async reorder(ids) {
    await reorderTable('services', ids);
  },
  async insertMany(list) {
    for (const d of list) await Service.create(d);
  },
};

// ---------------------------------------------------------------- WorkItem
const workOut = (r) =>
  !r ? null : {
    _id: String(r.id),
    title: r.title,
    category: r.category,
    kind: r.kind,
    image: r.image,
    order: r.sort_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };

export const WorkItem = {
  async list() {
    return (await query('SELECT * FROM work_items ORDER BY sort_order ASC, created_at ASC, id ASC')).map(workOut);
  },
  async get(id) {
    const n = toId(id);
    if (n === null) return null;
    return workOut((await query('SELECT * FROM work_items WHERE id = ? LIMIT 1', [n]))[0]);
  },
  async count() {
    return (await query('SELECT COUNT(*) AS c FROM work_items'))[0].c;
  },
  async countInCategories(keys) {
    if (!keys.length) return 0;
    return (await query('SELECT COUNT(*) AS c FROM work_items WHERE category IN (?)', [keys]))[0].c;
  },
  async lastOrder() {
    const r = (await query('SELECT MAX(sort_order) AS m FROM work_items'))[0].m;
    return r === null ? -1 : r;
  },
  async create(d) {
    const t = now();
    const r = await query(
      'INSERT INTO work_items (title, category, kind, image, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [d.title, d.category, d.kind ?? '', d.image ?? '', d.order ?? 0, t, t]
    );
    return WorkItem.get(r.insertId);
  },
  async update(id, d) {
    await query('UPDATE work_items SET title = ?, category = ?, kind = ?, image = ?, updated_at = ? WHERE id = ?', [
      d.title,
      d.category,
      d.kind ?? '',
      d.image ?? '',
      now(),
      toId(id),
    ]);
    return WorkItem.get(id);
  },
  async remove(id) {
    const item = await WorkItem.get(id);
    if (!item) return null;
    await query('DELETE FROM work_items WHERE id = ?', [toId(id)]);
    return item;
  },
  async reorder(ids) {
    await reorderTable('work_items', ids);
  },
  async insertMany(list) {
    for (const d of list) await WorkItem.create(d);
  },
};

async function reorderTable(table, ids) {
  const clean = ids.map(toId).filter((n) => n !== null);
  if (!clean.length) return;
  await transaction(async (q) => {
    for (let i = 0; i < clean.length; i++) await q(`UPDATE ${table} SET sort_order = ? WHERE id = ?`, [i, clean[i]]);
  });
}

// ---------------------------------------------------------------- Setting (key/value JSON)
export const Setting = {
  /** Returns the stored value, or undefined when the key does not exist. */
  async get(key) {
    const r = (await query('SELECT svalue FROM settings WHERE skey = ? LIMIT 1', [key]))[0];
    return r ? asJson(r.svalue, undefined) : undefined;
  },
  async has(key) {
    return (await query('SELECT skey FROM settings WHERE skey = ? LIMIT 1', [key])).length > 0;
  },
  async all() {
    const rows = await query('SELECT skey, svalue FROM settings');
    return Object.fromEntries(rows.map((r) => [r.skey, asJson(r.svalue, undefined)]));
  },
  async set(key, value) {
    const t = now();
    await query(
      'INSERT INTO settings (skey, svalue, created_at, updated_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE svalue = VALUES(svalue), updated_at = VALUES(updated_at)',
      [key, toJson(value), t, t]
    );
  },
  /** Writes only if the key is missing (used by the first-start seed). */
  async setIfMissing(key, value) {
    const t = now();
    await query('INSERT IGNORE INTO settings (skey, svalue, created_at, updated_at) VALUES (?, ?, ?, ?)', [key, toJson(value), t, t]);
  },
};

// ---------------------------------------------------------------- Quote
const quoteOut = (r) =>
  !r ? null : {
    _id: String(r.id),
    name: r.name,
    contact: r.contact,
    service: r.service,
    details: r.details,
    status: r.status,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };

function quoteWhere({ status, q } = {}) {
  const where = [];
  const params = [];
  if (status) {
    where.push('status = ?');
    params.push(status);
  }
  if (q) {
    const like = `%${likeEscape(q)}%`; // escaped: visitors' text can never act as a pattern
    where.push('(' + ['name', 'contact', 'service', 'details', 'notes'].map((f) => `${f} LIKE ?`).join(' OR ') + ')');
    params.push(like, like, like, like, like);
  }
  return { sql: where.length ? 'WHERE ' + where.join(' AND ') : '', params };
}

export const Quote = {
  async create({ name, contact, service, details = '' }) {
    const t = now();
    const r = await query(
      "INSERT INTO quotes (name, contact, service, details, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, 'new', '', ?, ?)",
      [name, contact, service, details, t, t]
    );
    return Quote.get(r.insertId);
  },
  async get(id) {
    const n = toId(id);
    if (n === null) return null;
    return quoteOut((await query('SELECT * FROM quotes WHERE id = ? LIMIT 1', [n]))[0]);
  },
  async count(filter = {}) {
    const w = quoteWhere(filter);
    return (await query(`SELECT COUNT(*) AS c FROM quotes ${w.sql}`, w.params))[0].c;
  },
  async list(filter = {}, { limit = 25, offset = 0 } = {}) {
    const w = quoteWhere(filter);
    const rows = await query(`SELECT * FROM quotes ${w.sql} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`, [
      ...w.params,
      Number(limit),
      Number(offset),
    ]);
    return rows.map(quoteOut);
  },
  async update(id, { status, notes }) {
    const sets = [];
    const params = [];
    if (status !== undefined) (sets.push('status = ?'), params.push(status));
    if (notes !== undefined) (sets.push('notes = ?'), params.push(notes));
    if (!sets.length || toId(id) === null) return Quote.get(id);
    await query(`UPDATE quotes SET ${sets.join(', ')}, updated_at = ? WHERE id = ?`, [...params, now(), toId(id)]);
    return Quote.get(id);
  },
  async remove(id) {
    const item = await Quote.get(id);
    if (!item) return null;
    await query('DELETE FROM quotes WHERE id = ?', [toId(id)]);
    return item;
  },
};
