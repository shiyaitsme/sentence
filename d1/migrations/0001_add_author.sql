-- Adds the "author" column for excerpts recorded before this field existed.
-- Only needed against a database that already has the excerpts table —
-- a fresh database created from d1/schema.sql already includes this column.
--   Local:  npm run db:local:migrate
--   Remote: paste this file's contents into the D1 dashboard Console, or run
--           npx wrangler d1 execute sentence-db --remote --file=./d1/migrations/0001_add_author.sql

ALTER TABLE excerpts ADD COLUMN author TEXT;
