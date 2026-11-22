import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Field, Input, Notice } from '../ui.jsx';

export function Counter({ value, max, label }) {
  const n = (value || '').length;
  return <small className={`ad-count${n > max ? ' over' : ''}`}>{n} / {max} {label}</small>;
}

/** Google title + description for every page. */
export default function SeoAdmin() {
  const [pages, setPages] = useState(null); // list with defaults
  const [siteName, setSiteName] = useState('REDFOX');
  const [vals, setVals] = useState({});
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getSeo()
      .then((r) => { setPages(r.pages); setSiteName(r.value?.siteName || 'REDFOX'); setVals(r.value?.pages || {}); })
      .catch((e) => setNotice({ type: 'error', text: e.message }));
  }, []);

  const setField = (key, k, v) => setVals((p) => ({ ...p, [key]: { ...p[key], [k]: v } }));

  async function save() {
    setBusy(true);
    try {
      const r = await api.saveSeo({ siteName, pages: vals });
      setSiteName(r.value.siteName); setVals(r.value.pages || {});
      setNotice({ type: 'ok', text: 'SEO saved. Google picks up changes the next time it visits your site.' });
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <>
      <div className="ad-head">
        <h1>SEO</h1>
        <button type="button" className="ad-btn" onClick={save} disabled={!pages || busy}>{busy ? 'Saving…' : 'Save'}</button>
      </div>
      <p className="ad-hint">What Google and WhatsApp/Facebook previews show for each page. Empty box = default text (grey). Service pages have their own SEO box inside each service.</p>
      <Notice notice={notice} />
      {!pages ? (!notice && <p>Loading…</p>) : (
        <>
          <section className="ad-card ad-form">
            <Field label="Site name" hint="Added after the page title, e.g. “Services — REDFOX”.">
              <Input value={siteName} onChange={setSiteName} maxLength={60} />
            </Field>
          </section>
          {pages.map((p) => (
            <section className="ad-card ad-form" key={p.key}>
              <h2>{p.label}</h2>
              <Field label="Title">
                <Input value={vals[p.key]?.title || ''} onChange={(v) => setField(p.key, 'title', v)} placeholder={p.title} maxLength={120} />
                <Counter value={vals[p.key]?.title} max={60} label="characters (about 60 is best)" />
              </Field>
              <Field label="Description">
                <Input area rows={3} value={vals[p.key]?.description || ''} onChange={(v) => setField(p.key, 'description', v)} placeholder={p.description} maxLength={300} />
                <Counter value={vals[p.key]?.description} max={160} label="characters (about 160 is best)" />
              </Field>
            </section>
          ))}
          <div className="ad-bar"><button type="button" className="ad-btn" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button></div>
        </>
      )}
    </>
  );
}
