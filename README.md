# CRM Support Portal

A full-stack help center for CRM products: a knowledge base, an AI assistant that answers from your own articles, support tickets, and an admin CMS to manage it all.

**Stack:** React · TypeScript · Express · PostgreSQL · Drizzle ORM · Claude API

---

## Features

**Help center**
- Knowledge base organised as categories → folders → articles
- Search across article titles, descriptions and content
- Popular articles, view counts and "Was this helpful?" voting
- AI chat widget that answers from the knowledge base (retrieval-augmented generation) and turns unresolved chats into support tickets
- English / German UI, light / dark theme

**Admin panel (`/admin`)**
- Secure login with role-based access (`super_admin`, `admin`, `editor`, `viewer`)
- Manage categories, folders and articles with a rich-text editor (images, links, YouTube embeds)
- Article version history with one-click restore
- Analytics: top articles, top searches, and searches with no results
- Ticket queue with status workflow and AI-written summaries of the chat
- Configurable AI assistant (name, model, system prompt, suggested questions)
- Automatic email to the customer when their ticket is closed

**Integrations**
- CRM webhook (`POST /webhook/stage-change`) that records deals moving between pipeline stages
- Embeddable widget (`/embed/stage-widget`) showing stage counts, for use in a CRM iframe

---

## Tech stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Tiptap, Recharts |
| Backend  | Node.js, Express, Zod, JWT + bcrypt, express-rate-limit, Nodemailer |
| AI       | Anthropic Claude API |
| Database | PostgreSQL with Drizzle ORM |
| Tooling  | pnpm workspaces (monorepo) |

```
client/    React app (help center + admin panel)
server/    Express API — routes → services → database
shared/    TypeScript types used by client and server
drizzle/   Database schema
```

**Security:** admin endpoints require a session (JWT in an `httpOnly` cookie); writes require the `editor` role and settings require `admin`. Login, chat and ticket creation are rate-limited per IP, which also caps AI spend.

---

## Getting started

**Requirements:** Node.js 22+, pnpm 9+, PostgreSQL 14+

```bash
git clone https://github.com/CodeBuild-Dev/support-portal.git
cd support-portal
pnpm install

cp .env.example .env     # then fill in the values (see below)

pnpm build:shared && pnpm build:drizzle
pnpm db:migrate          # create tables
pnpm seed                # load demo content
pnpm dev:all             # app on http://localhost:5173, API on :3001
```

Sign in at http://localhost:5173/admin with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`. That account is created the first time the server starts.

Add more accounts with:

```bash
pnpm create-user editor@example.com "a-long-password" editor "Jane Editor"
```

### Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First run | First admin account (password 12+ characters) |
| `JWT_SECRET` | Production | Signs login sessions (32+ characters) |
| `ANTHROPIC_API_KEY` | For AI chat | Claude API key |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Optional | Ticket-closed emails |
| `WEBHOOK_SECRET` | Optional | If set, the CRM webhook must send it in the `X-Webhook-Secret` header |

See [.env.example](./.env.example). Never commit your `.env` file.

---

## Deployment

Deploys to [Railway](https://railway.app) as a single service ([railway.toml](./railway.toml)): it builds the whole monorepo, runs database migrations on start, and Express serves both the API and the React app.

Set `NODE_ENV=production` and the variables above in the Railway service. In production the server will not start without `JWT_SECRET`.

---

## License

[MIT](./LICENSE)
