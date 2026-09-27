import { Router } from 'express';
import { pool, query } from '../db.js';
import { requireAuth } from '../authMiddleware.js';

const router = Router();

// Bids the current user has placed, with seller contact info attached
// once accepted so they can arrange collection.
router.get('/mine', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT bids.*, materials.title AS material_title, materials.status AS material_status,
            materials.estimated_value, materials.address AS material_address,
            users.name AS owner_name, users.email AS owner_email,
            users.phone AS owner_phone
     FROM bids
     JOIN materials ON bids.material_id = materials.id
     JOIN users ON materials.owner_id = users.id
     WHERE bids.bidder_id = $1
     ORDER BY bids.created_at DESC`,
    [req.user.id]
  );

  const shaped = rows.map((b) => ({
    ...b,
    owner_email: b.status === 'accepted' ? b.owner_email : undefined,
    owner_phone: b.status === 'accepted' ? b.owner_phone : undefined,
  }));
  res.json(shaped);
});

// Bids received across everything the current user has listed (or, for an
// admin, every bid) — with the bidder's contact info attached once accepted.
router.get('/received', requireAuth, async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const { rows } = await query(
    `SELECT bids.*, materials.title AS material_title, materials.owner_id,
            users.name AS bidder_name, users.role AS bidder_role,
            users.email AS bidder_email, users.phone AS bidder_phone, users.address AS bidder_address
     FROM bids
     JOIN materials ON bids.material_id = materials.id
     JOIN users ON bids.bidder_id = users.id
     ${isAdmin ? '' : 'WHERE materials.owner_id = $1'}
     ORDER BY bids.created_at DESC`,
    isAdmin ? [] : [req.user.id]
  );

  const shaped = rows.map((b) => ({
    ...b,
    bidder_email: b.status === 'accepted' ? b.bidder_email : undefined,
    bidder_phone: b.status === 'accepted' ? b.bidder_phone : undefined,
    bidder_address: b.status === 'accepted' ? b.bidder_address : undefined,
  }));
  res.json(shaped);
});

async function loadBidWithMaterial(id) {
  const { rows } = await query(
    `SELECT bids.*, materials.owner_id AS material_owner_id, materials.status AS material_status
     FROM bids JOIN materials ON bids.material_id = materials.id
     WHERE bids.id = $1`,
    [id]
  );
  return rows[0];
}

// Owner (or admin) accepts a bid: that bid wins, every other pending bid on
// the same material is rejected, and the material becomes 'matched'.
router.post('/:id/accept', requireAuth, async (req, res) => {
  const bid = await loadBidWithMaterial(req.params.id);
  if (!bid) return res.status(404).json({ error: 'Bid not found.' });

  if (req.user.id !== bid.material_owner_id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only the person who listed this material can accept a bid.' });
  }
  if (bid.status !== 'pending') {
    return res.status(400).json({ error: `This bid is already ${bid.status}.` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`UPDATE bids SET status = 'accepted', responded_at = now() WHERE id = $1`, [bid.id]);
    await client.query(
      `UPDATE bids SET status = 'rejected', responded_at = now()
       WHERE material_id = $1 AND id != $2 AND status = 'pending'`,
      [bid.material_id, bid.id]
    );
    await client.query(`UPDATE materials SET status = 'matched' WHERE id = $1`, [bid.material_id]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  res.json({ message: 'Bid accepted — the buyer can now see your contact details to arrange collection.' });
});

router.post('/:id/reject', requireAuth, async (req, res) => {
  const bid = await loadBidWithMaterial(req.params.id);
  if (!bid) return res.status(404).json({ error: 'Bid not found.' });

  if (req.user.id !== bid.material_owner_id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only the person who listed this material can reject a bid.' });
  }
  if (bid.status !== 'pending') {
    return res.status(400).json({ error: `This bid is already ${bid.status}.` });
  }

  await query(`UPDATE bids SET status = 'rejected', responded_at = now() WHERE id = $1`, [bid.id]);
  res.json({ message: 'Bid rejected.' });
});

// Bidder withdraws their own still-pending bid.
router.post('/:id/withdraw', requireAuth, async (req, res) => {
  const { rows } = await query('SELECT * FROM bids WHERE id = $1', [req.params.id]);
  const bid = rows[0];
  if (!bid) return res.status(404).json({ error: 'Bid not found.' });
  if (bid.bidder_id !== req.user.id) return res.status(403).json({ error: "That's not your bid." });
  if (bid.status !== 'pending') return res.status(400).json({ error: `This bid is already ${bid.status}.` });

  await query(`UPDATE bids SET status = 'withdrawn', responded_at = now() WHERE id = $1`, [bid.id]);
  res.json({ message: 'Bid withdrawn.' });
});

// Mark a matched material as finally collected, closing out the deal.
router.post('/:id/complete', requireAuth, async (req, res) => {
  const bid = await loadBidWithMaterial(req.params.id);
  if (!bid) return res.status(404).json({ error: 'Bid not found.' });

  const isParticipant = req.user.id === bid.material_owner_id || req.user.id === bid.bidder_id;
  if (!isParticipant && req.user.role !== 'admin') {
    return res.status(403).json({ error: "You're not part of this deal." });
  }
  if (bid.status !== 'accepted') {
    return res.status(400).json({ error: 'Only an accepted bid can be marked collected.' });
  }

  await query(`UPDATE materials SET status = 'collected' WHERE id = $1`, [bid.material_id]);
  res.json({ message: 'Marked as collected — diverted from landfill!' });
});

export default router;
