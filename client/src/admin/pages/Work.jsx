import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Field, Input, ImageField, Notice } from '../ui.jsx';
import { assetUrl } from '../../api/config.js';

const BLANK = { title: '', category: '', kind: '', image: '' };

export default function WorkAdmin() {
  const [items, setItems] = useState(null);
  const [cats, setCats] = useState([]);
  const [f, setF] = useState(null); // form: null = hidden
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);

  const load = () => api.list('work').then((r) => { setItems(r.items); setCats(r.categories); })
    .catch((e) => setNotice({ type: 'error', text: e.message }));
  useEffect(() => { load(); }, []);

  const open = (item) => { setEditId(item?._id || null); setF(item ? { title: item.title, category: item.category, kind: item.kind, image: item.image } : { ...BLANK, category: cats[0]?.key || '' }); setErrors({}); };

  async function save(e) {
    e.preventDefault();
    try {
      if (editId) await api.update('work', editId, f); else await api.create('work', f);
      setF(null); setNotice({ type: 'ok', text: 'Saved.' }); load();
    } catch (err) { setErrors(err.fieldErrors || {}); setNotice({ type: 'error', text: err.message }); }
  }
  async function del(w) {
    if (!window.confirm(`Delete "${w.title}"?`)) return;
    try { await api.remove('work', w._id); load(); } catch (e) { setNotice({ type: 'error', text: e.message }); }
  }
  async function move(i, d) {
    const a = [...items]; const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; setItems(a);
    try { await api.reorder('work', a.map((x) => x._id)); } catch (e) { setNotice({ type: 'error', text: e.message }); load(); }
  }

  return (
    <>
      <div className="ad-head"><h1>Work</h1>{!f && <button type="button" className="ad-btn" onClick={() => open(null)}>+ Add work</button>}</div>
      <Notice notice={notice} />
      {f && (
        <form className="ad-card ad-form" onSubmit={save}>
          <h2>{editId ? 'Edit work' : 'Add work'}</h2>
          <Field label="Title" error={errors.title}><Input value={f.title} onChange={(v) => setF({ ...f, title: v })} required /></Field>
          <Field label="Category" error={errors.category}>
            <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
              {cats.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Label on the tile (optional)" hint="Defaults to the category name, e.g. Brand Design."><Input value={f.kind} onChange={(v) => setF({ ...f, kind: v })} /></Field>
          <ImageField value={f.image} onChange={(v) => setF({ ...f, image: v })} />
          <div className="ad-bar"><button className="ad-btn">Save</button><button type="button" className="ad-btn ghost" onClick={() => setF(null)}>Cancel</button></div>
        </form>
      )}
      {!items ? <p>Loading…</p> : (
        <div className="ad-card ad-table-wrap"><table className="ad-table"><tbody>
          {items.map((w, i) => (
            <tr key={w._id}>
              <td style={{ width: 70 }}>{w.image ? <img className="ad-thumb" src={assetUrl(w.image)} alt="" /> : <span className="ad-hint">No image</span>}</td>
              <td><b>{w.title}</b><br /><small>{w.kind}</small></td>
              <td className="ad-actions">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
                <button type="button" className="ad-btn ghost sm" onClick={() => open(w)}>Edit</button>
                <button type="button" className="ad-btn danger sm" onClick={() => del(w)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody></table></div>
      )}
    </>
  );
}
