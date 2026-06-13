import { getDatabase } from "@netlify/database";

export const db = getDatabase();

export async function ensureSchema() {
  await db.sql`
    CREATE TABLE IF NOT EXISTS messages (
      id BIGSERIAL PRIMARY KEY,
      text TEXT NOT NULL CHECK (char_length(text) <= 500),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
