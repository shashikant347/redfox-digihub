import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Field, Input, ListEditor, Notice } from '../ui.jsx';

function Brand() {
  const [b, setB] = useState(null);
  const [notice, setNotice] = useState(null);
  useEffect(() => { api.getBrand().then((r) => setB({ social: [], ...r.brand })).catch((e) => setNotice({ type: 'error', text: e.message })); }, []);
  if (!b) return <Notice notice={notice} />;
  const set = (k) => (v) => setB((p) => ({ ...p, [k]: v }));

  async function save(e) {
    e.preventDefault();
    try { const r = await api.saveBrand(b); setB({ social: [], ...r.brand }); setNotice({ type: 'ok', text: 'Saved. Header, footer and contact sections now use these details.' }); }
    catch (err) { setNotice({ type: 'error', text: err.message }); }
  }
  return (
    <form className="ad-card ad-form" onSubmit={save}>
      <h2>Contact details and social links</h2>
      <Notice notice={notice} />
      <Field label="online name"><Input value={b.name} onChange={set('name')} /></Field>
      <Field label="Tagline"><Input value={b.tagline} onChange={set('tagline')} /></Field>
      <Field label="Website"><Input value={b.website} onChange={set('website')} /></Field>
      <Field label="Email"><Input type="email" value={b.email} onChange={set('email')} /></Field>
      <Field label="Phone"><Input value={b.phone} onChange={set('phone')} placeholder="+91 97096 00011" /></Field>
      <Field label="WhatsApp link" hint="e.g. https://wa.me/919709600011"><Input value={b.whatsapp} onChange={set('whatsapp')} /></Field>
      <Field label="Address"><Input value={b.address} onChange={set('address')} /></Field>
      <Field label="Google Maps link"><Input value={b.mapUrl} onChange={set('mapUrl')} /></Field>
      <Field label="Social links">
        <ListEditor
          items={b.social}
          onChange={set('social')}
          blank={() => ({ id: '', label: '', handle: '', url: '' })}
          addLabel="Add social link"
          render={(v, s) => (
            <>
              <Input value={v.label} onChange={(t) => s({ ...v, label: t })} placeholder="Name, e.g. Instagram" />
              <Input value={v.handle} onChange={(t) => s({ ...v, handle: t })} placeholder="@handle" />
              <Input value={v.url} onChange={(t) => s({ ...v, url: t })} placeholder="https://…" />
            </>
          )}
        />
      </Field>
      <div className="ad-bar"><button className="ad-btn">Save</button></div>
    </form>
  );
}

function Password() {
  const [p, setP] = useState({ current: '', next: '' });
  const [notice, setNotice] = useState(null);
  async function save(e) {
    e.preventDefault();
    try { await api.changePassword(p.current, p.next); setP({ current: '', next: '' }); setNotice({ type: 'ok', text: 'Password changed. Other devices were logged out.' }); }
    catch (err) { setNotice({ type: 'error', text: err.message }); }
  }
  return (
    <form className="ad-card ad-form" onSubmit={save}>
      <h2>Change password</h2>
      <Notice notice={notice} />
      <Field label="Current password"><Input type="password" autoComplete="current-password" value={p.current} onChange={(v) => setP({ ...p, current: v })} required /></Field>
      <Field label="New password" hint="At least 10 characters."><Input type="password" autoComplete="new-password" value={p.next} onChange={(v) => setP({ ...p, next: v })} required minLength={10} /></Field>
      <div className="ad-bar"><button className="ad-btn">Change password</button></div>
    </form>
  );
}

export default function SettingsAdmin() {
  return (<><h1>Settings</h1><Brand /><Password /></>);
}
