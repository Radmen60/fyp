-- migrate_v2.sql — run this once against an EXISTING sweet_exchange database
-- that was created before the bidding system existed. New installs should
-- just use schema.sql directly and can ignore this file.

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(40);

ALTER TABLE matches DROP COLUMN IF EXISTS status;

CREATE TABLE IF NOT EXISTS bids (
  id                SERIAL PRIMARY KEY,
  material_id       INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  bidder_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount            NUMERIC NOT NULL,
  message           TEXT,
  status            VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at      TIMESTAMPTZ,
  UNIQUE (material_id, bidder_id)
);

CREATE INDEX IF NOT EXISTS idx_bids_material ON bids(material_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
