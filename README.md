<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/Hono-4-orange?logo=hono" alt="Hono 4" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
</p>

# ⛩️ Journey to Mastery (J2M)

A full-stack gamified learning platform inspired by the Japanese martial arts ranking system. Students progress through ranks — **Ronin → Kenshi → Samurai → Shogun** — by completing coding tasks, submitting GitHub repositories for review, and earning scores on a competitive leaderboard.

## ✨ Features

### 👤 User Flow
- **GitHub OAuth** login with one-click authentication
- **Profile onboarding** — college, branch, year, bio
- **Task browser** — filter by difficulty (Easy/Medium/Hard) and rank requirement
- **GitHub submission** — pick a repo directly from your GitHub account
- **Live progress tracking** — rank progress bar, score, and submission history
- **Leaderboard** — competitive ranking across all users
- **Notifications** — real-time updates on submission reviews
- **Community posts** — admin-published blog/announcement feed

### ⚖️ Judge Flow
- **Review queue** — auto-assigned submissions via smart load balancing
- **Score rubric** — structured scoring with comments and feedback
- **Review history** — track past reviews and edit within a time window
- **Threaded comments** — discussion on individual submissions

### 🛡️ Admin Flow
- **Full CRUD** — manage users, tasks, submissions, judges, and posts
- **Judge management** — promote/demote, view workload metrics
- **Unassigned queue** — manually assign orphaned submissions
- **Leaderboard management** — recalculate scores
- **Audit logging** — track all administrative actions
- **Reports dashboard** — platform-wide analytics

---

## 🏗️ Architecture

```
┌─────────────────────┐      ┌──────────────────┐
│   Next.js 16        │      │   Hono API        │
│   (Frontend)        │─────▶│   (Backend)       │
│   Port 3001         │proxy │   Port 3000       │
└─────────────────────┘      └──────┬───────────┘
                                    │
                          ┌─────────┼─────────┐
                          ▼         ▼         ▼
                    ┌──────────┐ ┌───────┐ ┌────────┐
                    │PostgreSQL│ │ Redis │ │BullMQ  │
                    │  (DB)    │ │(Cache)│ │(Worker)│
                    └──────────┘ └───────┘ └────────┘
```

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16, React 19, TailwindCSS 4 | SSR/SSG pages, GSAP animations |
| API | Hono 4 on Node.js | REST API, JWT auth, RBAC middleware |
| Database | PostgreSQL 16 + Drizzle ORM | Relational data, migrations |
| Cache | Redis 7 / Upstash Redis | Session blacklisting, rate limiting |
| Queue | BullMQ | Background jobs (judge assignment, leaderboard recalc) |
| Storage | S3-compatible (Supabase Storage) | File/image uploads |
| Auth | GitHub OAuth 2.0 + JWT | Stateless authentication |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **Docker** & **Docker Compose** (for containerized setup)
- **GitHub OAuth App** — [Create one here](https://github.com/settings/developers)
- **PostgreSQL** 16+ (or use Docker)
- **Redis** 7+ (or use Docker / Upstash)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/VanshDeo/Journey-2-Mastery.git
cd Journey-2-Mastery

# Create .env file (see Environment Variables section below)
cp .env.example .env

# Build and start all services
docker-compose up --build -d

# View logs
docker logs -f j2m-api       # API server
docker logs -f j2m-frontend  # Next.js frontend
docker logs -f j2m-worker    # Background worker
```

Services will be available at:
- **Frontend:** http://localhost:3001
- **API:** http://localhost:3000
- **API Health:** http://localhost:3000/api/v1/health

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:push

# Start all services (3 terminals)
npm run dev           # Next.js frontend on :3001
npm run dev:backend   # Hono API on :3000
npm run worker:dev    # BullMQ background worker
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# ── Core ──
NODE_ENV=development
PORT=3000
API_VERSION=v1
FRONTEND_URL=http://localhost:3001

# ── Database ──
DATABASE_URL=postgresql://postgres:password@localhost:6543/j2m
DATABASE_URL_DIRECT=postgresql://postgres:password@localhost:5432/j2m

# ── Redis ──
REDIS_URL=redis://localhost:6379

# ── Authentication ──
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
ENCRYPTION_KEY=your-64-char-hex-encryption-key

# ── GitHub OAuth ──
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/v1/auth/github/callback

# ── File Upload (S3-compatible) ──
UPLOAD_PROVIDER=s3
AWS_S3_ENDPOINT=https://your-s3-endpoint
AWS_S3_REGION=your-region
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# ── Rate Limiting ──
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
RATE_LIMIT_GITHUB_MAX=10

# ── Judge Configuration ──
JUDGE_OVERLOAD_THRESHOLD=15
JUDGE_TURNAROUND_SAMPLE_SIZE=10
REVIEW_EDIT_WINDOW_HOURS=24
```

---

## 📂 Project Structure

```
Journey-2-Mastery/
├── app/                          # Next.js App Router pages
│   ├── (admin)/admin/            # Admin dashboard & management pages
│   ├── (auth)/                   # Login, callback, onboarding
│   ├── (judge)/judge/            # Judge review queue & submission review
│   ├── (user)/                   # User dashboard, tasks, submissions, profile
│   └── api/                      # Next.js API routes (proxy + session)
│       └── v1/[[...route]]/      # Catch-all → Hono (for Vercel deployment)
│
├── components/                   # React components
│   ├── admin/                    # Admin-specific components
│   ├── judge/                    # Judge-specific components
│   ├── shared/                   # Shared UI (Sidebar, RoleGuard, StatusBadge...)
│   ├── ui/                       # Radix UI primitives (Button, Card, Dialog...)
│   └── user/                     # User-specific components
│
├── hooks/                        # React hooks
│   ├── queries/                  # TanStack Query hooks per domain
│   └── useSession.ts             # Auth session management
│
├── lib/                          # Utilities
│   ├── api-client.ts             # Typed fetch wrapper with error handling
│   ├── query-client.ts           # TanStack Query client configuration
│   └── utils.ts                  # cn() helper and utilities
│
├── server/                       # Hono Backend (compiled to dist/)
│   └── src/
│       ├── config/               # env, db, redis, github, logger, queue
│       ├── controllers/          # Request handlers (auth, user, judge, admin)
│       ├── db/                   # Drizzle schema, migrations, client
│       ├── jobs/                 # BullMQ job definitions & workers
│       ├── middleware/           # Auth, RBAC, rate limit, error handler
│       ├── routes/v1/            # Route definitions per domain
│       ├── services/             # Business logic layer
│       ├── tests/                # Unit tests (Vitest)
│       ├── utils/                # API errors, responses, constants
│       └── validators/           # Zod request validation schemas
│
├── proxy.ts                      # Next.js 16 middleware (API proxy + auth guard)
├── docker-compose.yml            # Full stack: Postgres, Redis, API, Worker, Frontend
├── Dockerfile                    # API + Worker container (node:20-slim)
├── Dockerfile.frontend           # Frontend container (node:20-slim)
└── types/                        # Shared TypeScript types
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/auth/github` | Redirect to GitHub OAuth |
| `GET` | `/api/v1/auth/github/callback` | OAuth callback → JWT |
| `GET` | `/api/v1/auth/me` | Get current user 🔒 |
| `POST` | `/api/v1/auth/complete-profile` | Onboarding profile 🔒 |
| `POST` | `/api/v1/auth/refresh` | Refresh JWT tokens |
| `POST` | `/api/v1/auth/logout` | Invalidate session 🔒 |
| `GET` | `/api/v1/auth/sessions` | List active sessions 🔒 |

### User
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/user/dashboard` | Dashboard stats 🔒 |
| `GET` | `/api/v1/user/tasks` | Available tasks 🔒 |
| `POST` | `/api/v1/user/submissions` | Submit a repo 🔒 |
| `GET` | `/api/v1/user/submissions` | My submissions 🔒 |
| `GET` | `/api/v1/user/github/repos` | List GitHub repos 🔒 |

### Judge
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/judge/dashboard` | Judge overview 🔒👨‍⚖️ |
| `GET` | `/api/v1/judge/queue` | Review queue 🔒👨‍⚖️ |
| `POST` | `/api/v1/judge/reviews` | Submit review 🔒👨‍⚖️ |

### Admin
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/admin/dashboard` | Platform stats 🔒🛡️ |
| `CRUD` | `/api/v1/admin/users` | User management 🔒🛡️ |
| `CRUD` | `/api/v1/admin/tasks` | Task management 🔒🛡️ |
| `CRUD` | `/api/v1/admin/submissions` | Submission management 🔒🛡️ |
| `CRUD` | `/api/v1/admin/judges` | Judge management 🔒🛡️ |

> 🔒 = Requires authentication &nbsp; 👨‍⚖️ = Judge role &nbsp; 🛡️ = Admin role

---

## 🐳 Docker Services

| Container | Image | Port | Description |
|-----------|-------|------|-------------|
| `j2m-frontend` | `node:20-slim` | 3001 | Next.js production server |
| `j2m-api` | `node:20-slim` | 3000 | Hono REST API |
| `j2m-worker` | `node:20-slim` | — | BullMQ background processor |
| `j2m-postgres` | `postgres:16-alpine` | 5432 | PostgreSQL database |
| `j2m-redis` | `redis:7-alpine` | 6379 | Redis cache & queue broker |

---

## 🎨 Rank System

| Rank | Badge | Requirement |
|------|-------|-------------|
| **Ronin** | 🥉 | Starting rank |
| **Kenshi** | 🥈 | Complete Ronin-tier tasks |
| **Samurai** | 🥇 | Complete Kenshi-tier tasks |
| **Shogun** | 👑 | Complete Samurai-tier tasks |

---

## 🧪 Testing

```bash
# Run unit tests
npx vitest run

# Run tests in watch mode
npx vitest
```

---

## 📦 Deployment

### Vercel (Frontend + API)

The project supports Vercel deployment via the catch-all route at `app/api/v1/[[...route]]/route.ts` which mounts the Hono API using `hono/vercel`.

```bash
# Deploy to Vercel
vercel deploy
```

### Docker (Self-hosted)

```bash
docker-compose up --build -d
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and maintained by the Journey to Mastery team.

---

<p align="center">
  Built with ❤️ using Next.js, Hono, and PostgreSQL
</p>
