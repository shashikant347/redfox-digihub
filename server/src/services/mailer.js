import nodemailer from 'nodemailer';
import { config } from '../config.js';

const { smtp } = config;
let transporter = null;

function getTransporter() {
  if (!smtp.host) return null; // email is optional
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
    });
  }
  return transporter;
}

/** Emails a new quote request to the online. Resolves to false when SMTP is not configured. */
export async function sendQuoteEmail(quote) {
  const t = getTransporter();
  if (!t) return false;

  const text = [
    `Name: ${quote.name}`,
    `Contact: ${quote.contact}`,
    `Service: ${quote.service}`,
    '',
    quote.details || '(no details provided)',
  ].join('\n');

  await t.sendMail({
    from: smtp.from,
    to: smtp.to,
    replyTo: quote.contact.includes('@') ? quote.contact : undefined,
    subject: `Quote request: ${quote.service}`,
    text,
  });
  return true;
}
