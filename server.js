// server.js
require('dotenv').config();
const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const db = new Database('./database.sqlite');

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const COOKIE_SECURE = (process.env.COOKIE_SECURE === 'true');

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));

// serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// helper: find user by email
function findUserByEmail(email) {
  const row = db.prepare('SELECT id, fullname, email, password_hash, role FROM users WHERE email = ?').get(email.toLowerCase());
  return row || null;
}

// helper: find user by id
function findUserById(id) {
  return db.prepare('SELECT id, fullname, email, role FROM users WHERE id = ?').get(id);
}

// generate jwt
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '4h' });
}

// auth middleware
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// admin middleware
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Require admin' });
  next();
}

/* ========== Routes ========== */

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken({ id: user.id, email: user.email, role: user.role, fullname: user.fullname });

  // set token as HttpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    maxAge: 4 * 60 * 60 * 1000 // 4 hours
  });

  res.json({ ok: true });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

// GET /api/me
// GET /api/me/transactions?to=...
app.get('/api/me/transactions', requireAuth, (req, res) => {
  const to = req.query.to;
  const stmt = db.prepare(`
    SELECT
      DATE(occurred_at, 'localtime') AS date,
      description,
      SUM(CASE WHEN type = 'thirteenth_month' THEN amount ELSE 0 END) AS thirteenth_month,
      SUM(CASE WHEN type = 'electronics_loan' THEN amount ELSE 0 END) AS electronics_loan,
      SUM(CASE WHEN type = 'emergency_loan' THEN amount ELSE 0 END) AS emergency_loan,
      SUM(CASE WHEN type = 'main_loan' THEN amount ELSE 0 END) AS main_loan,
      SUM(CASE WHEN type = 'savings' THEN amount ELSE 0 END) AS savings
    FROM transactions
    WHERE user_id = ?
    ${to ? 'AND occurred_at <= ?' : ''}
    GROUP BY DATE(occurred_at), description
    ORDER BY DATE(occurred_at) DESC
  `);

  const rows = to ? stmt.all(req.user.id, to) : stmt.all(req.user.id);
  res.json({ transactions: rows });
});


// GET /api/ledger (authenticated)
app.get('/api/ledger', requireAuth, (req, res) => {
  const stmt = db.prepare(`
    SELECT
      t.id,
      t.type,
      t.amount,
      t.currency,
      t.description,
      t.occurred_at,
      u.fullname
    FROM transactions t
    JOIN users u ON u.id = t.user_id
    WHERE t.user_id = ?
    ORDER BY t.occurred_at DESC
  `);

  const rows = stmt.all(req.user.id);
  res.json({ ledger: rows });
});

// GET /api/admin/ledger (admin only)
app.get('/api/admin/ledger', requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT
      t.id,
      u.fullname,
      u.email,
      t.type,
      t.amount,
      t.currency,
      t.description,
      t.occurred_at
    FROM transactions t
    JOIN users u ON u.id = t.user_id
    ORDER BY t.occurred_at DESC
  `).all();
  res.json({ ledger: rows });
});

// GET /api/admin/users (admin only)
app.get('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT id, fullname, email, role, created_at FROM users ORDER BY id ASC').all();
  res.json({ users: rows });
});

app.post('/api/admin/add-user', async (req, res) => {
  const user = req.user;
  if (!user || user.role !== 'admin')
    return res.status(403).json({ error: 'Forbidden' });

  const { fullname, email, join_year } = req.body;
  if (!fullname || !email || !join_year)
    return res.status(400).json({ error: 'Missing fields' });

  try {
    await db.run(
      `INSERT INTO users (fullname, email, join_year, role) VALUES (?, ?, ?, 'member')`,
      [fullname, email, join_year]
    );
    res.json({ message: 'Member added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding member' });
  }
});


// simple endpoint to change password (for future)
app.post('/api/me/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ error: 'New password required' });
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'User not found' });
  const ok = await bcrypt.compare(currentPassword, row.password_hash);
  if (!ok) return res.status(403).json({ error: 'Current password incorrect' });
  const hash = await bcrypt.hash(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
  res.json({ ok: true });
});

// GET /api/me
app.get('/api/me', requireAuth, (req, res) => {
  // Return the authenticated user's info
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});


// fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
