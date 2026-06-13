import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_URL = '/.netlify/functions/messages';

function App() {
  const [message, setMessage] = useState('Hello from Netlify Blobs');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Loading database...');
  const [saving, setSaving] = useState(false);

  async function loadMessages() {
    setStatus('Loading database...');
    const response = await fetch(API_URL);
    const data = await response.json();
    setMessages(data.messages || []);
    setStatus('Connected to backend + database');
  }

  async function addMessage(event) {
    event.preventDefault();
    setSaving(true);
    setStatus('Saving...');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: message })
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error || 'Something went wrong');
    } else {
      setMessages(data.messages || []);
      setMessage('');
      setStatus('Saved to Netlify Blobs');
    }
    setSaving(false);
  }

  async function clearMessages() {
    setSaving(true);
    setStatus('Clearing...');
    await fetch(API_URL, { method: 'DELETE' });
    setMessages([]);
    setStatus('Database cleared');
    setSaving(false);
  }

  useEffect(() => {
    loadMessages().catch((error) => {
      setStatus(`Backend unavailable: ${error.message}`);
    });
  }, []);

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Netlify Full-Stack Demo</p>
        <h1>Frontend + backend + database</h1>
        <p className="lead">
          This React app calls Netlify Functions and stores messages in Netlify Blobs,
          a zero-config key/value store attached to your Netlify site.
        </p>

        <div className="status">{status}</div>

        <form onSubmit={addMessage} className="message-form">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength="280"
            placeholder="Write a demo message"
          />
          <button disabled={saving || !message.trim()}>
            {saving ? 'Saving...' : 'Save message'}
          </button>
        </form>

        <div className="actions">
          <button className="secondary" onClick={loadMessages} disabled={saving}>Refresh</button>
          <button className="secondary" onClick={clearMessages} disabled={saving}>Clear DB</button>
        </div>

        <ul className="messages">
          {messages.length === 0 && <li>No messages yet.</li>}
          {messages.map((item) => (
            <li key={item.id}>
              <strong>{item.text}</strong>
              <span>{new Date(item.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>

        <div className="deploy-note">
          API endpoint: <code>/.netlify/functions/messages</code><br />
          Database store: <code>demo-database/messages.json</code>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
