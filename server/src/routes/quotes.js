import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validateQuote } from '../middleware/validateQuote.js';
import { Quote } from '../models/index.js';
import { sendQuoteEmail } from '../services/mailer.js';

const router = Router();

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10, // 10 requests per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: 'Too many requests. Please try again in a few minutes.' },
});

// Public: submit a quote request
router.post('/', submitLimiter, validateQuote, async (req, res, next) => {
  try {
    const quote = await Quote.create(req.quote);

    // Email is best-effort: the request is already saved, so a mail failure must not fail the user.
    let emailed = false;
    try {
      emailed = await sendQuoteEmail(quote);
    } catch (mailErr) {
      console.error('Quote email failed:', mailErr.message);
    }

    res.status(201).json({
      ok: true,
      message: 'Thanks! Your quote request has been received. We will reply soon.',
      id: String(quote._id),
      emailed,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
