import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '../db.js';
import { SIGNUP_ROLES, ROLE_LABELS, roleGroup } from '../constants.js';
import { resolveLocation } from '../locationHelper.js';
import { GeocodingError } from '../geocoding.js';
import { requireAuth } from '../authMiddleware.js';

const router = Router();
const RESET_TOKEN_VALID_MINUTES = 30;

function publicUser(u) {
  if (!u) return null;
  const { password_hash, reset_token, reset_token_expires, ...rest } = u;
  return { ...rest, role_group: roleGroup(u.role) };
}

router.get('/me', (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post('/register', async (req, res) => {
  const { name, email: rawEmail, password, role, preferred_categories, phone } = req.body;
  const email = (rawEmail || '').trim().toLowerCase();
  const errors = [];

  if (!name || !name.trim()) errors.push('Name is required.');
  if (!email || !email.includes('@')) errors.push('A valid email is required.');
  if (password === undefined || password.length < 6) errors.push('Password must be at least 6 characters.');
  if (!SIGNUP_ROLES.includes(role)) errors.push('Please choose a valid entity type.');

  if (email && email.includes('@')) {
    const { rows } = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (rows.length) errors.push('An account with that email already exists.');
  }

  let address, lat, lng;
  if (!errors.length) {
    try {
      ({ address, lat, lng } = await resolveLocation(req.body));
    } catch (e) {
      if (e instanceof GeocodingError) errors.push(e.message);
      else throw e;
    }
  }

  if (errors.length) return res.status(400).json({ errors });

  const passwordHash = await bcrypt.hash(password, 10);
  const categories = Array.isArray(preferred_categories) ? preferred_categories.join(',') : (preferred_categories || '');

  const { rows } = await query(
    `INSERT INTO users (name, role, email, phone, password_hash, address, latitude, longitude, preferred_categories)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [name.trim(), role, email, (phone || '').trim() || null, passwordHash, address, lat, lng, categories]
  );

  const user = rows[0];
  req.session.userId = user.id;
  res.status(201).json({ user: publicUser(user), message: `Welcome, ${user.name}! Your ${ROLE_LABELS[role]} account is ready.` });
});

router.post('/login', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  req.session.userId = user.id;
  res.json({ user: publicUser(user), message: `Welcome back, ${user.name}.` });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: "You've been logged out." });
  });
});

router.post('/forgot-password', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];

  if (!user) {
    return res.status(404).json({ error: 'No account found with that email.' });
  }

  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + RESET_TOKEN_VALID_MINUTES * 60000);
  await query('UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3', [token, expires, user.id]);

  res.json({
    resetToken: token,
    message: "This prototype has no email server, so here's your reset link directly (in production this would be emailed to you instead).",
  });
});

router.get('/reset-password/:token', async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE reset_token = $1', [req.params.token]);
  const user = rows[0];
  const valid = !!(user && user.reset_token_expires && new Date(user.reset_token_expires) > new Date());
  res.json({ valid });
});

router.post('/reset-password/:token', async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE reset_token = $1', [req.params.token]);
  const user = rows[0];
  const valid = !!(user && user.reset_token_expires && new Date(user.reset_token_expires) > new Date());

  if (!valid) {
    return res.status(400).json({ error: 'That reset link is invalid or has expired. Request a new one.' });
  }

  const { password, confirm_password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  if (password !== confirm_password) return res.status(400).json({ error: "Passwords don't match." });

  const passwordHash = await bcrypt.hash(password, 10);
  await query('UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2', [passwordHash, user.id]);
  res.json({ message: 'Password reset. You can log in now.' });
});

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

router.patch('/profile', requireAuth, async (req, res) => {
  const { name, email: rawEmail, preferred_categories, phone } = req.body;
  const email = (rawEmail || '').trim().toLowerCase();
  const errors = [];

  if (!name || !name.trim()) errors.push('Name is required.');
  if (!email || !email.includes('@')) errors.push('A valid email is required.');
  else {
    const { rows } = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, req.user.id]);
    if (rows.length) errors.push('Another account already uses that email.');
  }

  let address, lat, lng;
  if (!errors.length) {
    try {
      ({ address, lat, lng } = await resolveLocation(req.body));
    } catch (e) {
      if (e instanceof GeocodingError) errors.push(e.message);
      else throw e;
    }
  }

  if (errors.length) return res.status(400).json({ errors });

  const categories = Array.isArray(preferred_categories) ? preferred_categories.join(',') : (preferred_categories || '');
  const { rows } = await query(
    `UPDATE users SET name = $1, email = $2, phone = $3, address = $4, latitude = $5, longitude = $6, preferred_categories = $7
     WHERE id = $8 RETURNING *`,
    [name.trim(), email, (phone || '').trim() || null, address, lat, lng, categories, req.user.id]
  );
  res.json({ user: publicUser(rows[0]), message: 'Profile updated.' });
});

router.post('/change-password', requireAuth, async (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;

  if (!(await bcrypt.compare(current_password || '', req.user.password_hash))) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }
  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }
  if (new_password !== confirm_password) {
    return res.status(400).json({ error: "New passwords don't match." });
  }

  const passwordHash = await bcrypt.hash(new_password, 10);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, req.user.id]);
  res.json({ message: 'Password changed.' });
});

export default router;
