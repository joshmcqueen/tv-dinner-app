# TV Dinners

A mobile-first meal prep tracker. Log batches of meals, track macros and servings, rate what you've made, and mark portions as eaten.

## Stack

- **Frontend**: React 18 + Vite (dark theme, orange accent)
- **Backend**: Express + SQLite (Node.js built-in `DatabaseSync`)
- **Image processing**: Sharp (EXIF-aware rotation, resized to 1200×1200 JPEG)
- **Monorepo**: pnpm workspaces (`server/`, `client/`)

## Development

```bash
pnpm install
pnpm start          # runs both server (:3001) and client (:5173) concurrently
```

Or individually:

```bash
pnpm server         # Express API on :3001
pnpm client         # Vite dev server on :5173 (proxies /api and /uploads to server)
```

## Production (Docker)

Build and run with Docker:

```bash
docker build -t tv-dinner .
docker run -p 3000:3000 \
  -v tvdinner-db:/app/server/data \
  -v tvdinner-uploads:/app/server/uploads \
  tv-dinner
```

Visit `http://localhost:3000`.

Two volumes are required for persistence across container restarts:

| Volume | Container path | Contents |
|--------|---------------|----------|
| `tvdinner-db` | `/app/server/data` | SQLite database |
| `tvdinner-uploads` | `/app/server/uploads` | User photo uploads |

Both are created automatically on first boot if empty.

## Deploying on Dokploy

1. Point Dokploy at this repo — it will detect the `Dockerfile` automatically.
2. Set port to **3000**.
3. Add the two persistent volumes above.
4. Deploy.

## Data Model

| Table | Purpose |
|-------|---------|
| `meals` | Active meal preps (name, macros, servings, photo, rating) |
| `meal_history` | Snapshot saved on each edit |
| `consumption_log` | Audit trail when servings are decremented |
