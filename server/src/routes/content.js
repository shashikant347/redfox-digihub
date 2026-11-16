import { Router } from 'express';
import { getContent } from '../services/contentStore.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    res.set('Cache-Control', 'public, max-age=30'); // short, so admin edits show up quickly
    res.json(await getContent());
  } catch (err) {
    next(err);
  }
});

export default router;
