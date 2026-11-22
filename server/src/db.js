import mysql from 'mysql2/promise';
import { config } from './config.js';

let pool = null;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS admins (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(190) NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    token_version INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE KEY uq_admins_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS services (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(190) NOT NULL,
    title VARCHAR(255) NOT NULL,
    \`text\` TEXT NOT NULL,
    points LONGTEXT NOT NULL,
    image VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    seo_title VARCHAR(255) NOT NULL,
    seo_description TEXT NOT NULL,
    detail LONGTEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE KEY uq_services_slug (slug)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS work_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    kind VARCHAR(255) NOT NULL,
    image VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    KEY ix_work_category (category)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS settings (
    skey VARCHAR(100) NOT NULL PRIMARY KEY,
    svalue LONGTEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS quotes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    notes TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    KEY ix_quotes_status (status),
    KEY ix_quotes_created (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

function getPool() {
  if (!pool) {
    const d = config.db;
    pool = mysql.createPool({
      ...(d.socketPath ? { socketPath: d.socketPath } : { host: d.host, port: d.port }),
      user: d.user,
      password: d.password,
      database: d.name,
      charset: 'utf8mb4',
      timezone: 'Z', // all dates are stored and read as UTC
      waitForConnections: true,
      connectionLimit: 5,
      connectTimeout: 8000,
    });
  }
  return pool;
}

/** Runs one SQL statement. Use ? for values. Returns rows (SELECT) or the result header (INSERT/UPDATE/DELETE). */
export async function query(sql, params = []) {
  const [rows] = await getPool().query(sql, params);
  return rows;
}

/** Runs several statements as one all-or-nothing transaction. */
export async function transaction(fn) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn((sql, params = []) => conn.query(sql, params).then(([r]) => r));
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}

export async function connectDb() {
  await query('SELECT 1');
  for (const sql of SCHEMA) await query(sql); // creates the tables on the first start
  console.log('MySQL connected');
}

export async function closeDb() {
  if (pool) await pool.end();
  pool = null;
}
