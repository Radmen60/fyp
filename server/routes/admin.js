import { Router } from 'express';
import { query } from '../db.js';
import { requireRoleGroup } from '../authMiddleware.js';

const router = Router();

router.get('/users', requireRoleGroup('admin'), async (req, res) => {
  const { rows } = await query('SELECT id, name, role, email, phone, address, created_at FROM users ORDER BY created_at DESC');
  res.json(rows);
});

router.get('/stats', requireRoleGroup('admin'), async (req, res) => {
  const totalListed = (await query('SELECT COUNT(*)::int AS c FROM materials')).rows[0].c;
  const totalCollected = (await query(`SELECT COUNT(*)::int AS c FROM materials WHERE status = 'collected'`)).rows[0].c;
  const valueDiverted = (await query(
    `SELECT COALESCE(SUM(estimated_value), 0)::float AS v FROM materials WHERE status IN ('matched', 'collected')`
  )).rows[0].v;
  const byCategory = (await query(
    `SELECT category, COUNT(*)::int AS count, COALESCE(SUM(estimated_value),0)::float AS value
     FROM materials GROUP BY category ORDER BY count DESC`
  )).rows;
  const byStatus = (await query(`SELECT status, COUNT(*)::int AS count FROM materials GROUP BY status`)).rows;

  res.json({
    total_listed: totalListed,
    total_collected: totalCollected,
    value_diverted: valueDiverted,
    by_category: byCategory,
    by_status: byStatus,
  });
});

export default router;
