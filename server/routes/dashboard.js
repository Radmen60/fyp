import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../authMiddleware.js';
import { roleGroup } from '../constants.js';

const router = Router();

// Contact details only travel with a bid once it's been accepted — this
// mirrors the gating already done in routes/bids.js and routes/materials.js.
function hideBidderContactUnlessAccepted(rows) {
  return rows.map((b) => ({
    ...b,
    bidder_email: b.status === 'accepted' ? b.bidder_email : undefined,
    bidder_phone: b.status === 'accepted' ? b.bidder_phone : undefined,
    bidder_address: b.status === 'accepted' ? b.bidder_address : undefined,
  }));
}

function hideOwnerContactUnlessAccepted(rows) {
  return rows.map((b) => ({
    ...b,
    owner_email: b.status === 'accepted' ? b.owner_email : undefined,
    owner_phone: b.status === 'accepted' ? b.owner_phone : undefined,
  }));
}

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
    const bidsRaw = (await query(
      `SELECT bids.*, materials.title AS material_title, materials.id AS material_id, materials.estimated_value,
              bidderu.name AS bidder_name, bidderu.role AS bidder_role,
              bidderu.email AS bidder_email, bidderu.phone AS bidder_phone, bidderu.address AS bidder_address
       FROM bids
       JOIN materials ON bids.material_id = materials.id
       JOIN users bidderu ON bids.bidder_id = bidderu.id
       ORDER BY bids.created_at DESC LIMIT 8`
    )).rows;
    const userCount = (await query('SELECT COUNT(*)::int AS c FROM users')).rows[0].c;

    return res.json({
      role_group: 'admin',
      stats: { total_listed: totalListed, total_collected: totalCollected, value_diverted: valueDiverted },
      materials,
      bids: hideBidderContactUnlessAccepted(bidsRaw),
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

    const bidsRaw = (await query(
      `SELECT bids.*, materials.title AS material_title, materials.id AS material_id, materials.estimated_value,
              materials.status AS material_status,
              bidderu.name AS bidder_name, bidderu.role AS bidder_role,
              bidderu.email AS bidder_email, bidderu.phone AS bidder_phone, bidderu.address AS bidder_address
       FROM bids
       JOIN materials ON bids.material_id = materials.id
       JOIN users bidderu ON bids.bidder_id = bidderu.id
       WHERE materials.owner_id = $1
       ORDER BY bids.status = 'pending' DESC, bids.created_at DESC`,
      [req.user.id]
    )).rows;

    return res.json({
      role_group: 'producer',
      materials,
      bids_received: hideBidderContactUnlessAccepted(bidsRaw),
    });
  }

  // processor: recyclers, waste collectors, organisations, business
  const recommended = (await query(
    `SELECT matches.id AS match_id, matches.score, matches.distance_km,
            materials.id AS material_id, materials.title, materials.category, materials.quantity,
            materials.unit, materials.condition, materials.estimated_value, materials.address,
            materials.status AS material_status, materials.owner_id,
            owneru.name AS owner_name
     FROM matches
     JOIN materials ON matches.material_id = materials.id
     JOIN users owneru ON materials.owner_id = owneru.id
     WHERE matches.matched_user_id = $1 AND materials.status = 'available'
     ORDER BY matches.score DESC`,
    [req.user.id]
  )).rows;

  const myBidsRaw = (await query(
    `SELECT bids.*, materials.title AS material_title, materials.id AS material_id,
            materials.estimated_value, materials.status AS material_status, materials.address AS material_address,
            owneru.name AS owner_name, owneru.email AS owner_email, owneru.phone AS owner_phone
     FROM bids
     JOIN materials ON bids.material_id = materials.id
     JOIN users owneru ON materials.owner_id = owneru.id
     WHERE bids.bidder_id = $1
     ORDER BY bids.created_at DESC`,
    [req.user.id]
  )).rows;

  res.json({
    role_group: 'processor',
    recommended,
    my_bids: hideOwnerContactUnlessAccepted(myBidsRaw),
  });
});

export default router;
