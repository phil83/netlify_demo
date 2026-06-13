import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Loading database...");
  const [saving, setSaving] = useState(false);

  async function loadMessages() {
    const res = await fetch("/api/messages");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load messages");
    setMessages(data.messages || []);
  }

  async function checkHealth() {
    const res = await fetch("/api/health");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Database health check failed");
    setStatus(`Database connected. Server time: ${new Date(data.serverTime).toLocaleString()}`);
  }

  useEffect(() => {
    Promise.all([checkHealth(), loadMessages()]).catch((error) => {
      setStatus(`Error: ${error.message}`);
    });
  }, []);

  async function addMessage(event) {
    event.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save message");
      setText("");
      await loadMessages();
      setStatus("Saved to Netlify Database.");
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteMessage(id) {
    const res = await fetch(`/api/messages?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setStatus(`Error: ${data.error || "Could not delete message"}`);
      return;
    }
    await loadMessages();
    setStatus("Deleted from database.");
  }

  return (
    <main className="page">
      <section className="card hero">
        <p className="eyebrow">Netlify + React + Functions + Database</p>
        <h1>Netlify Database Demo</h1>
        <p>This app writes messages to your Netlify managed Postgres database through Netlify Functions.</p>
        <code>{status}</code>
      </section>

      <section className="card">
        <h2>Add a message</h2>
        <form onSubmit={addMessage} className="form">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a database-backed message..." maxLength="500" />
          <button disabled={saving}>{saving ? "Saving..." : "Save"}</button>
        </form>
      </section>

      <section className="card">
        <h2>Messages</h2>
        {messages.length === 0 ? <p>No messages yet.</p> : null}
        <ul className="messages">
          {messages.map((message) => (
            <li key={message.id}>
              <span>{message.text}</span>
              <small>{new Date(message.created_at).toLocaleString()}</small>
              <button className="ghost" onClick={() => deleteMessage(message.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
