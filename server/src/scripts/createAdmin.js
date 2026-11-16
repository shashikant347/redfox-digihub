// Usage:  npm run create-admin
// Creates the first admin (or resets the password of an existing one).
// Non-interactive:  ADMIN_EMAIL=you@x.com ADMIN_PASSWORD='long-password' npm run create-admin
import readline from 'node:readline';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import '../config.js';
import { connectDb } from '../db.js';
import { Admin } from '../models/index.js';

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const write = rl._writeToOutput.bind(rl);
    rl._writeToOutput = (s) => (hidden && rl.muted ? rl.output.write('*'.repeat(Math.max(0, s.length))) : write(s));
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer);
    });
    if (hidden) rl.muted = true;
  });
}

async function main() {
  let email = process.env.ADMIN_EMAIL;
  let password = process.env.ADMIN_PASSWORD;
  if (!email) email = await ask('Admin email: ');
  if (!password) {
    password = await ask('Password (min 10 characters): ', true);
    const again = await ask('Repeat password: ', true);
    if (password !== again) throw new Error('Passwords do not match.');
  }
  email = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email.');
  if (password.length < 10) throw new Error('Password must be at least 10 characters.');

  await connectDb();
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await Admin.findOne({ email });
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.tokenVersion += 1;
    await existing.save();
    console.log(`Password updated for ${email}`);
  } else {
    await Admin.create({ email, passwordHash });
    console.log(`Admin created: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
