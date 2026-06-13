import { db, ensureSchema } from "./lib/db.js";

export default async function handler() {
  try {
    await ensureSchema();
    const result = await db.sql`SELECT NOW() AS now`;
    return Response.json({ ok: true, database: "connected", serverTime: result[0].now });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
