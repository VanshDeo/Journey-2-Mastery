<p align="center">
  <img src="https://img.shields.io/badge/Hono-E36002?logo=hono&logoColor=fff&style=for-the-badge" alt="Hono" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff&style=for-the-badge" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=fff&style=for-the-badge" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=fff&style=for-the-badge" alt="Redis" />
  <img src="https://img.shields.io/badge/Drizzle-C5F74F?logo=drizzle&logoColor=000&style=for-the-badge" alt="Drizzle" />
  <img src="https://img.shields.io/badge/BullMQ-FF6600?style=for-the-badge" alt="BullMQ" />
</p>

<h1 align="center">⚔️ Journey to Mastery — Backend API</h1>

<p align="center">
  A production-grade REST API for a role-based builder challenge platform where developers complete tasks, submit GitHub repos for review, and rank up from <strong>Ronin → Kenshi → Samurai → Shogun</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/tests-50%20passing-brightgreen?style=flat-square" alt="Tests" />
  <img src="https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square" alt="TS Strict" />
  <img src="https://img.shields.io/badge/endpoints-46+-purple?style=flat-square" alt="Endpoints" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [API Reference](#api-reference)
- [Auto-Assignment Algorithm](#auto-assignment-algorithm)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Overview

**Journey to Mastery** is a three-role platform:

| Role | Description |
|------|-------------|
| **User** | Complete tasks, submit GitHub repos, track progress, rank up |
| **Judge** | Review submissions, score with rubric, provide feedback |
| **Admin** | Full platform management — users, tasks, reviews, judge assignment |

Key features:
- 🔐 **GitHub OAuth** login with JWT access/refresh token rotation
- 📊 **Leaderboard** powered by PostgreSQL materialized views
- ⚖️ **Judge auto-assignment** via load-score algorithm with BullMQ
- 🔔 **Async notifications** dispatched through background workers
- 🛡️ **Rate limiting**, secure headers, encrypted token storage

---

## Architecture

```
                         ┌──────────────────────┐
                         │   Client (Frontend)   │
                         └──────────┬───────────┘
                                    │ HTTPS
                                    ▼
                         ┌──────────────────────┐
                         │   Hono API Server     │
                         │                      │
                         │  ┌────────────────┐  │
                         │  │ Middleware Stack│  │
                         │  │  • RequestID   │  │
                         │  │  • SecureHdrs  │  │
                         │  │  • CORS        │  │
                         │  │  • RateLimit   │  │
                         │  │  • Auth (JWT)  │  │
                         │  │  • Role Check  │  │
                         │  │  • Validation  │  │
                         │  └───────┬────────┘  │
                         │          ▼           │
                         │  Routes → Controllers │
                         │          │            │
                         │          ▼            │
                         │      Services         │
                         └───┬──────┬──────┬────┘
                             │      │      │
                    ┌────────┘      │      └────────┐
                    ▼               ▼               ▼
            ┌──────────────┐ ┌───────────┐ ┌──────────────┐
            │  PostgreSQL  │ │   Redis   │ │ BullMQ Queue │
            │  (Supabase)  │ │  Cache /  │ │              │
            │              │ │ Blacklist │ │   4 Queues:  │
            │  10 tables   │ │           │ │ • assign     │
            │  + mat. view │ │           │ │ • leaderboard│
            └──────────────┘ └───────────┘ │ • notify     │
                                           │ • repo cache │
                                           └──────┬───────┘
                                                  │
                                                  ▼
                                           ┌──────────────┐
                                           │    Worker     │
                                           │   Process     │
                                           │ (separate)    │
                                           └──────────────┘
```

### Request Pipeline

```
Request → RequestID → SecureHeaders → CORS → RateLimit → Logging
       → Route → Auth → Role → Validate → Controller → Service → DB/Redis
```

### Layered Design

| Layer | Responsibility |
|-------|---------------|
| **Middleware** | Cross-cutting concerns (auth, validation, rate limiting, logging) |
| **Routes** | HTTP method + path mapping, middleware composition |
| **Controllers** | Request parsing, response formatting — no business logic |
| **Services** | All business logic, DB queries, external API calls |
| **Jobs** | Async background processing (BullMQ workers) |

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js (ESM) |
| **Framework** | [Hono](https://hono.dev) — ultrafast web framework |
| **Language** | TypeScript (strict mode) |
| **Database** | PostgreSQL via [Supabase](https://supabase.com) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team) |
| **Cache / Blacklist** | Redis (via ioredis) |
| **Job Queue** | [BullMQ](https://docs.bullmq.io) |
| **Auth** | GitHub OAuth 2.0 + JWT (jsonwebtoken) |
| **Validation** | [Zod](https://zod.dev) + @hono/zod-validator |
| **Logging** | [Pino](https://getpino.io) (JSON in prod, pretty in dev) |
| **Encryption** | AES-256-GCM (for GitHub tokens at rest) |
| **Testing** | [Vitest](https://vitest.dev) |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Redis** (local or cloud)
- **PostgreSQL** (Supabase recommended) or Docker

### 1. Clone & Install

```bash
git clone https://github.com/your-org/j2m-backend.git
cd j2m-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials (see Environment Variables below)
```

### 3. Start Infrastructure (Docker)

```bash
docker-compose up -d   # PostgreSQL + Redis
```

### 4. Set Up Database

```bash
# Push schema to database
npm run db:push

# OR generate + run migrations
npm run db:generate
npm run db:migrate
```

Then create the leaderboard materialized view:

```bash
# Execute the view SQL against your database
psql $DATABASE_URL_DIRECT -f src/db/views.sql
```

### 5. Configure GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → **New OAuth App**
2. Set **Authorization callback URL** to: `http://localhost:3000/api/v1/auth/github/callback`
3. Copy **Client ID** and **Client Secret** into your `.env`

### 6. Start

```bash
# Terminal 1 — API Server
npm run dev

# Terminal 2 — Background Workers
npm run worker:dev
```

The API is live at `http://localhost:3000` — verify with:
```bash
curl http://localhost:3000/api/v1/health
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | `development` \| `staging` \| `production` \| `test` |
| `PORT` | No | `3000` | HTTP server port |
| `FRONTEND_URL` | No | `http://localhost:5173` | Frontend origin (CORS + OAuth redirect) |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection (Supavisor pooler, port 6543) |
| `DATABASE_URL_DIRECT` | No | — | Direct PG connection for migrations (port 5432) |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection string |
| `JWT_SECRET` | **Yes** | — | ≥ 32 characters for HMAC signing |
| `JWT_ACCESS_EXPIRY` | No | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRY` | No | `7d` | Refresh token lifetime |
| `GITHUB_CLIENT_ID` | **Yes** | — | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | **Yes** | — | GitHub OAuth app client secret |
| `GITHUB_CALLBACK_URL` | **Yes** | — | OAuth callback URL |
| `ENCRYPTION_KEY` | **Yes** | — | 32-byte key for AES-256-GCM |
| `JUDGE_OVERLOAD_THRESHOLD` | No | `15` | Max pending before queueing |
| `REVIEW_EDIT_WINDOW_HOURS` | No | `24` | Hours judges can edit reviews |

See [`.env.example`](.env.example) for the full list with comments.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API server with hot reload (tsx watch) |
| `npm run worker:dev` | Start BullMQ workers with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run worker` | Run workers in production |
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | TypeScript type checking (`tsc --noEmit`) |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:push` | Push schema directly to DB |
| `npm run db:studio` | Open Drizzle Studio GUI |

---

## API Reference

All endpoints are prefixed with `/api/v1`. Responses use a consistent envelope:

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "nextCursor": "...", "limit": 20 }
}

// Error
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "User not found" }
}
```

### Auth — `/api/v1/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/github` | Public | Redirect to GitHub OAuth |
| `GET` | `/github/callback` | Public | Exchange code → JWT |
| `POST` | `/refresh` | Public | Rotate JWT tokens |
| `GET` | `/me` | Bearer | Current user profile |
| `POST` | `/logout` | Bearer | Blacklist current JWT |
| `GET` | `/profile-status` | Bearer | Check profile completion |
| `POST` | `/complete-profile` | Bearer | One-time profile setup (409 on repeat) |

### User — `/api/v1/user`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/dashboard` | user, admin | Dashboard summary |
| `GET` | `/tasks` | user, admin | Available tasks (filterable by category, difficulty) |
| `GET` | `/tasks/:taskId` | user, admin | Task detail |
| `GET` | `/tasks/completed` | user, admin | Completed tasks |
| `GET` | `/tasks/pending` | user, admin | Pending tasks |
| `GET` | `/github/repos` | user, admin | GitHub repos (cached 2-5 min) |
| `POST` | `/submissions` | user, admin | Submit task → triggers auto-assign |
| `GET` | `/submissions` | user, admin | Own submissions list |
| `GET` | `/submissions/:id` | user, admin | Submission detail + review |
| `PATCH` | `/submissions/:id` | user, admin | Edit pending submission |
| `DELETE` | `/submissions/:id` | user, admin | Withdraw pending submission |
| `GET` | `/profile` | user, admin | Own profile |
| `PATCH` | `/profile` | user, admin | Update profile |

### Judge — `/api/v1/judge`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/dashboard` | judge, admin | Pending count, reviewed total, avg turnaround |
| `GET` | `/submissions` | judge, admin | Assigned review queue |
| `GET` | `/submissions/:id` | judge, admin | Submission for review |
| `POST` | `/submissions/:id/review` | judge, admin | Submit review (approve/reject) |
| `GET` | `/reviews` | judge, admin | Own review history |
| `GET` | `/reviews/:id` | judge, admin | Review detail |
| `PATCH` | `/reviews/:id` | judge, admin | Edit review (24h window) |
| `GET` | `/criteria` | judge, admin | Scoring rubric |
| `GET` | `/workload` | judge, admin | Own load score |

### Admin — `/api/v1/admin`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/dashboard` | admin | Platform analytics |
| `GET` | `/dashboard/activity` | admin | Audit activity feed |
| `GET` | `/users` | admin | List users (filter by role/rank) |
| `GET` | `/users/:id` | admin | User detail |
| `PATCH` | `/users/:id` | admin | Update user |
| `PATCH` | `/users/:id/role` | admin | Change user role |
| `DELETE` | `/users/:id` | admin | Deactivate user |
| `POST` | `/tasks` | admin | Create task |
| `GET` | `/tasks` | admin | List all tasks |
| `PATCH` | `/tasks/:id` | admin | Update task |
| `DELETE` | `/tasks/:id` | admin | Deactivate task |
| `GET` | `/submissions` | admin | All submissions (filter by status) |
| `GET` | `/submissions/:id` | admin | Submission detail |
| `POST` | `/submissions/:id/assign` | admin | Manual judge assign |
| `GET` | `/assignment/unassigned` | admin | Unassigned submission queue |
| `POST` | `/assignment/reassign/:submissionId` | admin | Re-assign submission |
| `GET` | `/reviews` | admin | All reviews |
| `PATCH` | `/reviews/:id/override` | admin | Override review score/decision |
| `POST` | `/leaderboard/recalculate` | admin | Force leaderboard refresh (202) |
| `GET` | `/judges` | admin | Judges list + workload stats |
| `POST` | `/posts` | admin | Create community post |
| `GET` | `/posts` | admin | List all posts (incl. unpublished) |
| `PATCH` | `/posts/:id` | admin | Update post |
| `DELETE` | `/posts/:id` | admin | Delete post |
| `GET` | `/audit-log` | admin | Full audit trail |

### Public (authenticated) — `/api/v1/...`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/leaderboard` | any | Global leaderboard (cached) |
| `GET` | `/posts` | any | Published community posts |
| `GET` | `/posts/:id` | any | Post detail |
| `GET` | `/notifications` | any | Own notifications |
| `PATCH` | `/notifications/:id/read` | any | Mark notification as read |
| `PATCH` | `/notifications/read-all` | any | Mark all as read |
| `DELETE` | `/notifications/:id` | any | Delete notification |
| `GET` | `/submissions/:id/comments` | owner/judge/admin | Comment thread |
| `POST` | `/submissions/:id/comments` | owner/judge/admin | Add comment |
| `GET` | `/health` | Public | Health check (DB + Redis) |

---

## Auto-Assignment Algorithm

When a user submits a task, a BullMQ job automatically assigns the best-fit judge:

```
loadScore = pendingCount + (avgTurnaroundHrs / 24)
```

| Step | Logic |
|------|-------|
| **1. Fetch judges** | All active users with `role = 'judge'` |
| **2. Self-review guard** | Exclude judge if `judge.id === submission.userId` |
| **3. Compute load score** | `pending reviews + (avg turnaround hours / 24)` |
| **4. Overload check** | If all judges ≥ threshold → stays pending for admin |
| **5. Sort** | Lowest `loadScore` first |
| **6. Tie-break** | Round-robin: pick judge assigned longest ago |
| **7. Assign** | Update submission status → `in_review`, notify judge |

Configuration:
- `JUDGE_OVERLOAD_THRESHOLD` — max pending before queueing (default: 15)
- `JUDGE_TURNAROUND_SAMPLE_SIZE` — recent reviews to sample (default: 10)

---

## Project Structure

```
j2m-backend/
├── src/
│   ├── app.ts                          # Hono app + global middleware
│   ├── server.ts                       # Node.js entry point
│   ├── config/                         # Environment, DB, Redis, queues, logger
│   ├── db/
│   │   ├── schema.ts                   # 10 Drizzle tables + relations
│   │   ├── client.ts                   # Drizzle client instance
│   │   ├── views.sql                   # Leaderboard materialized view SQL
│   │   └── migrations/                 # Auto-generated SQL migrations
│   ├── middleware/                      # Auth, role, validation, rate limit, error handling
│   ├── routes/v1/                      # Route definitions per domain
│   ├── controllers/                    # Request/response handling (thin)
│   ├── services/                       # Business logic layer
│   ├── validators/                     # Zod schemas per domain
│   ├── jobs/                           # BullMQ job processors
│   │   └── workers/index.ts            # Worker process entry point
│   ├── utils/                          # Shared utilities
│   ├── types/                          # TypeScript type definitions
│   └── tests/unit/                     # Unit tests
├── docker-compose.yml                  # PostgreSQL + Redis
├── drizzle.config.ts                   # Drizzle Kit config
├── vitest.config.ts                    # Vitest config
├── tsconfig.json                       # TypeScript config
├── .env.example                        # Environment template
└── package.json
```

### Database Schema (10 tables)

| Table | Description |
|-------|-------------|
| `users` | All accounts (user, judge, admin) with GitHub OAuth data |
| `tasks` | Challenge tasks created by admins |
| `submissions` | User task submissions with repo links |
| `reviews` | Judge reviews with scores and feedback |
| `notifications` | In-app notification records |
| `comments` | Threaded comments on submissions |
| `community_posts` | Admin-authored community posts |
| `badges` | Achievement badge definitions |
| `user_badges` | Badge awards (many-to-many) |
| `audit_log` | Full admin action audit trail |

---

## Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Type checking
npm run typecheck
```

### Test Coverage

| Suite | Tests | Covers |
|-------|-------|--------|
| `apiError.test.ts` | 8 | AppError class + all factory functions |
| `constants.test.ts` | 10 | Rank ordering, rank sufficiency, cache keys |
| `encryption.test.ts` | 7 | AES-256-GCM round-trip, random IVs, tamper detection |
| `errorHandler.test.ts` | 4 | Middleware error → envelope formatting |
| `validators.test.ts` | 17 | All Zod schemas (auth, user, judge, admin) |
| `userPromotion.test.ts`| 4 | User rank progression and auto-promotions |
| **Total** | **50** | ✅ All passing |

---

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (≥ 32 random chars)
- [ ] Use strong `ENCRYPTION_KEY` (32-byte hex)
- [ ] Configure Supabase `DATABASE_URL` (pooler mode, SSL)
- [ ] Set up managed Redis (Upstash / ElastiCache)
- [ ] Run migrations: `npm run db:migrate`
- [ ] Create materialized view: execute `src/db/views.sql`
- [ ] Configure GitHub OAuth with production callback URL
- [ ] Set `FRONTEND_URL` to production frontend domain
- [ ] Deploy API server: `npm run build && npm start`
- [ ] Deploy worker process: `npm run build && npm run worker`

### Docker

```bash
# Development
docker-compose up -d

# The docker-compose.yml provides:
# - PostgreSQL 15 on port 5432
# - Redis 7 on port 6379
```

---

## License

MIT © Journey to Mastery
