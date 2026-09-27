import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../authMiddleware.js';
import { roleGroup } from '../constants.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const group = roleGroup(req.user.role);

  if (group === 'admin') {
    const totalListed = (await query('SELECT COUNT(*)::int AS c FROM materials')).rows[0].c;
    const totalCollected = (await query(`SELECT COUNT(*)::int AS c FROM materials WHERE status = 'collected'`)).rows[0].c;
    const valueDiverted = (await query(
      `SELECT COALESCE(SUM(estimated_value), 0)::float AS v FROM materials WHERE status IN ('matched', 'collected')`
    )).rows[0].v;
    const materials = (await query(
      `SELECT materials.*, users.name AS owner_name FROM materials
       JOIN users ON materials.owner_id = users.id ORDER BY materials.created_at DESC LIMIT 8`
    )).rows;
    const matches = (await query(
      `SELECT matches.*, users.name AS matched_user_name, materials.title AS material_title
       FROM matches JOIN users ON matches.matched_user_id = users.id
       JOIN materials ON matches.material_id = materials.id
       ORDER BY matches.created_at DESC LIMIT 8`
    )).rows;
    const userCount = (await query('SELECT COUNT(*)::int AS c FROM users')).rows[0].c;

    return res.json({
      role_group: 'admin',
      stats: { total_listed: totalListed, total_collected: totalCollected, value_diverted: valueDiverted },
      materials,
      matches,
      user_count: userCount,
    });
  }

  if (group === 'producer') {
    const materials = (await query(
      `SELECT materials.*, users.name AS owner_name FROM materials
       JOIN users ON materials.owner_id = users.id
       WHERE materials.owner_id = $1 ORDER BY materials.created_at DESC`,
      [req.user.id]
    )).rows;
    const matches = (await query(
      `SELECT matches.*, users.name AS matched_user_name, materials.title AS material_title, materials.id AS material_id
       FROM matches JOIN users ON matches.matched_user_id = users.id
       JOIN materials ON matches.material_id = materials.id
       WHERE matches.matched_user_id = $1 OR materials.owner_id = $1
       ORDER BY matches.created_at DESC`,
      [req.user.id]
    )).rows;
    return res.json({ role_group: 'producer', materials, matches });
  }

  // processor: recyclers, waste collectors, organisations
  const materials = (await query(
    `SELECT materials.*, users.name AS owner_name FROM materials
     JOIN users ON materials.owner_id = users.id
     WHERE materials.status = 'available' ORDER BY materials.created_at DESC`
  )).rows;
  const matches = (await query(
    `SELECT matches.*, users.name AS matched_user_name, materials.title AS material_title, materials.id AS material_id
     FROM matches JOIN users ON matches.matched_user_id = users.id
     JOIN materials ON matches.material_id = materials.id
     WHERE matches.matched_user_id = $1 OR materials.owner_id = $1
     ORDER BY matches.created_at DESC`,
    [req.user.id]
  )).rows;
  res.json({ role_group: 'processor', materials, matches });
});

export default router;
