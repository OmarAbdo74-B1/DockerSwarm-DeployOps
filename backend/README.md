# AutoMarket Backend

A Node.js/Express REST API built to serve the AutoMarket car-marketplace frontend,
backed by **PostgreSQL**.

## Setup

1. Have a PostgreSQL server running and create a database:
   ```bash
   createdb automarket
   ```

2. Copy `.env.example` to `.env` and fill in your connection string:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Apply the schema (creates tables + seeds 4 demo cars):
   ```bash
   npm run migrate
   ```

5. Start the server:
   ```bash
   npm start
   ```

Server listens on `PORT` (defaults to 3000).

## Endpoints

### Cars
- `GET /api/cars` — list/search cars. Query params: `q`, `condition`, `minPrice`, `maxPrice`, `location`, `category`
- `GET /api/cars/:id` — get one car
- `POST /api/cars` — create a listing (maps to the "Sell your car" modal). Body: `{ make, model, year, price, phone, city }`
- `DELETE /api/cars/:id` — remove a listing

### Auth
- `POST /api/auth/register` — `{ email, password }` → returns JWT
- `POST /api/auth/login` — `{ email, password }` → returns JWT

### Favorites (requires `Authorization: Bearer <token>`)
- `GET /api/favorites` — list favorited cars
- `POST /api/favorites/:carId` — add to favorites
- `DELETE /api/favorites/:carId` — remove from favorites

### Finance
- `POST /api/finance/calculate` — mirrors the frontend loan calculator.
  Body: `{ price, downPayment, termMonths, annualInterest }`

### Reference data
- `GET /api/brands`
- `GET /api/categories`

## Database

- `db/schema.sql` — table definitions (`cars`, `users`, `favorites`) + seed data.
  Re-run with `npm run migrate` any time (uses `ON CONFLICT DO NOTHING`, safe to re-apply).
- `db/pool.js` — the `pg` connection pool, reads `DATABASE_URL` and `PGSSL` from the environment.
- All data access goes through `data/cars.js` and direct queries in `routes/auth.js` /
  `routes/favorites.js` — no in-memory state anymore, restarting the server does not
  lose data.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `PGSSL` | `"true"` to enable SSL (needed for most managed cloud Postgres) |
| `JWT_SECRET` | Secret used to sign auth tokens — set a real value in production |
| `PORT` | HTTP port (defaults to 3000) |

Tested end-to-end against a live PostgreSQL instance: schema migration, car search,
listing creation, user registration/login, and favorites all confirmed working.
