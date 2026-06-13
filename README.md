# Netlify Full-Stack Demo Project

A Vite + React app configured for Netlify with:

- Static frontend
- Netlify Functions backend
- Netlify Blobs database-style key/value storage

## Local development

```bash
npm install
npm run dev
```

Open the local Netlify Dev URL, usually `http://localhost:8888`.

## Backend endpoints

- `GET /.netlify/functions/health` - health check
- `GET /.netlify/functions/messages` - list messages
- `POST /.netlify/functions/messages` - save a message
- `DELETE /.netlify/functions/messages` - clear messages

Example POST body:

```json
{
  "text": "Hello from the backend"
}
```

## Database

The demo uses Netlify Blobs as a simple database. Messages are stored in:

```text
store: demo-database
key: messages.json
```

Netlify automatically provides Blobs access inside deployed Netlify Functions. Locally, use `netlify dev` so the functions and local Blobs sandbox are wired up correctly.

## Build

```bash
npm run build
```

## Deploy to Netlify

Use these Netlify settings:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

The included `netlify.toml` already defines these settings.
