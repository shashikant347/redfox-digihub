import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from '../config.js';

// Serialise writes so two requests at once cannot corrupt the file.
let queue = Promise.resolve();

async function readAll() {
  try {
    return JSON.parse(await fs.readFile(config.quotesFile, 'utf-8'));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeAll(list) {
  await fs.mkdir(path.dirname(config.quotesFile), { recursive: true });
  const tmp = `${config.quotesFile}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), 'utf-8');
  await fs.rename(tmp, config.quotesFile); // atomic replace
}

export function saveQuote(data) {
  const job = queue.then(async () => {
    const list = await readAll();
    const quote = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    list.push(quote);
    await writeAll(list);
    return quote;
  });
  queue = job.catch(() => {}); // keep the queue alive after an error
  return job;
}

export async function listQuotes() {
  const list = await readAll();
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
