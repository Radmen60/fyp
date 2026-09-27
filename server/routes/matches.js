import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../authMiddleware.js';

const router = Router();

// Read-only recommendation feed: which materials the matching algorithm has
// surfaced to this processor, or who a producer's listings were surfaced to.
// Placing/accepting/rejecting bids happens via /api/bids and
// /api/materials/:id/bids — this endpoint is purely informational.
router.get('/', requireAuth, async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const { rows } = await query(
    `SELECT matches.*, users.name AS matched_user_name, users.role AS matched_user_role,
            materials.title AS material_title, materials.id AS material_id,
            materials.owner_id AS material_owner_id, materials.estimated_value,
            materials.status AS material_status
     FROM matches
     JOIN users ON matches.matched_user_id = users.id
     JOIN materials ON matches.material_id = materials.id
     ${isAdmin ? '' : 'WHERE matches.matched_user_id = $1 OR materials.owner_id = $1'}
     ORDER BY matches.created_at DESC`,
    isAdmin ? [] : [req.user.id]
  );
  res.json(rows);
});

export default router;
