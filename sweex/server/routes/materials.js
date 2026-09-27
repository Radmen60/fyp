import { Router } from 'express';
import { query, pool } from '../db.js';
import { requireAuth } from '../authMiddleware.js';
import { resolveLocation } from '../locationHelper.js';
import { GeocodingError } from '../geocoding.js';
import { estimateValue, findMatches } from '../matching.js';
import { CATEGORIES, CONDITIONS, UNITS } from '../constants.js';

const router = Router();

router.get('/meta', (req, res) => {
  res.json({ categories: CATEGORIES, conditions: CONDITIONS, units: UNITS });
});

router.get('/', requireAuth, async (req, res) => {
  const { category, status } = req.query;
  const conditions = [];
  const params = [];
  if (category) { params.push(category); conditions.push(`materials.category = $${params.length}`); }
  if (status) { params.push(status); conditions.push(`materials.status = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await query(
    `SELECT materials.*, users.name AS owner_name
     FROM materials JOIN users ON materials.owner_id = users.id
     ${where}
     ORDER BY materials.created_at DESC`,
    params
  );
  res.json(rows);
});

router.get('/mine', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT materials.*, users.name AS owner_name
     FROM materials JOIN users ON materials.owner_id = users.id
     WHERE materials.owner_id = $1
     ORDER BY materials.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

router.get('/:id', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT materials.*, users.name AS owner_name
     FROM materials JOIN users ON materials.owner_id = users.id
     WHERE materials.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Material not found.' });

  const material = rows[0];
  const { rows: matches } = await query(
    `SELECT matches.*, users.name AS matched_user_name, users.role AS matched_user_role,
            users.address AS matched_user_address
     FROM matches JOIN users ON matches.matched_user_id = users.id
     WHERE matches.material_id = $1
     ORDER BY matches.score DESC`,
    [material.id]
  );

  res.json({
    material,
    matches,
    is_owner: req.user.id === material.owner_id,
    is_admin: req.user.role === 'admin',
  });
});

router.post('/', requireAuth, async (req, res) => {
  const { title, description, category, quantity, unit, condition } = req.body;
  const errors = [];

  if (!title || !title.trim()) errors.push('Title is required.');
  if (!CATEGORIES.includes(category)) errors.push('Please choose a valid category.');
  if (!CONDITIONS.includes(condition)) errors.push('Please choose a valid condition.');
  if (!UNITS.includes(unit)) errors.push('Please choose a valid unit.');
  const qty = parseFloat(quantity);
  if (Number.isNaN(qty) || qty <= 0) errors.push('Quantity must be a positive number.');

  let address, lat, lng;
  try {
    ({ address, lat, lng } = await resolveLocation(req.body));
  } catch (e) {
    if (e instanceof GeocodingError) errors.push(e.message);
    else throw e;
  }

  if (errors.length) return res.status(400).json({ errors });

  const estimatedValue = estimateValue(category, qty, condition);
  const { rows } = await query(
    `INSERT INTO materials (owner_id, title, description, category, quantity, unit, condition, estimated_value, address, latitude, longitude)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [req.user.id, title.trim(), (description || '').trim(), category, qty, unit, condition, estimatedValue, address, lat, lng]
  );

  res.status(201).json({ material: rows[0], message: `Listed! Estimated value: $${estimatedValue.toFixed(2)}` });
});

router.post('/:id/find-matches', requireAuth, async (req, res) => {
  const { rows } = await query('SELECT * FROM materials WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Material not found.' });
  const material = rows[0];

  if (req.user.id !== material.owner_id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only the person who listed this material can search for matches.' });
  }

  const { rows: candidates } = await query(
    `SELECT * FROM users WHERE role IN ('recycler', 'waste_collector', 'organisation', 'business')`
  );

  const results = findMatches(material, candidates, 5);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const r of results) {
      await client.query(
        `INSERT INTO matches (material_id, matched_user_id, score, distance_km)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (material_id, matched_user_id) DO NOTHING`,
        [material.id, r.user.id, r.score, r.distanceKm]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  res.json({
    count: results.length,
    message: results.length ? `Found ${results.length} potential match(es).` : 'No suitable matches found yet.',
  });
});

export default router;
