import { Fragment, useEffect, useState } from 'react';
import { api } from '../api.js';
import { apiUrl } from '../../api/config.js';
import { Notice, fmtDate } from '../ui.jsx';

const STATUS = [['new', 'New'], ['contacted', 'Contacted'], ['won', 'Won'], ['closed', 'Closed']];

/** Internal notes: only the admin sees them. */
function NotesBox({ q, onSaved }) {
  const [text, setText] = useState(q.notes || '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  async function save() {
    setBusy(true); setMsg('');
    try { const r = await api.patch('quotes', q._id, { notes: text }); onSaved(r.item); setMsg('Saved.'); }
    catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  }
  return (
    <div className="ad-notes">
      <b>Internal notes</b> <small className="ad-hint">(the visitor never sees these)</small>
      <textarea rows={3} value={text} maxLength={2000} onChange={(e) => { setText(e.target.value); setMsg(''); }} placeholder="e.g. Called on Monday, wants a quote by Friday" />
      <div className="ad-bar" style={{ alignItems: 'center' }}>
        <button type="button" className="ad-btn sm" onClick={save} disabled={busy || text === (q.notes || '')}>{busy ? 'Saving…' : 'Save notes'}</button>
        {msg && <small className="ad-hint">{msg}</small>}
      </div>
    </div>
  );
}

export default function QuotesAdmin() {
  const [data, setData] = useState(null); // { items, total, page, pages }
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState(''); // debounced search
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const [notice, setNotice] = useState(null);

  // wait 300 ms after the last keystroke before searching
  useEffect(() => {
    const t = setTimeout(() => { setTerm(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const params = (extra = {}) => {
    const p = new URLSearchParams();
    if (filter) p.set('status', filter);
    if (term) p.set('q', term);
    Object.entries(extra).forEach(([k, v]) => p.set(k, v));
    const s = p.toString();
    return s ? `?${s}` : '';
  };

  const load = () => api.list('quotes', params({ page }))
    .then((r) => { setData(r); if (r.page !== page) setPage(r.page); setNotice(null); })
    .catch((e) => setNotice({ type: 'error', text: e.message }));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter, term, page]);

  const patchItem = (item) => setData((d) => ({ ...d, items: d.items.map((x) => (x._id === item._id ? { ...x, ...item } : x)) }));

  async function setStatus(q, status) {
    try { const r = await api.patch('quotes', q._id, { status }); patchItem(r.item); }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
  }
  async function del(q) {
    if (!window.confirm(`Delete the request from ${q.name}?`)) return;
    try { await api.remove('quotes', q._id); load(); } catch (e) { setNotice({ type: 'error', text: e.message }); }
  }
  const link = (c) => (c.includes('@') ? `mailto:${c}` : `tel:${c.replace(/[^\d+]/g, '')}`);
  const items = data?.items;

  return (
    <>
      <div className="ad-head">
        <h1>Quotes</h1>
        <a className="ad-btn ghost sm" href={apiUrl(`/api/admin/quotes/export.csv${params()}`)}>Export CSV (Excel)</a>
      </div>
      <div className="ad-filters">
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, contact, service, details, notes…" aria-label="Search quotes" />
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} aria-label="Filter by status">
          <option value="">All</option>
          {STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>
      <Notice notice={notice} />
      {!items ? (!notice && <p>Loading…</p>) : items.length === 0 ? <p>No requests{term || filter ? ' match your search.' : '.'}</p> : (
        <>
          <p className="ad-hint">{data.total} request{data.total === 1 ? '' : 's'}. Export CSV uses the current search and filter.</p>
          <div className="ad-card ad-table-wrap"><table className="ad-table">
            <thead><tr><th>Date</th><th>Name</th><th>Contact</th><th>Service</th><th>Status</th><th /></tr></thead>
            <tbody>
              {items.map((q) => (
                <Fragment key={q._id}>
                  <tr>
                    <td>{fmtDate(q.createdAt)}</td>
                    <td><b>{q.name}</b>{q.notes && <span title="Has notes"> 📝</span>}</td>
                    <td><a href={link(q.contact)}>{q.contact}</a></td>
                    <td>{q.service}</td>
                    <td><select value={q.status} onChange={(e) => setStatus(q, e.target.value)}>{STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></td>
                    <td className="ad-actions">
                      <button type="button" className="ad-btn ghost sm" onClick={() => setOpen(open === q._id ? null : q._id)}>{open === q._id ? 'Hide' : 'Details'}</button>
                      <button type="button" className="ad-btn danger sm" onClick={() => del(q)}>Delete</button>
                    </td>
                  </tr>
                  {open === q._id && (
                    <tr><td colSpan={6} className="ad-details">
                      {q.details ? <div style={{ whiteSpace: 'pre-wrap', marginBottom: 12 }}>{q.details}</div> : <p className="ad-hint">No details were written.</p>}
                      <NotesBox q={q} onSaved={patchItem} />
                    </td></tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table></div>
          {data.pages > 1 && (
            <div className="ad-pager">
              <button type="button" className="ad-btn ghost sm" disabled={data.page <= 1} onClick={() => setPage(data.page - 1)}>← Previous</button>
              <span>Page {data.page} of {data.pages}</span>
              <button type="button" className="ad-btn ghost sm" disabled={data.page >= data.pages} onClick={() => setPage(data.page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </>
  );
}
