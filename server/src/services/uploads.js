import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { config } from '../config.js';

// SVG is not allowed: it can carry scripts.
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

fs.mkdirSync(config.uploadsDir, { recursive: true });

export const upload = multer({
  storage: multer.diskStorage({
    destination: config.uploadsDir,
    filename: (_req, file, cb) => cb(null, `${crypto.randomBytes(12).toString('hex')}${EXT[file.mimetype]}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (EXT[file.mimetype]) return cb(null, true);
    const err = new Error('Only JPG, PNG, WebP or GIF images are allowed.');
    err.status = 400;
    cb(err);
  },
});

/** Deletes an uploaded file when its image is replaced or its record is deleted. Ignores /images/* (built-in) files. */
export function removeUpload(url) {
  if (typeof url !== 'string' || !url.startsWith('/uploads/')) return;
  fs.unlink(path.join(config.uploadsDir, path.basename(url)), () => {});
}
