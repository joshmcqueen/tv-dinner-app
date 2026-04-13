# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start both server and client concurrently
pnpm start

# Start individually
pnpm server    # Express API on :3001
pnpm client    # Vite dev server on :5173

# Build client for production
cd client && pnpm build
```

There are no test or lint scripts configured.

## Architecture

pnpm monorepo with two packages: `server/` (Express + SQLite) and `client/` (React + Vite).

**Backend** (`server/`):
- `index.js` — Express entry point, CORS, static file serving for `/uploads`
- `db.js` — SQLite initialization using Node's built-in `DatabaseSync`; defines schema on startup
- `routes/meals.js` — All REST endpoints under `/api/meals`

**Frontend** (`client/src/`):
- `App.jsx` — React Router setup (4 routes)
- `api.js` — Thin fetch wrapper; all API calls go through here
- `components/` — Six components: `MealList`, `MealCard`, `MealDetail`, `MealForm`, `StarRating`, `BottomNav`

**Data model** (SQLite, stored in `server/data/tvdinner.db`):
- `meals` — Active meal preps with macros, rating, servings, photo path
- `meal_history` — Snapshot of old meal data whenever a meal is edited (stored as JSON blob)
- `consumption_log` — Audit trail written when servings are decremented via `PATCH /:id/consume`

**Image pipeline**: Multer receives uploads → Sharp rotates (EXIF-aware), resizes to max 1200×1200, encodes as JPEG at quality 85 → saved to `server/uploads/` with UUID filename → path stored in DB.

**Vite proxy**: `/api` and `/uploads` requests from the dev client are proxied to `http://localhost:3001`, so no CORS issues in development.

**UI**: Dark theme with orange accent (`#f97316`), mobile-first layout, fixed bottom nav (`BottomNav.jsx`), safe-area insets for notched devices.
