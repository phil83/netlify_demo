# Netlify Identity + Netlify Database Demo

A working full-stack Netlify demo with:

- React + Vite frontend
- Netlify Identity login/sign-up
- Protected Netlify Functions API
- Netlify Database/Postgres storage via `@netlify/database`
- Private messages per authenticated user

## 1. Install

```bash
npm install
```

## 2. Link the project to your Netlify site

You need a Netlify site with:

- Netlify Identity enabled
- Netlify Database created

Then run:

```bash
npx netlify login
npx netlify link
```

Choose the existing Netlify site where you enabled Identity and created the database.

## 3. Run locally

```bash
npx netlify dev
```

Open:

```text
http://localhost:8888
```

Netlify Dev runs the Vite frontend and Functions locally.

## 4. Enable Identity in Netlify

In your Netlify dashboard:

```text
Site configuration → Identity → Enable Identity
```

Recommended settings for testing:

```text
Registration → Open
```

For production, you may prefer invite-only registration.

## 5. Initialize the database

The `messages` function auto-creates the table, but you can also initialize manually:

```bash
curl http://localhost:8888/.netlify/functions/init-db
```

or after deploy:

```bash
curl https://YOUR-SITE.netlify.app/.netlify/functions/init-db
```

## 6. Deploy

```bash
npx netlify deploy --build
```

For production:

```bash
npx netlify deploy --build --prod
```

## How auth works

The frontend uses `netlify-identity-widget`.

After login, it sends the user JWT in the `Authorization` header:

```http
Authorization: Bearer <token>
```

Netlify Functions receive the verified user in:

```js
context.clientContext.user
```

The backend rejects requests without a valid logged-in user.

## API routes

Because of `netlify.toml`, the frontend can call short API URLs:

```text
GET    /api/messages
POST   /api/messages
DELETE /api/messages?id=<message-id>
```

These map to:

```text
/.netlify/functions/messages
```

## Notes

- Do not commit `.env` or `.netlify/`.
- Keep `node_modules/` out of Git.
- The database connection is handled by Netlify through `@netlify/database` after the site is linked.
