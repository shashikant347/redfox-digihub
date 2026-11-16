import { getServiceOptions } from '../services/contentStore.js';

// Strip control characters and trim, so stored data stays clean.
const clean = (v) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();

export async function validateQuote(req, res, next) {
  const body = req.body || {};
  const data = {
    name: clean(body.name),
    contact: clean(body.contact),
    service: clean(body.service),
    details: clean(body.details),
  };

  const errors = {};
  if (data.name.length < 2 || data.name.length > 100) {
    errors.name = 'Enter your name (2–100 characters).';
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact);
  const isPhone = /^[+()\-.\s\d]{7,20}$/.test(data.contact) && /\d{7,}/.test(data.contact.replace(/\D/g, ''));
  if (!isEmail && !isPhone) {
    errors.contact = 'Enter a valid email address or phone number.';
  }

  const services = await getServiceOptions();
  if (!services.includes(data.service)) {
    errors.service = 'Choose one of the listed services.';
  }

  if (data.details.length > 2000) {
    errors.details = 'Project details must be 2000 characters or fewer.';
  }

  // Honeypot: real visitors never fill this hidden field.
  if (clean(body.website)) {
    return res.status(201).json({ ok: true }); // pretend success, store nothing
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({ ok: false, message: 'Please fix the highlighted fields.', errors });
  }

  req.quote = data;
  next();
}
