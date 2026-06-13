import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import netlifyIdentity from 'netlify-identity-widget';
import './styles.css';

netlifyIdentity.init();

function App() {
  const [user, setUser] = useState(netlifyIdentity.currentUser());
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('Ready');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onLogin = (u) => {
      netlifyIdentity.close();
      setUser(u);
    };
    const onLogout = () => {
      setUser(null);
      setMessages([]);
    };

    netlifyIdentity.on('login', onLogin);
    netlifyIdentity.on('logout', onLogout);

    return () => {
      netlifyIdentity.off('login', onLogin);
      netlifyIdentity.off('logout', onLogout);
    };
  }, []);

  const email = useMemo(() => user?.email || user?.user_metadata?.full_name || '', [user]);

  async function authFetch(url, options = {}) {
    if (!user) throw new Error('Please log in first.');
    const token = await user.jwt();
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.error || `Request failed with ${response.status}`);
    }
    return body;
  }

  async function loadMessages() {
    try {
      setLoading(true);
      setStatus('Loading messages...');
      const data = await authFetch('/api/messages');
      setMessages(data.messages || []);
      setStatus(`Loaded ${(data.messages || []).length} message(s).`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addMessage(event) {
    event.preventDefault();
    if (!text.trim()) return;

    try {
      setLoading(true);
      setStatus('Saving message...');
      await authFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      setText('');
      await loadMessages();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMessage(id) {
    try {
      setLoading(true);
      setStatus('Deleting message...');
      await authFetch(`/api/messages?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      await loadMessages();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadMessages();
  }, [user]);

  return (
    <main className="container">
      <section className="card hero">
        <p className="eyebrow">Netlify full-stack demo</p>
        <h1>Identity + Database</h1>
        <p>
          Sign up or log in with Netlify Identity, then save private messages to Netlify Database.
        </p>

        <div className="actions">
          {!user ? (
            <>
              <button onClick={() => netlifyIdentity.open('signup')}>Sign up</button>
              <button className="secondary" onClick={() => netlifyIdentity.open('login')}>Log in</button>
            </>
          ) : (
            <>
              <span className="pill">Logged in as {email}</span>
              <button className="secondary" onClick={() => netlifyIdentity.logout()}>Log out</button>
            </>
          )}
        </div>
      </section>

      <section className="card">
        <h2>Messages</h2>
        {!user ? (
          <p>Please log in to access your database-backed messages.</p>
        ) : (
          <>
            <form onSubmit={addMessage} className="form">
              <input
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Write a private message..."
                disabled={loading}
              />
              <button disabled={loading || !text.trim()}>Save</button>
            </form>

            <button className="secondary small" onClick={loadMessages} disabled={loading}>
              Refresh
            </button>

            <ul className="messages">
              {messages.map((message) => (
                <li key={message.id}>
                  <div>
                    <strong>{message.text}</strong>
                    <small>{new Date(message.created_at).toLocaleString()}</small>
                  </div>
                  <button className="danger small" onClick={() => deleteMessage(message.id)} disabled={loading}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="status">{status}</p>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
