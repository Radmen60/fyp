import { query } from './db.js';
import { roleGroup } from './constants.js';

// Attach req.user (or null) on every request based on session.
export async function attachUser(req, res, next) {
  if (req.session.userId) {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
    req.user = rows[0] || null;
    if (!req.user) req.session.userId = null; // stale session
  } else {
    req.user = null;
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please log in to continue.' });
  next();
}

// Restrict to users whose role group is in allowedGroups. Admins always pass.
export function requireRoleGroup(...allowedGroups) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Please log in to continue.' });
    const group = roleGroup(req.user.role);
    if (group !== 'admin' && !allowedGroups.includes(group)) {
      return res.status(403).json({ error: "You don't have access to that." });
    }
    next();
  };
}
