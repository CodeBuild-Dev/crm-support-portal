# CRM Support Portal

A full-stack help center for CRM products: a searchable knowledge base, an AI support assistant that answers from your own articles, a ticketing system, and an admin CMS to manage it all.

Built as a TypeScript monorepo with **React**, **Express**, **PostgreSQL** and **Drizzle ORM**.

---

## Features

### Public help center
- **Knowledge base** organised as categories → folders → articles
- **Full-text search** with keyword scoring and highlighted snippets
- **Popular articles**, view tracking and "Was this helpful?" voting
- **AI support chat widget**: answers questions using the knowledge base as context (RAG), shows suggested prompts, and hands off to a support ticket when it can't help
- **Multi-language UI** (English / German) and light / dark themes
- SEO meta tags for every page

### Admin CMS (`/admin`)
- Create, edit, reorder and delete categories, folders and articles
- **Rich-text editor** (Tiptap) with images, links, tables and YouTube embeds
- **Article version history** with one-click restore
- **Analytics dashboard**: views, top articles, top searches, and searches with zero results (content gaps)
- **Ticket management**: status workflow, notification bell, AI-generated ticket summaries from the chat transcript
- **AI settings**: bot name, model, system prompt, suggested prompts
- **Email settings**: customers are emailed automatically when their ticket is closed (any SMTP provider)

### Integrations
- **CRM webhook** (`POST /webhook/stage-change`) to track deals moving through pipeline stages
- **Embeddable stage widget** (`/embed/stage-widget`) that can be dropped into a CRM page via an iframe

---

## Tech stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix), TanStack Query, React Router, Tiptap, Recharts |
| Backend    | Node.js 20, Express, Zod validation, Nodemailer |
| AI         | Anthropic Claude API (retrieval-augmented answers + summarisation) |
| Database   | PostgreSQL, Drizzle ORM, SQL migrations |
| Tooling    | pnpm workspaces, ESLint, Prettier, Vitest |
| Deployment | Railway (single service: Express serves the API and the built SPA) |

---

## Architecture

```
┌──────────────────────┐        ┌───────────────────────────┐        ┌──────────────┐
│  React SPA (client)  │──────▶ │  Express API (server)     │──────▶ │  PostgreSQL  │
│  help center + admin │  /api  │  routes → services → db   │ Drizzle│              │
└──────────────────────┘        │                           │        └──────────────┘
                                │  chat.service ──────────────────▶  Claude API
            CRM ──webhook──────▶│  email.service ─────────────────▶  SMTP
                                └───────────────────────────┘
```

The repo is a pnpm monorepo:

```
client/    React frontend (Vite SPA)
server/    Express API: routes, services, middleware, migrate + seed scripts
shared/    TypeScript types shared by client and server
drizzle/   Database schema and migrations
```

Each entity (articles, categories, tickets, …) has a single **service** that owns its reads and writes. Routes only validate input with Zod and call the service.

---

## Getting started

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL 14+

### Setup

```bash
git clone https://github.com/CodeBuild-Dev/support-portal.git
cd support-portal
pnpm install

cp .env.example .env        # then fill in DATABASE_URL (and ANTHROPIC_API_KEY for chat)

pnpm build:shared && pnpm build:drizzle
pnpm db:migrate             # create tables
pnpm seed                   # load demo content

pnpm dev:all                # client on :5173, API on :3001
```

Open http://localhost:5173. The admin panel is at http://localhost:5173/admin.

### Environment variables

| Variable            | Required | Description |
|---------------------|----------|-------------|
| `DATABASE_URL`      | Yes      | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | For chat | Enables the AI support assistant |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | Optional | Ticket-closed email notifications |
| `FRONTEND_URL`      | Optional | CORS origin (default `http://localhost:5173`) |
| `PORT`              | Optional | API port (default `3001`) |

See [.env.example](./.env.example) for the full list.

---

## Scripts

| Command           | Description |
|-------------------|-------------|
| `pnpm dev:all`    | Run client and server in watch mode |
| `pnpm build`      | Build shared → drizzle → server → client |
| `pnpm start`      | Start the production server (serves API + SPA) |
| `pnpm lint`       | Lint and type-check all packages |
| `pnpm test`       | Run tests |
| `pnpm db:migrate` | Create / update database tables |
| `pnpm seed`       | Seed the database with demo content |

---

## API overview

| Resource        | Endpoints |
|-----------------|-----------|
| Categories      | `GET/POST /api/categories`, `GET /api/categories/:slug`, `PATCH/DELETE /api/categories/:id` |
| Folders         | `GET/POST /api/folders`, `GET/PATCH/DELETE /api/folders/:id` |
| Articles        | CRUD on `/api/articles`, plus `/search`, `/popular`, `/by-slug/:slug`, `/:id/view`, `/:id/vote`, `/:id/versions`, `/:id/restore/:versionId`, `/reorder` |
| Tickets         | `GET/POST /api/tickets`, `GET/PATCH /api/tickets/:id`, `GET /api/tickets/stats` |
| Chat            | `POST /api/chat`, `POST /api/chat/summarize` |
| Analytics       | `GET /api/analytics/overview`, `/top-articles`, `/top-searches`, `/zero-results` |
| Settings        | `GET/PATCH /api/ai-settings`, `GET/PATCH /api/email-settings` |
| Health          | `GET /api/health` |

---

## Deployment

The app deploys as one service on [Railway](https://railway.app) (see [railway.toml](./railway.toml)). On every deploy, the build runs `pnpm build`, the start command applies idempotent SQL migrations, and Express then serves both the API and the built client.

---

## License

[MIT](./LICENSE)
