# 🏍️ Vutto Auctions — Used Two-Wheeler Marketplace & Live Auction Platform

A production-grade, full-stack **PERN** application where registered users buy and sell
inspected pre-owned two-wheelers — either at a fixed price or through **real-time live
auctions** with server-authoritative bidding and anti-sniping.

The design language (colours, typography, spacing, component styling) is inspired by
[**vutto.in**](https://vutto.in). See [ASSUMPTIONS.md](./ASSUMPTIONS.md) for the exact
design tokens and the decisions behind them.

> **Stack:** PostgreSQL · Express · React · Node + TypeScript end-to-end, Prisma ORM,
> Socket.IO for real-time bidding, React Query + Tailwind on the client.

---

## ✨ Highlights

- **Real-time auctions** — WebSocket bidding with row-level locking for correctness under
  concurrency, plus anti-snipe time extensions. The server is the single source of truth.
- **Auction lifecycle engine** — a scheduler automatically transitions auctions
  `SCHEDULED → LIVE → ENDED → SETTLED` and resolves the winner against the reserve price.
- **Secure auth** — JWT access tokens (in memory) + rotating refresh tokens (httpOnly
  cookie, stored only as hashes) with reuse detection, bcrypt password hashing and RBAC.
- **Marketplace** — search, multi-facet filters, sorting, pagination, grid/list views,
  rich vehicle detail pages, saved bikes and seller inquiries.
- **Dashboards** — a user dashboard (listings CRUD, bids, saved, inquiries, profile) and a
  full **admin** panel (analytics, user/vehicle/inquiry management, CMS for FAQs &
  testimonials).
- **Production concerns** — structured logging, Prometheus `/metrics`, health checks,
  rate limiting, Helmet, input validation, graceful shutdown, Docker + IaC, automated tests.

---

## 🔐 Demo accounts (created by the seed)

| Role   | Email                | Password       |
| ------ | -------------------- | -------------- |
| Admin  | `admin@vutto.local`  | `Admin@12345`  |
| Buyer  | `buyer@vutto.local`  | `Password@123` |
| Seller | `seller@vutto.local` | `Password@123` |

---

## 🗂️ Repository structure

```
bike-auction-platform/
├── backend/            # Express + TypeScript + Prisma API (REST + WebSocket)
├── frontend/           # React + TypeScript + Vite + Tailwind SPA
├── docs/
│   ├── ARCHITECTURE.md # system design, ER diagram, schema, folder guide, scaling
│   ├── API.md          # full REST + WebSocket API reference
│   └── DEPLOYMENT.md    # Vercel + Render + Neon deployment guide
├── docker-compose.yml  # local Postgres for development
└── ASSUMPTIONS.md      # assumptions, trade-offs, design tokens
```

A deep explanation of **every backend and frontend folder** lives in
[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md#folder-structure).

---

## 🚀 Quick start (local)

### 1. Prerequisites

- **Node.js ≥ 20** (`node -v`)
- **PostgreSQL 14+** — either Docker (recommended) or a free [Neon](https://neon.tech) DB.

### 2. Clone

```bash
git clone <your-repo-url> bike-auction-platform
cd bike-auction-platform
```

### 3. Start a database

**Option A — Docker (recommended):**

```bash
docker compose up -d        # starts Postgres on localhost:5432
```

**Option B — Neon / existing Postgres:** copy your connection string for the next step.

### 4. Backend

```bash
cd backend
cp .env.example .env        # then edit values (see comments in the file)
npm install
npm run prisma:generate     # generate the typed Prisma client
npm run prisma:migrate      # create the schema (name the migration e.g. "init")
npm run db:seed             # load demo users, bikes, auctions, FAQs, testimonials
npm run dev                 # API on http://localhost:4000
```

Generate strong JWT secrets for `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 5. Frontend

```bash
cd ../frontend
cp .env.example .env        # defaults work out of the box with the Vite proxy
npm install
npm run dev                 # app on http://localhost:5173
```

Open **http://localhost:5173**, sign in with a demo account, and open the **Auctions** tab —
the seeded auction is **LIVE**, so you can place a bid and watch it update in real time.

---

## 📜 Scripts

### Backend (`/backend`)

| Script                    | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `npm run dev`             | Start the API with hot reload (ts-node-dev)       |
| `npm run build`           | Generate Prisma client + compile TS to `dist/`    |
| `npm start`               | Run the compiled server                           |
| `npm run prisma:migrate`  | Create/apply a dev migration                      |
| `npm run prisma:deploy`   | Apply migrations in production (no prompts)        |
| `npm run db:seed`         | Seed demo data                                    |
| `npm run prisma:studio`   | Open Prisma Studio (DB GUI)                       |
| `npm test`                | Run unit tests (+ integration when `RUN_DB_TESTS=1`) |

### Frontend (`/frontend`)

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Vite dev server with API/WS proxy    |
| `npm run build`   | Type-check + production bundle        |
| `npm run preview` | Preview the production build locally  |

---

## 🧪 Testing

```bash
cd backend
npm test                                  # pure-logic unit tests (no DB needed)
RUN_DB_TESTS=1 npm test                    # also runs the auth integration tests
```

Unit tests cover bid-increment rules, JWT/TTL helpers, slug generation and pagination.
The integration suite exercises the real register → login → /me flow against a Postgres
test database (auto-skipped when `RUN_DB_TESTS` is unset).

---

## 📚 Documentation

| Doc | What's inside |
| --- | --- |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design, ER diagram, full schema explanation, folder-by-folder guide, real-time bidding design, observability & scaling |
| [docs/API.md](./docs/API.md) | Every REST endpoint + WebSocket events: request bodies, validation, responses, errors, auth |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Step-by-step deploy to Vercel (web), Render (API), Neon (DB) |
| [ASSUMPTIONS.md](./ASSUMPTIONS.md) | Assumptions, trade-offs and the Vutto-derived design system |

---

## 🩺 Operational endpoints

- `GET /health` — liveness/readiness probe (`{ status: "ok" }`)
- `GET /metrics` — Prometheus metrics (request latency histogram, live-auctions gauge,
  bids counter, default Node metrics)

---

## License

MIT — built as a technical demonstration inspired by vutto.in.
