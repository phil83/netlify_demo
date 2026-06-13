import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import netlifyIdentity from 'netlify-identity-widget';
import './style.css';

function App() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    netlifyIdentity.init();
    setUser(netlifyIdentity.currentUser());

    netlifyIdentity.on('login', (loggedInUser) => {
      setUser(loggedInUser);
      netlifyIdentity.close();
    });

    netlifyIdentity.on('logout', () => {
      setUser(null);
      setMessages([]);
    });
  }, []);

  useEffect(() => {
    if (user) loadMessages();
  }, [user]);

  async function authHeaders() {
    const currentUser = netlifyIdentity.currentUser();
    if (!currentUser) return {};
    const token = await currentUser.jwt();
    return { Authorization: `Bearer ${token}` };
  }

  async function loadMessages() {
    setStatus('Loading messages...');
    try {
      const res = await fetch('/api/messages', {
        headers: await authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load messages');
      setMessages(data.messages || []);
      setStatus('');
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function addMessage(event) {
    event.preventDefault();
    if (!text.trim()) return;

    setStatus('Saving message...');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await authHeaders()),
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save message');
      setText('');
      setMessages((current) => [data.message, ...current]);
      setStatus('Saved.');
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function deleteMessage(id) {
    setStatus('Deleting message...');
    try {
      const res = await fetch(`/api/messages?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: await authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete message');
      setMessages((current) => current.filter((message) => message.id !== id));
      setStatus('Deleted.');
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">Netlify full-stack demo</p>
        <h1>Identity + Database</h1>
        <p>
          Log in with Netlify Identity, then create private messages stored in Netlify Database.
        </p>
      </section>

      <section className="card">
        {user ? (
          <>
            <p className="signed-in">Signed in as <strong>{user.email}</strong></p>
            <button onClick={() => netlifyIdentity.logout()}>Log out</button>
          </>
        ) : (
          <>
            <p>You must log in before calling the protected backend.</p>
            <button onClick={() => netlifyIdentity.open('login')}>Log in / sign up</button>
          </>
        )}
      </section>

      {user && (
        <section className="card">
          <h2>Your messages</h2>
          <form onSubmit={addMessage} className="message-form">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Write a private message..."
            />
            <button type="submit">Save</button>
          </form>

          {status && <p className="status">{status}</p>}

          <ul className="messages">
            {messages.map((message) => (
              <li key={message.id}>
                <span>{message.text}</span>
                <small>{new Date(message.created_at).toLocaleString()}</small>
                <button className="danger" onClick={() => deleteMessage(message.id)}>Delete</button>
              </li>
            ))}
          </ul>

          {messages.length === 0 && !status && <p>No messages yet.</p>}
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
