-- SWEET — Smart Waste Exchange and Eco-Trading
-- PostgreSQL schema (ported from the original SQLite prototype)

CREATE TABLE IF NOT EXISTS users (
  id                    SERIAL PRIMARY KEY,
  name                  VARCHAR(160) NOT NULL,
  role                  VARCHAR(30) NOT NULL,   -- household | business | waste_collector | recycler | organisation | admin
  email                 VARCHAR(160) UNIQUE NOT NULL,
  phone                 VARCHAR(40),
  password_hash         TEXT NOT NULL,
  reset_token           TEXT,
  reset_token_expires   TIMESTAMPTZ,
  address               TEXT,
  latitude              DOUBLE PRECISION NOT NULL,
  longitude             DOUBLE PRECISION NOT NULL,
  preferred_categories  TEXT NOT NULL DEFAULT '', -- comma-separated category slugs
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS materials (
  id                SERIAL PRIMARY KEY,
  owner_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title             VARCHAR(200) NOT NULL,
  description       TEXT,
  category          VARCHAR(30) NOT NULL,
  quantity          NUMERIC NOT NULL,
  unit              VARCHAR(20) NOT NULL,
  condition         VARCHAR(20) NOT NULL,
  estimated_value   NUMERIC NOT NULL DEFAULT 0,
  status            VARCHAR(20) NOT NULL DEFAULT 'available', -- available | matched | collected
  address           TEXT,
  latitude          DOUBLE PRECISION NOT NULL,
  longitude         DOUBLE PRECISION NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recommendation engine output: which processors a listed material was
-- surfaced to, and why (score/distance). Read-only — informational, drives
-- what shows up on a processor's dashboard. The actual accept/reject
-- decision now happens on bids, not here.
CREATE TABLE IF NOT EXISTS matches (
  id                SERIAL PRIMARY KEY,
  material_id       INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  matched_user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score             NUMERIC NOT NULL,
  distance_km       NUMERIC,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (material_id, matched_user_id)
);

-- A processor's offer on a listed material. The material's owner has sole
-- authority to accept or reject; accepting a bid rejects every other
-- pending bid on that material and marks it matched.
CREATE TABLE IF NOT EXISTS bids (
  id                SERIAL PRIMARY KEY,
  material_id       INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  bidder_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount            NUMERIC NOT NULL,
  message           TEXT,
  status            VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | accepted | rejected | withdrawn
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at      TIMESTAMPTZ,
  UNIQUE (material_id, bidder_id)
);

CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status);
CREATE INDEX IF NOT EXISTS idx_materials_owner ON materials(owner_id);
CREATE INDEX IF NOT EXISTS idx_matches_material ON matches(material_id);
CREATE INDEX IF NOT EXISTS idx_matches_user ON matches(matched_user_id);
CREATE INDEX IF NOT EXISTS idx_bids_material ON bids(material_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
