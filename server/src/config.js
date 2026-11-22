import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SERVER_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(SERVER_ROOT, '.env') });

const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production';

let jwtSecret = process.env.JWT_SECRET || '';
if (isProd && jwtSecret.length < 32) {
  console.error('JWT_SECRET must be set to 32+ characters in production (see .env.example).');
  process.exit(1);
}
if (!jwtSecret) {
  jwtSecret = crypto.randomBytes(32).toString('hex');
  console.warn('JWT_SECRET is not set: using a temporary one. Admin logins reset on every server restart.');
}

export const config = {
  port: Number(process.env.PORT) || 5000,
  env,
  isProd,
  clientOrigin: process.env.CLIENT_ORIGIN || (isProd ? '' : 'http://localhost:5173'),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    socketPath: process.env.DB_SOCKET || '',
    name: process.env.DB_NAME || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
  },
  jwtSecret,
  cookieSecure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProd,
  seedFile: path.join(SERVER_ROOT, 'data', 'content.json'),
  uploadsDir: process.env.UPLOADS_DIR ? path.resolve(process.env.UPLOADS_DIR) : path.join(SERVER_ROOT, 'uploads'),
  clientDist: path.resolve(SERVER_ROOT, '..', 'client', 'dist'),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'REDFOX Website <no-reply@redfoxonline.in>',
    to: process.env.MAIL_TO || 'info@redfoxonline.in',
  },
};
