import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../authMiddleware.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const { rows } = await query(
    `SELECT matches.*, users.name AS matched_user_name,
            materials.title AS material_title, materials.id AS material_id,
            materials.owner_id AS material_owner_id, materials.estimated_value
     FROM matches
     JOIN users ON matches.matched_user_id = users.id
     JOIN materials ON matches.material_id = materials.id
     ${isAdmin ? '' : 'WHERE matches.matched_user_id = $1 OR materials.owner_id = $1'}
     ORDER BY matches.created_at DESC`,
    isAdmin ? [] : [req.user.id]
  );
  res.json(rows);
});

router.post('/:id/:action', requireAuth, async (req, res) => {
  const { id, action } = req.params;
  const { rows } = await query('SELECT * FROM matches WHERE id = $1', [id]);
  if (!rows.length) return res.status(404).json({ error: 'Match not found.' });
  const match = rows[0];

  const { rows: materialRows } = await query('SELECT * FROM materials WHERE id = $1', [match.material_id]);
  const material = materialRows[0];

  const isParticipant = req.user.id === match.matched_user_id || req.user.id === material.owner_id;
  if (!isParticipant && req.user.role !== 'admin') {
    return res.status(403).json({ error: "You're not part of this match." });
  }

  if (action === 'accept') {
    await query('UPDATE matches SET status = $1 WHERE id = $2', ['accepted', id]);
    await query('UPDATE materials SET status = $1 WHERE id = $2', ['matched', material.id]);
    return res.json({ message: 'Match accepted — arrange collection with the matched party.' });
  }
  if (action === 'reject') {
    await query('UPDATE matches SET status = $1 WHERE id = $2', ['rejected', id]);
    return res.json({ message: 'Match rejected.' });
  }
  if (action === 'complete') {
    await query('UPDATE matches SET status = $1 WHERE id = $2', ['completed', id]);
    await query('UPDATE materials SET status = $1 WHERE id = $2', ['collected', material.id]);
    return res.json({ message: 'Marked as collected — diverted from landfill!' });
  }
  return res.status(400).json({ error: 'Unknown action.' });
});

export default router;
