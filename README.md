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
│  └─ routes/                # auth.js, materials.js, matches.js, bids.js, admin.js, dashboard.js, geocode.js
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

**Upgrading an existing database?** If you created your `sweet_exchange`
database before the bidding system existed, `schema.sql` alone won't add the
new `bids` table or the `phone` column, and `matches` no longer has a
`status` column. Run the migration once instead:

```bash
psql "$DATABASE_URL" -f migrate_v2.sql
```

New installs can ignore `migrate_v2.sql` entirely — `schema.sql` already
includes everything.

If you're using local Postgres with individual PGHOST/PGUSER/etc. fields
instead of DATABASE_URL, run the schema (or migration) directly:

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

## How the exchange actually works (the bidding flow)

This is the core change from the original prototype: matches are no longer
accepted or rejected directly. Instead:

1. A producer lists a material. The matching algorithm immediately scores
   eligible processors (recyclers, waste collectors, organisations,
   businesses) and stores the results in `matches` — a read-only
   recommendation list (see `server/matchGeneration.js`).
2. Those recommended processors see the listing surfaced on their **Dashboard**
   under "Recommended for you," and can place a **bid** — an offer amount
   plus an optional message (`POST /api/materials/:id/bids`). Any eligible
   processor can also find and bid on a material by browsing `/materials`
   directly, not just the ones the algorithm recommended.
3. The material's owner sees every bid on their listing (Dashboard → "Bids
   received," or the material's own detail page) and has **sole authority**
   to accept or reject each one (`POST /api/bids/:id/accept` /
   `/api/bids/:id/reject`). Accepting a bid automatically rejects every
   other pending bid on that material and marks it `matched`.
4. Once a bid is accepted, **both sides can now see each other's contact
   details** (name, email, phone, address) — gated server-side so contact
   info never leaks before that point (see `hideBidderContactUnlessAccepted`
   / `hideOwnerContactUnlessAccepted` in `dashboard.js`, and the equivalent
   logic in `bids.js` and `materials.js`).
5. Either party marks the deal `POST /api/bids/:id/complete` once the
   material's actually been picked up, which sets the material to
   `collected`.
6. A bidder can withdraw their own still-pending bid at any time
   (`POST /api/bids/:id/withdraw`).

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

## Permission rules (enforced server-side)

- Must be logged in to see anything past the landing page.
- Only the material's owner or an admin can trigger "Find matches".
- Anyone eligible to bid can bid — not just users the algorithm recommended.
  A household account and the material's own owner cannot bid on it.
- Only the material's owner (or an admin) can accept or reject a bid on it.
  The bidder cannot accept their own bid.
- Only the bidder can withdraw their own pending bid.
- Either the owner or the accepted bidder (or an admin) can mark a deal
  collected — but only after that bid has actually been accepted.
- Contact details (email, phone, address) are only ever returned by the API
  once a bid reaches `accepted` — never while pending or after rejection.
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
- `phone` is optional at registration and in Profile — it's only ever shown
  to the other party once a bid between them is accepted, same as email and
  address.
