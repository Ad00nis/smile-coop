// db_setup.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const parse = require('csv-parse/sync').parse;

const dbFile = path.join(__dirname, 'database.sqlite'); // absolute path
const db = new Database(dbFile);

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fullname TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT DEFAULT 'user',
  must_change_password INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'NGN',
  description TEXT,
  occurred_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'Smile@1234';
const saltRounds = 10;
const insert = db.prepare(
  `INSERT OR IGNORE INTO users (fullname, email, password_hash) VALUES (?, ?, ?)`
);

(async () => {
  const csvPath = path.join(__dirname, 'users.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rawRecords = parse(csvContent, { columns: true, skip_empty_lines: true });

  // Normalize keys to lowercase and trim values
  const records = rawRecords.map(r => {
    const o = {};
    for (const k of Object.keys(r)) {
      const key = k.trim().toLowerCase();
      o[key] = (r[k] == null) ? '' : String(r[k]).trim();
    }
    return o;
  });

  for (const r of records) {
    const fullname = r.name || r.fullname || 'Unknown User';
    const email = (r.email || '').trim().toLowerCase();
    if (!email) continue;
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, saltRounds);
    insert.run(fullname, email, hash);
  }

  // ensure admin
  const adminEmail = 'admin@smile.local';
  const adminHash = await bcrypt.hash(DEFAULT_PASSWORD, saltRounds);
  db.prepare(
    `INSERT OR IGNORE INTO users (fullname,email,password_hash,role) VALUES (?,?,?,?)`
  ).run('Site Admin', adminEmail.toLowerCase(), adminHash, 'admin');

  console.log(`✅ Seeded ${records.length} users + admin into ${dbFile}`);
  db.close();
})();
