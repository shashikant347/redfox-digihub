import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { QAList, Notice } from '../ui.jsx';

export default function FaqAdmin() {
  const [items, setItems] = useState(null);
  const [notice, setNotice] = useState(null);
  useEffect(() => { api.getFaq().then((r) => setItems(r.items)).catch((e) => setNotice({ type: 'error', text: e.message })); }, []);

  async function save() {
    try { const r = await api.saveFaq(items); setItems(r.items); setNotice({ type: 'ok', text: 'FAQ saved. Empty questions or answers are removed.' }); }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
  }
  return (
    <>
      <div className="ad-head"><h1>FAQ</h1><button type="button" className="ad-btn" onClick={save} disabled={!items}>Save</button></div>
      <Notice notice={notice} />
      {items && <div className="ad-card ad-form"><QAList items={items} onChange={setItems} addLabel="Add FAQ" /></div>}
    </>
  );
}
