import { sql } from './lib/db.js';
import { requireUser } from './lib/auth.js';

export default async (request, context) => {
  const auth = await requireUser(context);
  if (auth.error) return auth.error;
  const user = auth.user;

  if (request.method === 'GET') {
    await ensureTable();
    const messages = await sql`
      SELECT id, text, created_at
      FROM messages
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;
    return Response.json({ messages });
  }

  if (request.method === 'POST') {
    await ensureTable();
    const body = await request.json().catch(() => ({}));
    const text = String(body.text || '').trim();

    if (!text) {
      return Response.json({ error: 'Message text is required.' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO messages (user_id, user_email, text)
      VALUES (${user.id}, ${user.email}, ${text})
      RETURNING id, text, created_at
    `;

    return Response.json({ message: rows[0] }, { status: 201 });
  }

  if (request.method === 'DELETE') {
    await ensureTable();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'Message id is required.' }, { status: 400 });
    }

    const rows = await sql`
      DELETE FROM messages
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `;

    return Response.json({ deleted: rows.length > 0 });
  }

  return Response.json({ error: 'Method not allowed.' }, { status: 405 });
};

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
