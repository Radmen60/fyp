-- migrate_v3.sql — run this once against a database that was already
-- migrated with migrate_v2.sql (the bidding system). Adds a completion
-- timestamp so transaction history can show an accurate "collected on" date.
-- Safe to run more than once.

ALTER TABLE bids ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
