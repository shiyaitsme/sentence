-- sentence · 摘抄本
-- Cloudflare D1 (SQLite) schema.
-- Run once against your D1 database, e.g.:
--   npx wrangler d1 execute sentence-db --remote --file=./d1/schema.sql

CREATE TABLE IF NOT EXISTS excerpts (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  source TEXT,
  author TEXT,
  tags TEXT NOT NULL DEFAULT '[]', -- JSON array of strings, e.g. ["韩国","诗"]
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_excerpts_created_at ON excerpts (created_at DESC);
