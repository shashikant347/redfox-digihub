import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { submitQuote } from '../api/client.js';
import SocialLinks from './SocialLinks.jsx';

const EMPTY = { name: '', contact: '', service: '', details: '', website: '' };

export default function Quote({ brand, services, image }) {
  const options = [...services.map((s) => s.title), 'Multiple services'];
  const [params] = useSearchParams();
  const wanted = params.get('service');
  const first = options.includes(wanted) ? wanted : options[0];

  const [form, setForm] = useState({ ...EMPTY, service: first });
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (fieldErrors[key]) setFieldErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status.type === 'sending') return;
    setStatus({ type: 'sending', message: 'Sending…' });
    setFieldErrors({});
    try {
      const res = await submitQuote(form);
      setStatus({ type: 'ok', message: res.message });
      setForm({ ...EMPTY, service: first });
    } catch (err) {
      setFieldErrors(err.fieldErrors || {});
      setStatus({ type: 'err', message: err.message });
    }
  };

  const sending = status.type === 'sending';

  const I = {
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 8c0-3.3 3.6-6 8-6s8 2.7 8 6',
    phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
    globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z',
    mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
    wa: 'M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5zM9 8.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-.8.8c-.8-.4-1.6-1.2-2-2l.8-.8-1-2z',
    pin: 'M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  };
  const Icon = ({ d }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
  );

  return (
    <section id="quote" className="qt-sec">
      <div className="qt">
        <div className="qt-card rvx">
          {image && <img className="qt-card-art" src={image.src} alt="" loading="lazy" />}
          <span className="tag">Get a quote</span>
          <h2>Tell us about your project</h2>
          <p className="lead">Fill in the form and we reply with a plan, timeline and quote.</p>
          <form id="qf" onSubmit={onSubmit} noValidate>
            <div className="qt-row">
              <label className="qt-field">
                <span>Your name</span>
                <div className="qt-input">
                  <Icon d={I.user} />
                  <input name="n" placeholder="e.g. Rahul Kumar" value={form.name} onChange={set('name')} required autoComplete="name" aria-invalid={!!fieldErrors.name} />
                </div>
                {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
              </label>
              <label className="qt-field">
                <span>Phone or email</span>
                <div className="qt-input">
                  <Icon d={I.phone} />
                  <input name="c" placeholder="How can we reach you?" value={form.contact} onChange={set('contact')} required autoComplete="email" aria-invalid={!!fieldErrors.contact} />
                </div>
                {fieldErrors.contact && <span className="field-error">{fieldErrors.contact}</span>}
              </label>
            </div>

            <fieldset className="qt-services">
              <legend>What do you need?</legend>
              <div className="qt-chips">
                {options.map((o) => (
                  <label className={form.service === o ? 'on' : undefined} key={o}>
                    <input type="radio" name="s" value={o} checked={form.service === o} onChange={set('service')} />
                    {o}
                  </label>
                ))}
              </div>
              {fieldErrors.service && <span className="field-error">{fieldErrors.service}</span>}
            </fieldset>

            <label className="qt-field">
              <span>Project details <em>{form.details.length}/2000</em></span>
              <textarea name="d" rows="5" placeholder="Tell us about your business, goals, budget and timeline." value={form.details} onChange={set('details')} maxLength={2000} />
              {fieldErrors.details && <span className="field-error">{fieldErrors.details}</span>}
            </label>

            <div className="hp" aria-hidden="true">
              <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} /></label>
            </div>
            <button className="btn qt-send" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send quote request'}</button>
            {(status.type === 'ok' || status.type === 'err') && (
              <p className={`form-status ${status.type}`} role="status">{status.message}</p>
            )}
          </form>
        </div>

        <aside className="qt-side">
          <div className="qt-info rvx">
            <h3>Contact</h3>
            <a className="qt-row-link" href={`https://${brand.website.replace('https://', '').replace('http://', '')}`} target="_blank" rel="noopener noreferrer">
              <span className="qt-ico"><Icon d={I.globe} /></span>
              <span><small>Website</small>{brand.website}</span>
            </a>
            <a className="qt-row-link" href={brand.phoneHref}>
              <span className="qt-ico"><Icon d={I.phone} /></span>
              <span><small>Call us</small>{brand.phone}</span>
            </a>
            <a className="qt-row-link" href={`mailto:${brand.email}`}>
              <span className="qt-ico"><Icon d={I.mail} /></span>
              <span><small>Email</small>{brand.email}</span>
            </a>
            <a className="qt-row-link" href={brand.mapUrl} target="_blank" rel="noopener noreferrer">
              <span className="qt-ico"><Icon d={I.pin} /></span>
              <span><small>Address</small>{brand.address}</span>
            </a>
            <a className="btn qt-wa" href={brand.whatsapp} target="_blank" rel="noopener noreferrer">
              <Icon d={I.wa} /> Chat on WhatsApp
            </a>
            <h3 className="qt-sub">Connect with us</h3>
            <SocialLinks social={brand.social} showHandle className="social-tiles" />
          </div>
        </aside>
      </div>
    </section>
  );
}
