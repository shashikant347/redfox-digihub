import { useState } from 'react';
import { api } from '../api.js';
import { Field, Input } from '../ui.jsx';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api.login(email, password);
      onLogin(r.admin);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ad-center">
      <form className="ad-card ad-login" onSubmit={submit}>
        <h1>REDFOX Admin</h1>
        <Field label="Email"><Input type="email" autoComplete="username" value={email} onChange={setEmail} required /></Field>
        <Field label="Password"><Input type="password" autoComplete="current-password" value={password} onChange={setPassword} required /></Field>
        {error && <div className="ad-notice error" role="alert">{error}</div>}
        <button className="ad-btn" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
    </div>
  );
}
