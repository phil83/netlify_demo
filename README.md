# Netlify Identity + Netlify Database Working Demo

Clean React + Vite demo using:

- Netlify Identity for signup/login
- Netlify Functions for the backend
- Netlify Database via `@netlify/database`
- A single migration for the `messages` table
- No legacy Neon plugin and no `@netlify/neon`

## Important

Use this as a **fresh Netlify site/project**. Your previous site has old/corrupted migration history for `001_create_messages`, so deploying this to that same site can continue to fail.

## Local setup

```bash
npm install
npx netlify login
npx netlify init
npx netlify database init
npx netlify dev
```

When `database init` asks for a style, choose **Direct SQL**.

## Netlify dashboard setup

Enable Identity:

```text
Site configuration → Identity → Enable Identity
```

For quick testing, set registration to open:

```text
Identity → Registration → Open
```

## Deploy

```bash
git add .
git commit -m "Initial Netlify Identity Database demo"
git push
```

Or create a new site manually from this repository in the Netlify dashboard.

## Files to notice

```text
netlify/functions/messages.js
netlify/database/migrations/20260613150000_create_messages.sql
src/main.jsx
netlify.toml
```

## API

The frontend calls `/api/messages`, which is redirected to `/.netlify/functions/messages`.

Methods:

- `GET /api/messages`
- `POST /api/messages` with `{ "text": "Hello" }`
- `DELETE /api/messages?id=1`

All methods require a logged-in Netlify Identity user.
