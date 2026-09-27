// seed.js — inserts the same demo users/materials as the original Python
// prototype (run once against an empty database: `npm run db:seed`).
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from './db.js';
import { estimateValue } from './matching.js';

dotenv.config();

const DEMO_PASSWORD = 'password123';

const USERS = [
  ['Tendai Moyo', 'household', 'tendai@example.com', '12 Fort Street, Bulawayo', -20.1520, 28.5820, ''],
  ["Rudo's Grocers", 'business', 'rudo@example.com', '45 Jason Moyo Ave, Bulawayo', -20.1480, 28.5870, ''],
  ['GreenLoop Recyclers', 'recycler', 'info@greenloop.example', 'Belmont Industrial Area, Bulawayo', -20.1650, 28.5600, 'plastic,metal,paper'],
  ['CircuitBack E-Waste', 'recycler', 'hello@circuitback.example', '88 Robert Mugabe Way, Bulawayo', -20.1550, 28.5830, 'electronics'],
  ['Bulawayo Waste Collectors Co-op', 'waste_collector', 'ops@hwcc.example', 'Donnington Industrial Area, Bulawayo', -20.1400, 28.6000, 'plastic,metal,wood,furniture,paper,textile,organic,other'],
  ['Second Chance Furniture', 'organisation', 'donate@secondchance.example', '23 Herbert Chitepo St, Bulawayo', -20.1600, 28.5750, 'furniture,wood'],
  ['Chipo Sibanda', 'household', 'chipo@example.com', '7 Hillside Rd, Bulawayo', -20.1750, 28.6100, ''],
  ['ThreadCycle Textiles', 'recycler', 'hi@threadcycle.example', 'Famona, Bulawayo', -20.1350, 28.5700, 'textile'],
  ['System Admin', 'admin', 'admin@example.com', 'Bulawayo CBD', -20.1500, 28.5833, ''],
];

// [ownerIndex (1-based, matches USERS order), title, description, category, quantity, unit, condition, address, lat, lng]
const MATERIALS = [
  [1, 'Stack of flattened cardboard boxes', 'About 2 weeks of packaging boxes, dry and clean.', 'paper', 15, 'kg', 'good', '12 Fort Street, Bulawayo', -20.1520, 28.5820],
  [2, 'Broken bar fridge - working compressor', 'Front panel cracked, compressor still runs.', 'electronics', 1, 'unit', 'fair', '45 Jason Moyo Ave, Bulawayo', -20.1480, 28.5870],
  [1, 'Old wooden pallets x6', 'Untreated pine pallets, good condition.', 'wood', 6, 'unit', 'good', '12 Fort Street, Bulawayo', -20.1520, 28.5820],
  [7, 'Bag of mixed plastic bottles', 'PET bottles rinsed, mixed colours.', 'plastic', 8, 'kg', 'good', '7 Hillside Rd, Bulawayo', -20.1750, 28.6100],
  [2, 'Offcut aluminium sheeting', 'Leftover from shopfitting, various sizes.', 'metal', 40, 'kg', 'new', '45 Jason Moyo Ave, Bulawayo', -20.1480, 28.5870],
  [7, 'Worn-out cotton bedsheets', 'Clean, some tears, good rag/fibre material.', 'textile', 3, 'kg', 'poor', '7 Hillside Rd, Bulawayo', -20.1750, 28.6100],
  [6, 'Two wooden dining chairs', 'Sturdy, needs re-varnishing.', 'furniture', 2, 'unit', 'fair', '23 Herbert Chitepo St, Bulawayo', -20.1600, 28.5750],
];

async function seed() {
  const client = await pool.connect();
  try {
    const { rows: existing } = await client.query('SELECT COUNT(*)::int AS c FROM users');
    if (existing[0].c > 0) {
      console.log('Users already exist — skipping seed. Truncate tables first if you want to reseed.');
      return;
    }

    await client.query('BEGIN');
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    const userIds = [];
    for (const [name, role, email, address, lat, lng, categories] of USERS) {
      const { rows } = await client.query(
        `INSERT INTO users (name, role, email, password_hash, address, latitude, longitude, preferred_categories)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [name, role, email, passwordHash, address, lat, lng, categories]
      );
      userIds.push(rows[0].id);
    }

    for (const [ownerIdx, title, description, category, quantity, unit, condition, address, lat, lng] of MATERIALS) {
      const value = estimateValue(category, quantity, condition);
      await client.query(
        `INSERT INTO materials (owner_id, title, description, category, quantity, unit, condition, estimated_value, address, latitude, longitude)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [userIds[ownerIdx - 1], title, description, category, quantity, unit, condition, value, address, lat, lng]
      );
    }

    await client.query('COMMIT');
    console.log(`Seeded ${USERS.length} users and ${MATERIALS.length} materials. Every account's password is "${DEMO_PASSWORD}".`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
