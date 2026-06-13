import { getDatabase } from '@netlify/database';
import { getUser } from '@netlify/identity';

const json = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store'
    }
  });

async function requireUser(context) {
  // Current Netlify Identity API. It verifies the authenticated request in Netlify Functions.
  const identityUser = await getUser().catch(() => null);
  if (identityUser) {
    return {
      id: identityUser.id,
      email: identityUser.email || null
    };
  }

  // Compatibility fallback for older Netlify Identity + Functions behavior.
  const legacyUser = context?.clientContext?.user;
  if (legacyUser) {
    return {
      id: legacyUser.sub || legacyUser.id,
      email: legacyUser.email || null
    };
  }

  return null;
}

export default async function handler(request, context) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  try {
    const user = await requireUser(context);
    if (!user?.id) {
      return json({ error: 'Unauthorized. Log in with Netlify Identity first.' }, 401);
    }

    const db = getDatabase();

    if (request.method === 'GET') {
      const messages = await db.sql`
        SELECT id, user_id, email, text, created_at
        FROM messages
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
      `;

      return json({ messages });
    }

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const text = String(body.text || '').trim();

      if (!text) {
        return json({ error: 'Message text is required.' }, 400);
      }

      const rows = await db.sql`
        INSERT INTO messages (user_id, email, text)
        VALUES (${user.id}, ${user.email}, ${text})
        RETURNING id, user_id, email, text, created_at
      `;

      return json({ message: rows[0] }, 201);
    }

    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      const id = Number(url.searchParams.get('id'));

      if (!Number.isInteger(id) || id <= 0) {
        return json({ error: 'A valid numeric id query parameter is required.' }, 400);
      }

      const rows = await db.sql`
        DELETE FROM messages
        WHERE id = ${id} AND user_id = ${user.id}
        RETURNING id
      `;

      if (rows.length === 0) {
        return json({ error: 'Message not found.' }, 404);
      }

      return json({ deleted: rows[0].id });
    }

    return json({ error: 'Method not allowed.' }, 405);
  } catch (error) {
    console.error('messages function failed:', error);
    return json({ error: error.message || 'Server error' }, 500);
  }
}
