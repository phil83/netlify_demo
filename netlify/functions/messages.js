import { getStore } from '@netlify/blobs';

const STORE_NAME = 'demo-database';
const MESSAGES_KEY = 'messages.json';

function json(data, init = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      'cache-control': 'no-store',
      ...(init.headers || {})
    }
  });
}

async function readMessages() {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  const raw = await store.get(MESSAGES_KEY, { consistency: 'strong' });
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeMessages(messages) {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  await store.set(MESSAGES_KEY, JSON.stringify(messages, null, 2), {
    metadata: { contentType: 'application/json' }
  });
}

export default async (request) => {
  try {
    if (request.method === 'GET') {
      const messages = await readMessages();
      return json({ messages });
    }

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const text = String(body.text || '').trim();

      if (!text) {
        return json({ error: 'Message text is required.' }, { status: 400 });
      }

      const messages = await readMessages();
      const message = {
        id: crypto.randomUUID(),
        text: text.slice(0, 280),
        createdAt: new Date().toISOString()
      };

      const nextMessages = [message, ...messages].slice(0, 25);
      await writeMessages(nextMessages);
      return json({ message, messages: nextMessages }, { status: 201 });
    }

    if (request.method === 'DELETE') {
      await writeMessages([]);
      return json({ messages: [] });
    }

    return json({ error: 'Method not allowed.' }, { status: 405 });
  } catch (error) {
    return json({ error: error.message || 'Unexpected server error.' }, { status: 500 });
  }
};
