// import_ledger.js (no skipped_rows_report, quiet by default)
// Usage: node import_ledger.js
// Optionally: VERBOSE=true node import_ledger.js  -> prints per-row warnings

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const parse = require('csv-parse/sync').parse;
const bcrypt = require('bcrypt');

const VERBOSE = !!process.env.VERBOSE;

const dbFile = path.join(__dirname, 'database.sqlite');
const csvFile = path.join(__dirname, 'ledger_all_members.csv');

const db = new Database(dbFile);

function toNumber(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (s === '') return null;
  const n = parseFloat(s.replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

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

console.log(`📘 Reading ${csvFile} ...`);
const csvContent = fs.readFileSync(csvFile, 'utf-8');
const rawRecords = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });

if (!rawRecords.length) {
  console.log('❌ No rows found in CSV. Nothing to import.');
  process.exit(0);
}

// Normalize keys to lowercase and trim values
const records = rawRecords.map((r, idx) => {
  const o = {};
  for (const k of Object.keys(r)) {
    const key = k.trim().toLowerCase();
    const val = r[k] == null ? '' : String(r[k]).trim();
    o[key] = val;
  }
  o._rowIndex = idx + 1; // for easier debugging if VERBOSE
  return o;
});

const findUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)');
const insertUser = db.prepare(`INSERT INTO users (fullname, email, password_hash) VALUES (?, ?, ?)`);
const insertTx = db.prepare(`
  INSERT INTO transactions (user_id, type, amount, description, occurred_at)
  VALUES (?, ?, ?, ?, ?)
`);

let imported = 0;
let skipped = 0;
const skipReasons = {
  missing_email: 0,
  missing_date: 0,
  invalid_date: 0,
  insert_user_failed: 0,
  no_amounts: 0,
  insert_tx_failed: 0
};

for (const row of records) {
  // Normalize common email header variants
  const emailRaw = row.email || row.email_address || row['e-mail'] || '';
  const email = String(emailRaw).trim().toLowerCase();

  if (!email) {
    // most of these are whitespace-only rows per your note — count and skip quietly
    skipped++;
    skipReasons.missing_email++;
    if (VERBOSE) console.warn(`⚠️ Row ${row._rowIndex}: missing email — skipping`);
    continue;
  }

  let user = findUser.get(email);
  if (!user) {
    if (VERBOSE) console.warn(`⚠️ Row ${row._rowIndex}: No user found for email: ${email}. Creating new user...`);
    const fullname = row.name || row.fullname || row['first name'] || 'Unknown User';
    const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'Smile@1234';
    const hash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

    try {
      const info = insertUser.run(fullname, email, hash);
      user = { id: info.lastInsertRowid };
    } catch (err) {
      skipped++;
      skipReasons.insert_user_failed++;
      if (VERBOSE) console.error(`❌ Row ${row._rowIndex}: Failed to insert user for ${email}: ${err.message}`);
      continue;
    }
  }

  const dateRaw = row.date || row.transaction_date || row['occurred at'] || row['occurred_at'];
  if (!dateRaw) {
    skipped++;
    skipReasons.missing_date++;
    if (VERBOSE) console.warn(`⚠️ Row ${row._rowIndex}: missing date — skipping`);
    continue;
  }

  let occurred_at;
  try {
    const d = new Date(dateRaw);
    if (isNaN(d)) {
      const alt = new Date(dateRaw.replace(/\//g,'-'));
      if (isNaN(alt)) throw new Error('invalid date');
      occurred_at = alt.toISOString();
    } else {
      occurred_at = d.toISOString();
    }
  } catch (err) {
    skipped++;
    skipReasons.invalid_date++;
    if (VERBOSE) console.warn(`⚠️ Row ${row._rowIndex}: invalid date "${dateRaw}" — skipping`);
    continue;
  }

  const desc = row.description || row.memo || '';

  // map common known columns (both lowercased)
  const fields = [
    ['thirteenth_month', 'thirteenth month'],
    ['electronics_loan', 'electronics loan'],
    ['emergency_loan', 'emergency loan'],
    ['main_loan', 'main loan'],
    ['savings', 'savings']
  ];

  let anyInsertedThisRow = false;
  for (const [key, label] of fields) {
    const value = row[key] ?? row[label];
    const amount = toNumber(value);
    if (amount == null || amount === 0) continue;

    try {
      insertTx.run(
        user.id,
        key,
        amount,
        desc,
        occurred_at
      );
      imported++;
      anyInsertedThisRow = true;
    } catch (err) {
      skipped++;
      skipReasons.insert_tx_failed++;
      if (VERBOSE) console.error(`❌ Row ${row._rowIndex}: failed to insert transaction: ${err.message}`);
    }
  }

  if (!anyInsertedThisRow) {
    skipped++;
    skipReasons.no_amounts++;
    if (VERBOSE) console.warn(`⚠️ Row ${row._rowIndex}: no amount columns had values — skipping`);
  }
}

// final summary
console.log(`\n✅ Imported ${imported} transactions. Skipped ${skipped}.\n`);

// breakdown (only show reasons that happened)
const breakdownLines = [];
for (const k of Object.keys(skipReasons)) {
  if (skipReasons[k] > 0) {
    breakdownLines.push(`${k}: ${skipReasons[k]}`);
  }
}
if (breakdownLines.length) {
  console.log('Skipped breakdown:');
  for (const l of breakdownLines) console.log(' -', l);
}

db.close();
