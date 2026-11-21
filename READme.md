# CCS Hub

**College of Computer Studies Information System**
Quezon City University — Internal Digital Portal

---

## What is CCS Hub?

CCS Hub is the official digital platform for QCU's College of Computer Studies. It consolidates academic, administrative, and student-life services into a single system accessible via a web portal (for faculty and administrators) and a mobile app (for students).

### Core Features (Phase 1 scope)

| Module | Description |
|---|---|
| **Authentication** | Email + password login, JWT access/refresh tokens, password reset via email |
| **Schedule** | Student class timetable; faculty teaching load |
| **Consultation** | Faculty publishes 30-min slots; students book; double-booking prevented at DB level |
| **Grades** | Faculty encodes Prelims/Midterms/Finals grades; students view their own |
| **Events** | Admin/faculty publishes events; students register and get QR codes for attendance |
| **Organizations** | Student org directory; membership applications; org-specific announcements |
| **Announcements** | Targeted to all, CCS-wide, or specific organizations; pinned notices |
| **Research Repository** | Searchable archive of CCS capstone and thesis papers (full-text search) |
| **Campus Map** | Indoor room directory with approximate coordinates |
| **Faculty Evaluation** | Anonymous student evaluation of faculty per semester |

---

## Monorepo Structure

```
ccs-hub/
├── apps/
│   ├── api/        Express + TypeScript REST API  (port 3000)
│   ├── web/        React + Vite admin/faculty portal (port 5173)
│   └── mobile/     Expo React Native student app
├── packages/
│   └── shared/     Shared TypeScript types and Zod schemas
├── docker/
│   └── postgres/   init.sql — PostgreSQL extensions
├── docs/
│   ├── architecture.md
│   └── erd.md
├── docker-compose.yml
├── .env.example
└── package.json    (pnpm workspaces root)
```

---

## Quick Start

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9 (`npm i -g pnpm`)
- Docker Desktop

### 1. Start infrastructure

```bash
docker compose up -d
```

This starts:
- **PostgreSQL 16** on `localhost:5432`
- **Mailpit** (local SMTP) on `localhost:1025`, web UI at `http://localhost:8025`

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

```bash
cp .env.example apps/api/.env
# Edit apps/api/.env — set at minimum:
#   DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
```

### 4. Run migrations & seed

```bash
pnpm db:migrate
pnpm db:seed
```

### 5. Start the API

```bash
pnpm dev:api
# API running at http://localhost:3000
# Health: http://localhost:3000/health
```

### 6. Start the web app

```bash
pnpm dev:web
# Web at http://localhost:5173
```

### 7. (Optional) pgAdmin

```bash
docker compose --profile pgadmin up -d
# pgAdmin at http://localhost:5050
# Email: admin@ccs.local  Password: admin
```

---

## Seed Accounts

All seeded users share the password: **`TempPass1!`**

| Email | Role |
|---|---|
| `admin@ccs.qcu.edu.ph` | Admin |
| `jose.reyes@ccs.qcu.edu.ph` | Faculty |
| `ana.delacruz@ccs.qcu.edu.ph` | Faculty |
| `ramon.garcia@ccs.qcu.edu.ph` | Faculty |
| `kristine.villanueva@students.qcu.edu.ph` | Student |
| `mark.ramos@students.qcu.edu.ph` | Student |
| `jessa.aquino@students.qcu.edu.ph` | Student |
| `carlo.mendoza@students.qcu.edu.ph` | Student |
| `patricia.flores@students.qcu.edu.ph` | Student |
| `angelo.cruz@students.qcu.edu.ph` | Student |
| `sophia.lim@students.qcu.edu.ph` | Student |
| `ryan.pascual@students.qcu.edu.ph` | Student |

---

## Useful Scripts

```bash
pnpm dev:api          # Start API in watch mode
pnpm dev:web          # Start Vite web app
pnpm db:migrate       # Apply pending migrations
pnpm db:seed          # Reset and reseed the database
pnpm db:studio        # Open Drizzle Studio (visual DB browser)
```

---

## Documentation

- [Architecture](docs/architecture.md) — Stack choices, patterns, design decisions
- [ERD](docs/erd.md) — Entity relationship diagram (all 16 tables)

---

## Design Assumptions

1. **UUIDs everywhere** — `uuid_generate_v4()` via the `uuid-ossp` extension. Consistent, safe to generate client-side before insert.
2. **Drizzle ORM** — Generates versioned SQL migration files committed to source control. Type-safe query building with zero ORM magic.
3. **30-minute consultation slots** — Enforced by an `EXCLUDE` constraint (`btree_gist`) at the database level. See [architecture.md](docs/architecture.md) for the full constraint SQL.
4. **Academic year format** — `"2026-2027"`. Semester: `1` or `2`. Grade period: `"Prelims"` | `"Midterms"` | `"Finals"`.
5. **Philippine grading scale** — `1.00` (highest) to `5.00` (failing), stored as `numeric(4,2)`.
