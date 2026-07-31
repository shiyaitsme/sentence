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

**Frontend data flow**: `src/hooks/useExcerpts.js` is the only thing that calls the API; it owns the `excerpts` list state and exposes `addExcerpt`/`updateExcerpt`/`deleteExcerpt`/`refetch`. `src/App.jsx` owns UI-only state (search text, selected tags, which of the three views is active, which excerpt is being edited/viewed) and derives `tagCounts` and the filtered list with `useMemo` — filtering/search is entirely client-side over the full fetched list, there's no server-side query filtering. There's no router: `App.jsx` holds a `view` string (`'home' | 'list' | 'record'`) and renders one page component accordingly; `NavBar` just calls back into that state setter.

**D1 schema** (`d1/schema.sql`): single `excerpts` table, `tags` stored as a JSON text column (see above), indexed on `created_at`. Local dev D1 state lives in `.wrangler/` (gitignored) — `npm run db:local:init` seeds it from the same schema file used in production.

**Deployment**: Cloudflare Pages project name is `sentence`, connected to this GitHub repo with automatic deploys. The D1 binding (`DB` → `sentence-db`) is configured on the Pages project itself (dashboard: Settings → Functions → D1 database bindings), not something `wrangler.toml` pushes on deploy — `wrangler.toml` is only consulted for local `wrangler` commands (`dev:full`, `db:local:init`). If the production/preview D1 binding is ever lost or needs recreating, `wrangler.toml`'s `database_id` is the value to re-bind with.

## App structure: three views, no router

The app has three views switched by local state in `App.jsx` (`view: 'home' | 'list' | 'record'`), not a router:

- **`HomePage`** (`'home'`, the default) — full-bleed 600px-tall hero band using `public/landing_page.png` as a cover photo with a dark gradient overlay, a centered headline + two CTAs, and a "今日一句" footer strip showing the most recent excerpt plus live counts (excerpts / distinct sources / distinct tags).
- **`ExcerptListPage`** (`'list'`) — "摘抄集": title + "+ 新建摘抄", a filter-pill row (dynamic, derived from `tagCounts`) plus a search box, and a CSS `columns`-based waterfall of `ExcerptCard`s. Clicking a card opens `ExcerptDetail` as a modal (view/edit/delete).
- **`RecordPage`** (`'record'`) — "记录": the create/edit form (content, source, note, a removable tag-chip editor with a "+ 添加标签" input, and a decorative image dropzone that only previews client-side via `FileReader` — there's no image upload/storage in the backend, so nothing here is persisted to D1).

`NavBar` (used by all three, with `variant="overlay"` on the photo and `variant="plain"` on the cream background) is the only navigation affordance; `App.jsx`'s `handleNavigate` clears any in-progress edit whenever you navigate to `'record'` from the nav so it opens a blank form, while `startEdit` (called from card/detail edit buttons) sets the target excerpt first.

## Visual design system

The UI follows a warm ink-and-blush palette (not monochrome): deep navy for text/buttons, a blush/terracotta accent for tags and highlights, cream/ivory cards on a warm gray page background. The hero photo (`public/landing_page.png`) is the only place a busy image sits directly behind content; the list and record pages are flat-colored.

- `src/index.css` is the single stylesheet (no CSS modules/CSS-in-JS). Color tokens are CSS custom properties in `:root`: `--navy` (#2a3b4d, primary text/buttons), `--navy-mid`, `--slate` (#8fa7bb, secondary text), `--blush` (#eab9b3, accent/selected state), `--terracotta` (#b3776f, quote marks/danger), `--card` (#faf5ee, opaque card fill), `--bg` (#f3ede6, page background), `--cream` (#f6ece2, text-on-photo). Retheme by changing these, not per-rule.
- Fonts, loaded via Google Fonts `@import` at the top of `index.css`: `Bodoni Moda` for Latin display type (logo, stat numbers), `Noto Serif SC` for Chinese headings and excerpt body text, `Noto Sans SC` for UI copy, `Oswald` for uppercase nav/button/eyebrow labels, `Petit Formal Script` for the one handwritten accent line on the hero. Font stacks put the Latin display font first and `'Noto Serif SC'`/`'Noto Sans SC'` as fallback so Chinese characters in a Bodoni Moda/Oswald-labeled string don't fall back to a mismatched system font.
- No picture-frame/corner-ornament chrome anymore — cards (`.wf-card`, `.modal-card`) are plain rounded rectangles (`border-radius: 14–16px`) with a soft shadow, no border.
- Reusable pill/chip patterns: `.filter-pill` (list page tag filters, `.active` = blush fill), `.card-tag` (waterfall card footer category tag, `--accent`/`--neutral` color variants picked deterministically per tag via a hash in `ExcerptCard.jsx`), `.tag-chip` (record page's removable tag editor). Don't reuse one for another context — the selected/unselected color rules differ slightly per spec.
- The hero band (`.hero-page`/`.hero-inner`) is the only place `nav-row--overlay` (light text, text-shadow, translucent borders) is used; every other view uses `nav-row--plain` and normal dark-on-light text since their background is the flat `--bg` cream, not a photo.
