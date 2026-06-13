import { db, ensureSchema } from "./lib/db.js";

function json(data, status = 200) {
  return Response.json(data, { status });
}

export default async function handler(request) {
  try {
    await ensureSchema();

    if (request.method === "GET") {
      const rows = await db.sql`
        SELECT id, text, created_at
        FROM messages
        ORDER BY created_at DESC
        LIMIT 50
      `;
      return json({ messages: rows });
    }

    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const text = String(body.text || "").trim();
      if (!text) return json({ error: "Text is required." }, 400);
      if (text.length > 500) return json({ error: "Text must be 500 characters or fewer." }, 400);

      const rows = await db.sql`
        INSERT INTO messages (text)
        VALUES (${text})
        RETURNING id, text, created_at
      `;
      return json({ message: rows[0] }, 201);
    }

    if (request.method === "DELETE") {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");
      if (!id) return json({ error: "Missing id query parameter." }, 400);
      const rows = await db.sql`DELETE FROM messages WHERE id = ${id} RETURNING id`;
      return json({ deleted: rows.length > 0, id });
    }

    return json({ error: "Method not allowed." }, 405);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
