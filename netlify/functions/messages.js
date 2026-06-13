import { db } from "@netlify/database";

async function getUser(event) {
  const auth = event.headers.authorization || "";

  if (!auth.startsWith("Bearer ")) {
    return null;
  }

  const token = auth.replace("Bearer ", "");

  // Netlify Identity injects user info into context when JWT is valid.
  // For now we decode the JWT payload to get the user id.
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );

    return {
      id: payload.sub,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

async function ensureTable() {
  await db.sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
}

export default async (request, context) => {
  try {
    const user = await getUser({
      headers: Object.fromEntries(request.headers.entries()),
    });

    if (!user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await ensureTable();

    // GET messages
    if (request.method === "GET") {
      const messages = await db.sql`
        SELECT *
        FROM messages
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
      `;

      return Response.json(messages);
    }

    // POST message
    if (request.method === "POST") {
      const body = await request.json();

      if (!body.text?.trim()) {
        return Response.json(
          { error: "Message text required" },
          { status: 400 }
        );
      }

      const result = await db.sql`
        INSERT INTO messages (
          user_id,
          email,
          text
        )
        VALUES (
          ${user.id},
          ${user.email},
          ${body.text}
        )
        RETURNING *
      `;

      return Response.json(result[0]);
    }

    return Response.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
};