import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../authMiddleware.js';
import { resolveLocation } from '../locationHelper.js';
import { GeocodingError } from '../geocoding.js';
import { estimateValue } from '../matching.js';
import { generateMatches } from '../matchGeneration.js';
import { CATEGORIES, CONDITIONS, UNITS, roleGroup } from '../constants.js';

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
  const isOwner = req.user.id === material.owner_id;
  const isAdmin = req.user.role === 'admin';

  // Recommendation list stays private to the owner/admin — it's who we
  // suggested this material to, not something other bidders should see.
  let matches = [];
  if (isOwner || isAdmin) {
    const { rows: matchRows } = await query(
      `SELECT matches.*, users.name AS matched_user_name, users.role AS matched_user_role
       FROM matches JOIN users ON matches.matched_user_id = users.id
       WHERE matches.material_id = $1
       ORDER BY matches.score DESC`,
      [material.id]
    );
    matches = matchRows;
  }

  let bids = [];
  let myBid = null;
  let sellerContact = null;

  if (isOwner || isAdmin) {
    const { rows: bidRows } = await query(
      `SELECT bids.*, users.name AS bidder_name, users.role AS bidder_role,
              users.email AS bidder_email, users.phone AS bidder_phone, users.address AS bidder_address
       FROM bids JOIN users ON bids.bidder_id = users.id
       WHERE bids.material_id = $1
       ORDER BY bids.status = 'accepted' DESC, bids.amount DESC, bids.created_at ASC`,
      [material.id]
    );
    // Only reveal the bidder's contact details once their bid is accepted —
    // while a bid is pending/rejected the owner just sees name + role + offer.
    bids = bidRows.map((b) => ({
      ...b,
      bidder_email: b.status === 'accepted' ? b.bidder_email : undefined,
      bidder_phone: b.status === 'accepted' ? b.bidder_phone : undefined,
      bidder_address: b.status === 'accepted' ? b.bidder_address : undefined,
    }));
  } else {
    const { rows: myBidRows } = await query(
      `SELECT * FROM bids WHERE material_id = $1 AND bidder_id = $2`,
      [material.id, req.user.id]
    );
    myBid = myBidRows[0] || null;
    if (myBid && myBid.status === 'accepted') {
      const { rows: ownerRows } = await query('SELECT email, phone FROM users WHERE id = $1', [material.owner_id]);
      sellerContact = {
        name: material.owner_name,
        email: ownerRows[0]?.email,
        phone: ownerRows[0]?.phone,
        address: material.address,
      };
    }
  }

  const canBid = !isOwner && !isAdmin && roleGroup(req.user.role) !== 'household' && material.status === 'available';

  res.json({ material, matches, bids, my_bid: myBid, seller_contact: sellerContact, is_owner: isOwner, is_admin: isAdmin, can_bid: canBid });
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
  const material = rows[0];

  // Surface this listing on the relevant processors' dashboards right away.
  const matchResults = await generateMatches(material);

  res.status(201).json({
    material,
    message: `Listed! Estimated value: $${estimatedValue.toFixed(2)}${matchResults.length ? ` — matched with ${matchResults.length} potential buyer(s).` : ''}`,
  });
});

router.post('/:id/find-matches', requireAuth, async (req, res) => {
  const { rows } = await query('SELECT * FROM materials WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Material not found.' });
  const material = rows[0];

  if (req.user.id !== material.owner_id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only the person who listed this material can search for matches.' });
  }

  const results = await generateMatches(material);
  res.json({
    count: results.length,
    message: results.length ? `Found ${results.length} potential match(es).` : 'No suitable matches found yet.',
  });
});

// ---------------------------------------------------------------------------
// Bids
// ---------------------------------------------------------------------------

// Place or update your own (still-pending) bid on a material.
router.post('/:id/bids', requireAuth, async (req, res) => {
  const { rows } = await query('SELECT * FROM materials WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Material not found.' });
  const material = rows[0];

  if (req.user.id === material.owner_id) {
    return res.status(403).json({ error: "You can't bid on your own listing." });
  }
  if (material.status !== 'available') {
    return res.status(400).json({ error: 'This material is no longer available.' });
  }

  const amount = parseFloat(req.body.amount);
  if (Number.isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Enter a valid bid amount.' });
  }
  const message = (req.body.message || '').trim();

  const { rows: existing } = await query(
    'SELECT * FROM bids WHERE material_id = $1 AND bidder_id = $2',
    [material.id, req.user.id]
  );
  if (existing.length && existing[0].status !== 'pending') {
    return res.status(400).json({ error: `Your previous bid was ${existing[0].status} and can't be changed.` });
  }

  const { rows: result } = await query(
    `INSERT INTO bids (material_id, bidder_id, amount, message, status)
     VALUES ($1,$2,$3,$4,'pending')
     ON CONFLICT (material_id, bidder_id)
     DO UPDATE SET amount = $3, message = $4, created_at = now()
     RETURNING *`,
    [material.id, req.user.id, amount, message]
  );

  res.status(201).json({ bid: result[0], message: 'Bid submitted — the seller will review it.' });
});

export default router;
