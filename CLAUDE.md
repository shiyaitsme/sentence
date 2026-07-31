# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`sentence · 摘抄本` — a personal excerpt/commonplace-book app. Record text passages with source, free-form tags, and personal notes; search and filter by tag. Frontend is Vite + React, data lives in Cloudflare D1, deployed as a single Cloudflare Pages project (static site + API in one).

## Commands

```bash
npm install
npm run dev:full          # full stack: Pages Functions + local D1, via wrangler — use this, not `npm run dev`
npm run db:local:init     # one-time: create local D1 tables from d1/schema.sql
npm run build             # vite build → dist/
npm run lint              # oxlint
```

`npm run dev` (plain Vite) only serves the frontend — `/api/*` calls will fail because the Functions layer and D1 binding don't exist outside wrangler. Always use `npm run dev:full` when working on anything that touches data.

There is no test suite in this repo.

## Architecture

**Two-layer app, one deployment.** The React app never talks to a database client directly (unlike a typical Supabase/Firebase setup) — it calls a small REST API over `fetch`, and that API is Cloudflare Pages Functions backed by D1 (SQLite). Both the static frontend and the Functions live in the same Cloudflare Pages project and deploy together on every push.

```
src/hooks/useExcerpts.js  --fetch-->  functions/api/excerpts/index.js   (GET list, POST create)
                                      functions/api/excerpts/[id].js    (PUT update, DELETE)
                                            |
                                            v
                                      env.DB  (D1 binding, see wrangler.toml)
```

- `functions/_utils.js` holds the shared bits both route files import: `parseTags` (splits a free-text tag string on commas/spaces into a deduped array), `toExcerptRow`/`fromDbRow` (convert between the API's `{tags: string[]}` shape and D1's `tags` column, which is a JSON-encoded string — D1/SQLite has no array type), and `jsonResponse`.
- Route files are Cloudflare Pages Functions file-based routing: `functions/api/excerpts/index.js` → `/api/excerpts`, `functions/api/excerpts/[id].js` → `/api/excerpts/:id`. Handlers are named exports per HTTP verb (`onRequestGet`, `onRequestPost`, `onRequestPut`, `onRequestDelete`), each receiving `{ request, env, params }`. `env.DB` is the D1 binding declared in `wrangler.toml` (binding name must stay `DB` — the Functions code and the Cloudflare Pages dashboard binding both hard-code that name).
- IDs are generated with `crypto.randomUUID()` inside the POST handler (not by D1/SQLite itself). Timestamps are ISO strings generated in JS, not SQLite's `CURRENT_TIMESTAMP`.
- There is no auth layer. Anyone who can reach the deployed URL can hit the CRUD endpoints — acceptable for a single-user notebook, called out explicitly in the README. If auth is ever added, it needs to live in the Functions layer (e.g. a `functions/_middleware.js`), since that's the only place requests are intercepted server-side.

**Frontend data flow**: `src/hooks/useExcerpts.js` is the only thing that calls the API; it owns the `excerpts` list state and exposes `addExcerpt`/`updateExcerpt`/`deleteExcerpt`/`refetch`. `src/App.jsx` owns UI-only state (search text, selected tags, which modal is open) and derives `tagCounts` and the filtered list with `useMemo` — filtering/search is entirely client-side over the full fetched list, there's no server-side query filtering.

**D1 schema** (`d1/schema.sql`): single `excerpts` table, `tags` stored as a JSON text column (see above), indexed on `created_at`. Local dev D1 state lives in `.wrangler/` (gitignored) — `npm run db:local:init` seeds it from the same schema file used in production.

**Deployment**: Cloudflare Pages project name is `sentence`, connected to this GitHub repo with automatic deploys. The D1 binding (`DB` → `sentence-db`) is configured on the Pages project itself (dashboard: Settings → Functions → D1 database bindings), not something `wrangler.toml` pushes on deploy — `wrangler.toml` is only consulted for local `wrangler` commands (`dev:full`, `db:local:init`). If the production/preview D1 binding is ever lost or needs recreating, `wrangler.toml`'s `database_id` is the value to re-bind with.

## Visual design system

The whole UI is intentionally monochrome (black/white/gray only — no color hue anywhere) with a Renaissance/Baroque religious-art feel: serif display type, "picture frame" borders with corner ornaments instead of flat rounded cards, and a full-page fixed background photo (`public/landing_page.png`, kept in its original color, dimmed via an overlay — this is the one deliberate exception to monochrome, and it's a background photo, not a UI-chrome color).

- `src/index.css` is the single stylesheet (no CSS modules/CSS-in-JS). Color tokens are CSS custom properties in `:root` (`--ivory`, `--umber`, `--gold`, `--ink`, `--rose`, `--marble`, plus soft/rgba variants) — despite the warm names, they currently all resolve to black/white/gray. Change values there, not per-rule, to retheme.
- Headings use `Playfair Display`/`Cormorant Garamond` (italic), body text uses `EB Garamond` — loaded via Google Fonts `@import` at the top of `index.css`. Don't introduce a sans-serif font.
- Reusable decorative primitives: `.gilded-rule` (divider with a `❦` glyph), `.teardrop`, `.gold-rays` (conic-gradient sunburst used in the empty state), and the repeated `.corner` (tl/tr/bl/br) span pattern used by `.frame-card` and `.modal-card` to fake a picture-frame border — reuse these rather than inventing new card chrome.
- Because the page background is a fixed photo (`body::before`/`body::after`), any text or control that sits directly on the page (not inside an opaque card like `.frame-card`/`.modal-card`) needs light/white coloring with a text-shadow for contrast — see `.app-header`, `.tag-filter-bar .label`, `.empty-state`, `.loading-text`, `.results-count` for the pattern. Elements inside opaque cards keep normal dark-on-light text.
