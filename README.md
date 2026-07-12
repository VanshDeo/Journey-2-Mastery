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
- **Task status lists** — separate lists for completed and pending tasks
- **GitHub submission** — pick a repo directly from your GitHub account and manage submissions
- **Profile and settings** — update your details, customize user settings, or delete account
- **Live progress tracking** — rank progress bar, score, and submission history
- **Leaderboard** — competitive ranking across all users
- **Notifications** — real-time updates on submission reviews
- **Community posts** — admin-published blog/announcement feed

### 👥 Team Flow
- **Team creation** — create a new team with a custom name
- **Join-by-code** — easily join an existing team via a unique, shareable code
- **Team profile** — view team members, roles, and overall workload/progress
- **Team management** — regenerate join codes, transfer leadership, leave team, remove member, or disband team

### ⚖️ Judge Flow
- **Review queue** — auto-assigned submissions via smart load balancing
- **Score rubric** — structured scoring with comments and feedback
- **Review history** — track past reviews and edit within a 24-hour window
- **Threaded comments** — discussion on individual submissions between submitter, judge, and admin

### 🛡️ Admin Flow
- **Full CRUD** — manage users, tasks, submissions, judges, and posts
- **Judge management** — promote/demote, view workload/performance metrics
- **Unassigned queue** — manually assign orphaned submissions
- **Leaderboard management** — recalculate scores and trigger queue-based updates
- **Audit logging** — track all administrative actions
- **Activity Feed** — real-time tracking of platform activity

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

All backend REST API endpoints are prefix-routed under `/api/v1`.

### 🔑 [Auth](server/src/routes/v1/auth.routes.ts)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/auth/github` | Redirect to GitHub OAuth consent screen |
| `GET` | `/api/v1/auth/github/callback` | GitHub OAuth callback — exchanges code for JWT |
| `POST` | `/api/v1/auth/refresh` | Refresh JWT access/refresh tokens |
| `GET` | `/api/v1/auth/me` | Get current logged-in user 🔒 |
| `POST` | `/api/v1/auth/logout` | Invalidate current user session 🔒 |
| `GET` | `/api/v1/auth/profile-status` | Check if profile onboarding setup is pending 🔒 |
| `POST` | `/api/v1/auth/complete-profile` | Complete onboarding profile (one-time setup) 🔒 |
| `GET` | `/api/v1/auth/sessions` | List active sessions/devices 🔒 |
| `DELETE` | `/api/v1/auth/sessions/:id` | Revoke a specific active session 🔒 |

### 👤 [User](server/src/routes/v1/user.routes.ts)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/user/dashboard` | Retrieve user dashboard statistics 🔒 |
| `GET` | `/api/v1/user/tasks` | Get all active, rank-eligible tasks 🔒 |
| `GET` | `/api/v1/user/tasks/completed` | List completed tasks 🔒 |
| `GET` | `/api/v1/user/tasks/pending` | List pending tasks/reviews 🔒 |
| `GET` | `/api/v1/user/tasks/:taskId` | Retrieve details of a specific task 🔒 |
| `GET` | `/api/v1/user/github/repos` | List available repositories from user's GitHub 🔒 |
| `POST` | `/api/v1/user/submissions` | Submit a GitHub repository for a task 🔒 |
| `GET` | `/api/v1/user/submissions` | List all own submissions 🔒 |
| `GET` | `/api/v1/user/submissions/:id` | Get detail metrics of a submission 🔒 |
| `PATCH` | `/api/v1/user/submissions/:id` | Update an unreviewed submission 🔒 |
| `DELETE` | `/api/v1/user/submissions/:id` | Cancel/delete an unreviewed submission 🔒 |
| `GET` | `/api/v1/user/profile` | Get own profile details 🔒 |
| `PATCH` | `/api/v1/user/profile` | Update profile information 🔒 |
| `GET` | `/api/v1/user/settings` | Get user settings 🔒 |
| `PATCH` | `/api/v1/user/settings` | Update user settings 🔒 |
| `DELETE` | `/api/v1/user/account` | Delete own user account 🔒 |

### 👥 [Teams](server/src/routes/v1/team.routes.ts)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/v1/teams` | Create a new team 🔒 |
| `GET` | `/api/v1/teams/my` | Retrieve details of own team 🔒 |
| `POST` | `/api/v1/teams/join` | Join a team using a unique join code 🔒 |
| `GET` | `/api/v1/teams/:id` | View public profile of a team 🔒 |
| `GET` | `/api/v1/teams/:id/members` | Get member list of a team 🔒 |
| `PATCH` | `/api/v1/teams/:id` | Rename/update team details (creator only) 🔒 |
| `POST` | `/api/v1/teams/:id/regenerate-code` | Generate new shareable join code (creator only) 🔒 |
| `DELETE` | `/api/v1/teams/:id` | Disband team (creator only) 🔒 |
| `POST` | `/api/v1/teams/:id/leave` | Leave team 🔒 |
| `DELETE` | `/api/v1/teams/:id/members/:userId` | Remove member from team (creator only) 🔒 |
| `PATCH` | `/api/v1/teams/:id/transfer-leadership` | Transfer ownership to a member (creator only) 🔒 |

### ⚖️ [Judge](server/src/routes/v1/judge.routes.ts)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/judge/dashboard` | Get dashboard statistics for judge workload 🔒👨‍⚖️ |
| `GET` | `/api/v1/judge/submissions` | Retrieve judge review queue 🔒👨‍⚖️ |
| `GET` | `/api/v1/judge/submissions/:id` | View submission details for evaluation 🔒👨‍⚖️ |
| `POST` | `/api/v1/judge/submissions/:id/review` | Submit a score and review rubric 🔒👨‍⚖️ |
| `GET` | `/api/v1/judge/reviews` | View list of completed reviews 🔒👨‍⚖️ |
| `GET` | `/api/v1/judge/reviews/:id` | Retrieve detailed review sheet 🔒👨‍⚖️ |
| `PATCH` | `/api/v1/judge/reviews/:id` | Edit feedback/score within edit window 🔒👨‍⚖️ |
| `GET` | `/api/v1/judge/criteria` | List general scoring criteria 🔒👨‍⚖️ |
| `GET` | `/api/v1/judge/workload` | View judge capacity and metrics 🔒👨‍⚖️ |

### 🛡️ [Admin](server/src/routes/v1/admin.routes.ts)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/admin/dashboard` | Platform overall analytics 🔒🛡️ |
| `GET` | `/api/v1/admin/dashboard/activity` | Activity audit stream 🔒🛡️ |
| `GET` | `/api/v1/admin/users` | List all registered users 🔒🛡️ |
| `GET` | `/api/v1/admin/users/:id` | Get specific user profile 🔒🛡️ |
| `PATCH` | `/api/v1/admin/users/:id` | Modify user fields 🔒🛡️ |
| `PATCH` | `/api/v1/admin/users/:id/role` | Promote/demote user roles 🔒🛡️ |
| `DELETE` | `/api/v1/admin/users/:id` | Force delete user account 🔒🛡️ |
| `POST` | `/api/v1/admin/tasks` | Create a new task 🔒🛡️ |
| `GET` | `/api/v1/admin/tasks` | List all tasks (including drafts) 🔒🛡️ |
| `PATCH` | `/api/v1/admin/tasks/:id` | Update task requirements/metadata 🔒🛡️ |
| `DELETE` | `/api/v1/admin/tasks/:id` | Delete a task 🔒🛡️ |
| `GET` | `/api/v1/admin/submissions` | List all system submissions 🔒🛡️ |
| `GET` | `/api/v1/admin/submissions/:id` | Get specific submission details 🔒🛡️ |
| `POST` | `/api/v1/admin/submissions/:id/assign` | Manually assign submission to a judge 🔒🛡️ |
| `GET` | `/api/v1/admin/assignment/unassigned` | View unassigned submissions queue 🔒🛡️ |
| `POST` | `/api/v1/admin/assignment/reassign/:submissionId` | Force reassign a submission to another judge 🔒🛡️ |
| `PATCH` | `/api/v1/admin/reviews/:id/override` | Override scoring/review of a judge 🔒🛡️ |
| `GET` | `/api/v1/admin/reviews` | View list of all system reviews 🔒🛡️ |
| `GET` | `/api/v1/admin/leaderboard` | View admin-level leaderboard 🔒🛡️ |
| `POST` | `/api/v1/admin/leaderboard/recalculate` | Trigger system-wide leaderboard recalculation 🔒🛡️ |
| `GET` | `/api/v1/admin/judges` | List judges and active workload statuses 🔒🛡️ |
| `GET` | `/api/v1/admin/judges/:id/performance` | Get judge performance metrics 🔒🛡️ |
| `POST` | `/api/v1/admin/posts/upload-image` | Upload image for community post 🔒🛡️ |
| `POST` | `/api/v1/admin/posts` | Create new community post 🔒🛡️ |
| `GET` | `/api/v1/admin/posts` | List all community posts 🔒🛡️ |
| `PATCH` | `/api/v1/admin/posts/:id` | Update a community post 🔒🛡️ |
| `DELETE` | `/api/v1/admin/posts/:id` | Delete a community post 🔒🛡️ |
| `GET` | `/api/v1/admin/audit-log` | Get all system audit logs 🔒🛡️ |

### 🏆 [Leaderboard](server/src/routes/v1/leaderboard.routes.ts)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/leaderboard` | Get public leaderboard 🔒 |

### 📢 [Community Posts](server/src/routes/v1/post.routes.ts)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/posts` | Retrieve paginated feed of published posts 🔒 |
| `GET` | `/api/v1/posts/:id` | Retrieve details of a single post 🔒 |

### 🔔 [Notifications](server/src/routes/v1/notification.routes.ts)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/notifications` | Get paginated list of own notifications 🔒 |
| `PATCH` | `/api/v1/notifications/:id/read` | Mark a notification as read 🔒 |
| `PATCH` | `/api/v1/notifications/read-all` | Mark all notifications as read 🔒 |
| `DELETE` | `/api/v1/notifications/:id` | Delete a notification 🔒 |

### 💬 [Submission Comments](server/src/routes/v1/comment.routes.ts)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/submissions/:id/comments` | Get comment thread on a submission (owner/assigned judge/admin) 🔒 |
| `POST` | `/api/v1/submissions/:id/comments` | Add comment to submission thread (owner/assigned judge/admin) 🔒 |

### 🏥 [Infrastructure](server/src/routes/v1/health.routes.ts)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/health` | Health check (verifies PostgreSQL and Redis connectivity) |

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

## 🛠️ Development Scripts & Commands

Below is a reference of the available package scripts for managing the frontend, Hono backend, background workers, and PostgreSQL database migrations.

### Services
* **Start Frontend**: `npm run dev` (starts Next.js on port 3001)
* **Start Hono Backend**: `npm run dev:backend` (starts Hono server on port 3000 with hot-reload)
* **Start Background Worker**: `npm run worker:dev` (starts BullMQ job processor with hot-reload)

### Database Management (Drizzle Kit)
* **Push schema changes directly**: `npm run db:push` (useful for quick prototyping)
* **Generate migration files**: `npm run db:generate` (creates SQL file under `server/src/db/migrations`)
* **Run outstanding migrations**: `npm run db:migrate` (applies outstanding schema migrations to PostgreSQL)
* **Explore DB via GUI**: `npm run db:studio` (launches local Drizzle Studio database manager UI)

### Production Build
* **Build Frontend**: `npm run build`
* **Build Backend**: `npm run build:backend`
* **Run Backend (Prod)**: `npm run start:backend`
* **Run Worker (Prod)**: `npm run worker:prod`

---

## 📄 License

This project is private and maintained by the Journey to Mastery team.

---

<p align="center">
  Built with ❤️ using Next.js, Hono, and PostgreSQL
</p>
