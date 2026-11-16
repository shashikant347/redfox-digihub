import { useRef, useState } from 'react';
import { api } from './api.js';

export function Notice({ notice }) {
  if (!notice) return null;
  return <div className={`ad-notice ${notice.type}`} role="status">{notice.text}</div>;
}

export function Field({ label, hint, error, children }) {
  return (
    <label className="ad-field">
      <span className="ad-label">{label}</span>
      {children}
      {hint && <small className="ad-hint">{hint}</small>}
      {error && <small className="ad-err">{error}</small>}
    </label>
  );
}

/** Text input / textarea bound to a value. */
export function Input({ value, onChange, area, rows = 3, ...rest }) {
  const Tag = area ? 'textarea' : 'input';
  return <Tag value={value ?? ''} rows={area ? rows : undefined} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

/** Upload a picture; stores the returned /uploads/... URL. */
export function ImageField({ label = 'Image', value, onChange, error }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setMsg('');
    try {
      const { url } = await api.upload(file);
      onChange(url);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ad-field">
      <span className="ad-label">{label}</span>
      <div className="ad-img">
        {value ? <img src={value} alt="" /> : <div className="ad-img-empty">No image</div>}
        <div className="ad-img-btns">
          <button type="button" className="ad-btn ghost" onClick={() => ref.current?.click()} disabled={busy}>
            {busy ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
          </button>
          {value && <button type="button" className="ad-btn link" onClick={() => onChange('')}>Remove</button>}
          <small className="ad-hint">JPG, PNG, WebP or GIF, up to 5 MB.</small>
        </div>
        <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={pick} />
      </div>
      {(msg || error) && <small className="ad-err">{msg || error}</small>}
    </div>
  );
}

/** A list the admin can add to, remove from and reorder. render(item, setItem) draws one row. */
export function ListEditor({ items, onChange, blank, addLabel, render }) {
  const set = (i, v) => onChange(items.map((x, j) => (j === i ? v : x)));
  const del = (i) => onChange(items.filter((_, j) => j !== i));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const a = [...items];
    [a[i], a[j]] = [a[j], a[i]];
    onChange(a);
  };
  return (
    <div className="ad-list">
      {items.map((it, i) => (
        <div className="ad-li" key={i}>
          <div className="ad-li-body">{render(it, (v) => set(i, v))}</div>
          <div className="ad-li-act">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
            <button type="button" onClick={() => del(i)} aria-label="Remove">✕</button>
          </div>
        </div>
      ))}
      <button type="button" className="ad-btn ghost" onClick={() => onChange([...items, blank()])}>+ {addLabel}</button>
    </div>
  );
}

export const StringList = ({ items, onChange, addLabel, placeholder }) => (
  <ListEditor
    items={items}
    onChange={onChange}
    blank={() => ''}
    addLabel={addLabel}
    render={(v, set) => <Input value={v} onChange={set} placeholder={placeholder} />}
  />
);

export const PairList = ({ items, onChange, addLabel }) => (
  <ListEditor
    items={items}
    onChange={onChange}
    blank={() => ({ title: '', text: '' })}
    addLabel={addLabel}
    render={(v, set) => (
      <>
        <Input value={v.title} onChange={(t) => set({ ...v, title: t })} placeholder="Title" />
        <Input area rows={2} value={v.text} onChange={(t) => set({ ...v, text: t })} placeholder="Short text" />
      </>
    )}
  />
);

export const QAList = ({ items, onChange, addLabel }) => (
  <ListEditor
    items={items}
    onChange={onChange}
    blank={() => ({ q: '', a: '' })}
    addLabel={addLabel}
    render={(v, set) => (
      <>
        <Input value={v.q} onChange={(t) => set({ ...v, q: t })} placeholder="Question" />
        <Input area rows={3} value={v.a} onChange={(t) => set({ ...v, a: t })} placeholder="Answer" />
      </>
    )}
  />
);

export const fmtDate = (d) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
