import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Field, Input, Notice } from '../ui.jsx';

/** Edit the headings and texts of every page. An empty box means "use the default text" (shown as the grey hint). */
export default function PageText() {
  const [schema, setSchema] = useState(null);
  const [values, setValues] = useState({});
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getPages()
      .then((r) => { setSchema(r.schema); setValues(r.values || {}); })
      .catch((e) => setNotice({ type: 'error', text: e.message }));
  }, []);

  async function save() {
    setBusy(true);
    try {
      const r = await api.savePages(values);
      setValues(r.values || {});
      setNotice({ type: 'ok', text: 'Saved. The site shows the new text within about 30 seconds.' });
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
        <h1>Page text</h1>
        <button type="button" className="ad-btn" onClick={save} disabled={!schema || busy}>{busy ? 'Saving…' : 'Save'}</button>
      </div>
      <p className="ad-hint">Headings and short texts of each page. Leave a box empty to use the default text (shown in grey).</p>
      <Notice notice={notice} />
      {!schema ? (!notice && <p>Loading…</p>) : schema.map((g) => (
        <section className="ad-card ad-form" key={g.group}>
          <h2>{g.group}</h2>
          {g.fields.map((fl) => (
            <Field key={fl.path} label={fl.label}>
              <Input
                area={fl.area}
                rows={3}
                value={values[fl.path] || ''}
                onChange={(v) => setValues((p) => ({ ...p, [fl.path]: v }))}
                placeholder={fl.def}
                maxLength={fl.max}
              />
            </Field>
          ))}
        </section>
      ))}
      <div className="ad-bar"><button type="button" className="ad-btn" onClick={save} disabled={!schema || busy}>{busy ? 'Saving…' : 'Save'}</button></div>
    </>
  );
}
