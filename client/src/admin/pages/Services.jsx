import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { Field, Input, ImageField, StringList, PairList, QAList, Notice } from '../ui.jsx';
import { Counter } from './Seo.jsx';
import { assetUrl } from '../../api/config.js';

export function ServiceList() {
  const [items, setItems] = useState(null);
  const [notice, setNotice] = useState(null);
  const load = () => api.list('services').then((r) => setItems(r.items)).catch((e) => setNotice({ type: 'error', text: e.message }));
  useEffect(() => { load(); }, []);

  async function move(i, d) {
    const a = [...items];
    const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    setItems(a);
    try { await api.reorder('services', a.map((x) => x._id)); } catch (e) { setNotice({ type: 'error', text: e.message }); load(); }
  }
  async function del(s) {
    if (!window.confirm(`Delete "${s.title}"? Its page /services/${s.slug} will stop working.`)) return;
    try { await api.remove('services', s._id); setNotice({ type: 'ok', text: 'Service deleted.' }); load(); }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
  }

  return (
    <>
      <div className="ad-head"><h1>Services</h1><Link className="ad-btn" to="/admin/services/new">+ Add service</Link></div>
      <Notice notice={notice} />
      {!items ? <p>Loading…</p> : (
        <div className="ad-card ad-table-wrap"><table className="ad-table"><tbody>
          {items.map((s, i) => (
            <tr key={s._id}>
              <td style={{ width: 70 }}>{s.image ? <img className="ad-thumb" src={assetUrl(s.image)} alt="" /> : null}</td>
              <td><b>{s.title}</b><br /><small>/services/{s.slug}</small></td>
              <td className="ad-actions">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
                <Link className="ad-btn ghost sm" to={`/admin/services/${s._id}`}>Edit</Link>
                <button type="button" className="ad-btn danger sm" onClick={() => del(s)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody></table></div>
      )}
    </>
  );
}

const BLANK = {
  title: '', slug: '', text: '', points: [], image: '', seoTitle: '', seoDescription: '',
  detail: { headline: '', intro: '', benefits: [], deliverables: [], steps: [], forWho: [], faqs: [] },
};

export function ServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [f, setF] = useState(id ? null : BLANK);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get('services', id).then((r) => setF({ ...BLANK, ...r.item, detail: { ...BLANK.detail, ...r.item.detail } }))
      .catch((e) => setNotice({ type: 'error', text: e.message }));
  }, [id]);

  if (!f) return <><Notice notice={notice} />{!notice && <p>Loading…</p>}</>;
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  const setD = (k) => (v) => setF((p) => ({ ...p, detail: { ...p.detail, [k]: v } }));

  async function save(e) {
    e.preventDefault();
    setBusy(true); setErrors({}); setNotice(null);
    try {
      if (id) await api.update('services', id, f);
      else await api.create('services', f);
      navigate('/admin/services');
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setNotice({ type: 'error', text: err.message });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={save}>
      <div className="ad-head">
        <h1>{id ? 'Edit service' : 'Add service'}</h1>
        {id && f.slug && <a href={`/services/${f.slug}`} target="_blank" rel="noreferrer">View page ↗</a>}
      </div>
      <Notice notice={notice} />
      <section className="ad-card ad-form">
        <h2>Card (shown on Services page and menu)</h2>
        <Field label="Title" error={errors.title}><Input value={f.title} onChange={set('title')} maxLength={100} required /></Field>
        {!id && <Field label="Page address (optional)" hint="Becomes /services/your-address. Leave empty to create it from the title. Cannot be changed later."><Input value={f.slug} onChange={set('slug')} placeholder="e.g. video-production" /></Field>}
        <Field label="Short text"><Input area value={f.text} onChange={set('text')} maxLength={400} /></Field>
        <Field label="Bullet points"><StringList items={f.points} onChange={set('points')} addLabel="Add point" /></Field>
        <ImageField value={f.image} onChange={set('image')} />
      </section>
      <section className="ad-card ad-form">
        <h2>Detail page</h2>
        <Field label="Headline"><Input value={f.detail.headline} onChange={setD('headline')} /></Field>
        <Field label="Intro"><Input area rows={5} value={f.detail.intro} onChange={setD('intro')} /></Field>
        <Field label="Benefits"><PairList items={f.detail.benefits} onChange={setD('benefits')} addLabel="Add benefit" /></Field>
        <Field label="Deliverables (what the client gets)"><StringList items={f.detail.deliverables} onChange={setD('deliverables')} addLabel="Add deliverable" /></Field>
        <Field label="Steps"><PairList items={f.detail.steps} onChange={setD('steps')} addLabel="Add step" /></Field>
        <Field label="Who it is for"><StringList items={f.detail.forWho} onChange={setD('forWho')} addLabel="Add item" /></Field>
        <Field label="FAQs"><QAList items={f.detail.faqs} onChange={setD('faqs')} addLabel="Add FAQ" /></Field>
      </section>
      <section className="ad-card ad-form">
        <h2>SEO (Google)</h2>
        <p className="ad-hint" style={{ margin: 0 }}>Optional. Empty = the service title and short text are used.</p>
        <Field label="SEO title">
          <Input value={f.seoTitle} onChange={set('seoTitle')} maxLength={120} placeholder={f.title} />
          <Counter value={f.seoTitle} max={60} label="characters (about 60 is best)" />
        </Field>
        <Field label="SEO description">
          <Input area rows={3} value={f.seoDescription} onChange={set('seoDescription')} maxLength={300} placeholder={f.text} />
          <Counter value={f.seoDescription} max={160} label="characters (about 160 is best)" />
        </Field>
      </section>
      <div className="ad-bar">
        <button className="ad-btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        <Link className="ad-btn ghost" to="/admin/services">Cancel</Link>
      </div>
    </form>
  );
}
