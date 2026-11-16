import { Fragment, useEffect, useState } from 'react';
import { api } from '../api.js';
import { Notice, fmtDate } from '../ui.jsx';

const STATUS = [['new', 'New'], ['contacted', 'Contacted'], ['won', 'Won'], ['closed', 'Closed']];

export default function QuotesAdmin() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = () => api.list('quotes', filter ? `?status=${filter}` : '').then((r) => setItems(r.items))
    .catch((e) => setNotice({ type: 'error', text: e.message }));
  useEffect(() => { load(); }, [filter]);

  async function setStatus(q, status) {
    try { await api.patch('quotes', q._id, { status }); setItems((l) => l.map((x) => (x._id === q._id ? { ...x, status } : x))); }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
  }
  async function del(q) {
    if (!window.confirm(`Delete the request from ${q.name}?`)) return;
    try { await api.remove('quotes', q._id); load(); } catch (e) { setNotice({ type: 'error', text: e.message }); }
  }
  const link = (c) => (c.includes('@') ? `mailto:${c}` : `tel:${c.replace(/[^\d+]/g, '')}`);

  return (
    <>
      <div className="ad-head">
        <h1>Quotes</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
          <option value="">All</option>
          {STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>
      <Notice notice={notice} />
      {!items ? <p>Loading…</p> : items.length === 0 ? <p>No requests.</p> : (
        <div className="ad-card ad-table-wrap"><table className="ad-table">
          <thead><tr><th>Date</th><th>Name</th><th>Contact</th><th>Service</th><th>Status</th><th /></tr></thead>
          <tbody>
            {items.map((q) => (
              <Fragment key={q._id}>
                <tr>
                  <td>{fmtDate(q.createdAt)}</td>
                  <td><b>{q.name}</b></td>
                  <td><a href={link(q.contact)}>{q.contact}</a></td>
                  <td>{q.service}</td>
                  <td><select value={q.status} onChange={(e) => setStatus(q, e.target.value)}>{STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></td>
                  <td className="ad-actions">
                    {q.details && <button type="button" className="ad-btn ghost sm" onClick={() => setOpen(open === q._id ? null : q._id)}>{open === q._id ? 'Hide' : 'Details'}</button>}
                    <button type="button" className="ad-btn danger sm" onClick={() => del(q)}>Delete</button>
                  </td>
                </tr>
                {open === q._id && <tr><td colSpan={6} className="ad-details">{q.details}</td></tr>}
              </Fragment>
            ))}
          </tbody>
        </table></div>
      )}
    </>
  );
}
