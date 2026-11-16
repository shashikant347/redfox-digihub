import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { Admin } from '../models/index.js';

export const COOKIE = 'rf_admin';
const WEEK = 7 * 24 * 60 * 60 * 1000;

export function setSession(res, admin) {
  const token = jwt.sign({ sub: String(admin._id), tv: admin.tokenVersion }, config.jwtSecret, { expiresIn: '7d' });
  res.cookie(COOKIE, token, {
    httpOnly: true, // JavaScript on the page can never read it
    sameSite: 'strict', // not sent from other sites (blocks CSRF)
    secure: config.cookieSecure,
    maxAge: WEEK,
    path: '/',
  });
}

export const clearSession = (res) => res.clearCookie(COOKIE, { path: '/' });

/** Protects every /api/admin/* route except login. */
export async function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE];
    if (!token) return res.status(401).json({ ok: false, message: 'Please log in.' });
    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch {
      return res.status(401).json({ ok: false, message: 'Session expired. Please log in again.' });
    }
    const admin = await Admin.findById(payload.sub);
    if (!admin || admin.tokenVersion !== payload.tv) {
      return res.status(401).json({ ok: false, message: 'Session expired. Please log in again.' });
    }
    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
}
