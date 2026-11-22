import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Field, Input, ImageField, ListEditor, Notice } from '../ui.jsx';
import { assetUrl } from '../../api/config.js';

const BLANK = { title: '', category: '', kind: '', image: '' };

/** Add / rename / reorder the filter buttons of the Work page. */
function Categories({ cats, onSaved }) {
  const [openPanel, setOpenPanel] = useState(false);
  const [list, setList] = useState(cats);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setList(cats); }, [cats]);

  async function save() {
    setBusy(true);
    try {
      await api.saveWorkCategories(list);
      setMsg({ type: 'ok', text: 'Categories saved.' });
      onSaved();
    } catch (e) { setMsg({ type: 'error', text: e.message }); }
    finally { setBusy(false); }
  }

  if (!openPanel) return <p><button type="button" className="ad-btn ghost sm" onClick={() => setOpenPanel(true)}>Edit categories</button></p>;
  return (
    <section className="ad-card ad-form">
      <h2>Categories</h2>
      <p className="ad-hint" style={{ margin: 0 }}>These are the filter buttons on the Work page. A category that still has work items cannot be removed: move or delete those items first.</p>
      <Notice notice={msg} />
      <ListEditor
        items={list}
        onChange={setList}
        blank={() => ({ key: '', label: '' })}
        addLabel="Add category"
        render={(c, set) => <Input value={c.label} onChange={(t) => set({ ...c, label: t })} placeholder="Category name, e.g. Video" maxLength={30} />}
      />
      <div className="ad-bar">
        <button type="button" className="ad-btn" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save categories'}</button>
        <button type="button" className="ad-btn ghost" onClick={() => setOpenPanel(false)}>Close</button>
      </div>
    </section>
  );
}

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
      <Categories cats={cats} onSaved={load} />
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
