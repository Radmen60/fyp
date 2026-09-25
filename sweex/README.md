# SWEET Exchange — Smart Waste Exchange and Eco-Trading

A materials marketplace: producers (households, businesses) list spare
materials, processors (recyclers, waste collectors, organisations) get
matched to them by category fit + distance, and admins oversee the whole
exchange. This is a React (Vite) + Express + PostgreSQL rebuild of the
original Flask/SQLite prototype, kept at functional parity — same matching
algorithm, same value-estimation table, same geocoding provider.

## Structure

```
sweex/
├─ src/                    # React frontend
│  ├─ pages/                # one file per route
│  ├─ components/           # Navbar, MaterialCard, MatchRow, LocationField, LocationMap, RouteGuards
│  └─ context/AuthContext.jsx
├─ server/                 # Express API + PostgreSQL access
│  ├─ schema.sql            # table definitions
│  ├─ seed.js                # demo users + materials (mirrors the Flask seed data)
│  ├─ matching.js            # value estimation + haversine matching (ported from matching.py)
│  ├─ geocoding.js           # OpenStreetMap Nominatim (ported from geocoding.py)
│  ├─ authMiddleware.js, locationHelper.js, constants.js
│  ├─ index.js               # server entry point
│  └─ routes/                # auth.js, materials.js, matches.js, admin.js, dashboard.js, geocode.js
├─ vite.config.js          # dev proxy: /api → localhost:4000
└─ package.json            # frontend deps (react-router-dom, leaflet)
```

## 1. Set up PostgreSQL

```bash
createdb sweet_exchange
```

## 2. Backend

```bash
cd server
npm install
cp .env.example .env          # edit with your DB credentials
psql "$DATABASE_URL" -f schema.sql   # or: npm run db:init
npm run db:seed                # optional demo data
npm run dev                    # starts API on http://localhost:4000
```

If you're using local Postgres with individual PGHOST/PGUSER/etc. fields
instead of DATABASE_URL, run the schema directly:

```bash
psql -U postgres -d sweet_exchange -f schema.sql
```

`npm run db:seed` works either way — it reads the same env vars via `db.js`.

## 3. Frontend

In a separate terminal, from the project root:

```bash
npm install
npm run dev                    # starts Vite on http://localhost:5173
```

Vite proxies `/api/*` to the Express server, so open
`http://localhost:5173` and the app will load live data.

## Demo accounts

Every seeded account's password is `password123`:

| Email | Role |
|---|---|
| tendai@example.com | household (producer) |
| rudo@example.com | business (producer) |
| info@greenloop.example | recycler (processor) |
| chipo@example.com | household (producer) |
| admin@example.com | admin |

## How the pieces map to the original Flask app

| Flask | This project |
|---|---|
| `db.py` schema | `server/schema.sql` (SQLite → PostgreSQL) |
| `matching.py` | `server/matching.js` — identical formulas (60% category fit, 40% haversine distance capped at 50km; price-per-unit × condition multiplier) |
| `geocoding.py` | `server/geocoding.js` — same Nominatim endpoints |
| Flask sessions (signed cookie) | `express-session` (server-side session, httpOnly cookie) |
| `werkzeug.security` password hashing | `bcryptjs` |
| Jinja2 templates | React pages under `src/pages/` |
| `render_template("dashboard_*.html")` | `GET /api/dashboard` returns a role-specific bundle; `Dashboard.jsx` renders it |
| Forgot/reset password (no email, link shown on screen) | Same behaviour: `POST /api/auth/forgot-password` returns the reset token directly in the response |
| Leaflet map on material detail | `src/components/LocationMap.jsx` (plain Leaflet, no React wrapper library) |

## Permission rules (enforced server-side, same as the original)

- Must be logged in to see anything past the landing page.
- Only the material's owner or an admin can trigger "Find matches".
- Only the two match participants (material owner + matched user), or an
  admin, can accept/reject/complete a match.
- Only admins can see `/users` and `/stats`.

## Notes

- Sessions use the default in-memory store — fine for local dev, but swap in
  `connect-pg-simple` (backed by the same Postgres database) before deploying
  anywhere with more than one server process.
- Geocoding needs internet access (calls `nominatim.openstreetmap.org`); the
  map tiles load from `tile.openstreetmap.org` and Leaflet's marker icons
  from `cdnjs.cloudflare.com`. Everything else works offline once installed.
- `estimated_value` is recalculated server-side whenever a material is
  listed — the same rule-based price table as `matching.py`, easy to replace
  with real market data later.
