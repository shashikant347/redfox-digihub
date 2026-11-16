import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { connectDb } from './db.js';
import { seedIfEmpty, getContent } from './services/contentStore.js';
import { resolveMeta, renderIndex, buildSitemap } from './services/seo.js';
import contentRouter from './routes/content.js';
import quotesRouter from './routes/quotes.js';
import adminRouter from './routes/admin.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1); // correct client IPs behind a proxy (rate limiting)

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
      },
    },
  })
);
app.use(cors({ origin: config.isProd ? false : config.clientOrigin, credentials: true }));
app.use(cookieParser());

// ---- API ----
app.get('/api/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));
// Admin API has its own, larger JSON limit (service pages have lots of text). Mounted before the 20kb parser.
app.use('/api/admin', express.json({ limit: '300kb' }), (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
}, adminRouter);
app.use(express.json({ limit: '20kb' }));
app.use('/api/content', contentRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api', (_req, res) => res.status(404).json({ ok: false, message: 'Not found.' }));

// ---- Uploaded images ----
app.use('/uploads', express.static(config.uploadsDir, { maxAge: '7d', index: false, fallthrough: false }));

// ---- robots.txt and sitemap.xml ----
const baseUrl = (req) => `${req.protocol}://${req.get('host')}`;
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${baseUrl(req)}/sitemap.xml\n`);
});
app.get('/sitemap.xml', async (req, res, next) => {
  try {
    res.type('application/xml').send(buildSitemap(await getContent(), baseUrl(req)));
  } catch (err) {
    next(err);
  }
});

// ---- Serve the built React app (production) ----
const indexFile = path.join(config.clientDist, 'index.html');
if (fs.existsSync(indexFile)) {
  const template = fs.readFileSync(indexFile, 'utf-8');
  app.use(express.static(config.clientDist, { maxAge: config.isProd ? '1d' : 0, index: false }));
  app.get('*', async (req, res, next) => {
    try {
      if (req.path === '/admin' || req.path.startsWith('/admin/')) {
        const meta = { title: 'Admin — REDFOX', description: 'REDFOX admin panel' };
        return res.type('html').send(renderIndex(template, meta, { noindex: true }));
      }
      const meta = resolveMeta(await getContent(), req.path);
      const url = meta.known ? baseUrl(req) + (req.path.replace(/\/+$/, '') || '/') : undefined;
      res.type('html').send(renderIndex(template, meta, { url, noindex: !meta.known }));
    } catch (err) {
      next(err);
    }
  });
}

// ---- Errors ----
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ ok: false, message: 'Invalid JSON.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ ok: false, message: 'Request is too large.' });
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ ok: false, message: 'Image must be 5 MB or smaller.' });
  if (err.status >= 400 && err.status < 500) return res.status(err.status).json({ ok: false, message: err.message });
  console.error(err);
  res.status(500).json({ ok: false, message: 'Something went wrong on our side. Please try again.' });
});

try {
  await connectDb();
  await seedIfEmpty();
} catch (err) {
  console.error('Could not start: ' + err.message);
  console.error('Is MongoDB running, and is MONGODB_URI in server/.env correct?');
  process.exit(1);
}

app.listen(config.port, () => {
  console.log(`REDFOX server running on http://localhost:${config.port} (${config.env})`);
});
