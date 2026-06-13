# Netlify Database Demo

A working full-stack demo using:

- React + Vite frontend
- Netlify Functions backend
- Netlify Database managed Postgres
- `@netlify/database` for database access

## Prerequisites

- Node.js 18+
- A Netlify site with Netlify Database already created
- Netlify CLI login/link for local testing

## Install

```bash
npm install
```

## Connect this folder to your Netlify site

```bash
npx netlify login
npx netlify link
```

Choose the site where you created the Netlify Database.

## Run locally

```bash
npx netlify dev
```

Open:

```text
http://localhost:8888
```

API endpoints:

```text
GET    /api/health
GET    /api/messages
POST   /api/messages       { "text": "Hello" }
DELETE /api/messages?id=1
```

## Deploy

Push the project to GitHub and connect it in Netlify, or deploy with:

```bash
npx netlify deploy --build
```

Production deploy:

```bash
npx netlify deploy --build --prod
```

## Database schema

The app auto-creates this table from the Functions, and also includes the migration file:

```sql
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL CHECK (char_length(text) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Migration file location:

```text
netlify/database/migrations/001_create_messages.sql
```

## Important notes

Netlify Database uses dynamic database branches for local development, deploy previews, and production. The `@netlify/database` package automatically connects to the right database for the current Netlify environment.

Do not commit `node_modules`, `.netlify`, `dist`, or `.env`.
