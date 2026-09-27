import { pool } from './db.js';
import { findMatches } from './matching.js';

// Score candidate processors for a material and store the results as
// recommendation rows. Called automatically right after a material is
// listed, and again whenever someone re-runs "Find matches".
export async function generateMatches(material, topN = 5) {
  const { rows: candidates } = await pool.query(
    `SELECT * FROM users WHERE role IN ('recycler', 'waste_collector', 'organisation', 'business')`
  );

  const results = findMatches(material, candidates, topN);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const r of results) {
      await client.query(
        `INSERT INTO matches (material_id, matched_user_id, score, distance_km)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (material_id, matched_user_id) DO UPDATE SET score = $3, distance_km = $4`,
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

  return results;
}
