import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { fmtDate } from '../ui.jsx';

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.stats().then(setS).catch((e) => setErr(e.message)); }, []);
  if (err) return <div className="ad-notice error">{err}</div>;
  if (!s) return <p>Loading…</p>;
  return (
    <>
      <h1>Dashboard</h1>
      <div className="ad-stats">
        <Link to="/admin/quotes" className="ad-card"><b>{s.quotesNew}</b><span>New quotes</span></Link>
        <Link to="/admin/quotes" className="ad-card"><b>{s.quotesTotal}</b><span>All quotes</span></Link>
        <Link to="/admin/services" className="ad-card"><b>{s.services}</b><span>Services</span></Link>
        <Link to="/admin/work" className="ad-card"><b>{s.work}</b><span>Work items</span></Link>
      </div>
      <h2>Latest quote requests</h2>
      {s.latest.length === 0 ? <p>No requests yet.</p> : (
        <div className="ad-card ad-table-wrap"><table className="ad-table"><tbody>
          {s.latest.map((q) => (
            <tr key={q._id}><td>{q.name}</td><td>{q.service}</td><td>{q.contact}</td><td>{fmtDate(q.createdAt)}</td></tr>
          ))}
        </tbody></table></div>
      )}
    </>
  );
}
