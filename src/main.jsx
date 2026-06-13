import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Netlify Demo Project</p>
        <h1>Ship a React site in minutes</h1>
        <p className="lead">
          This Vite + React demo is configured for Netlify with a production build,
          publish directory, and SPA redirect support.
        </p>
        <button onClick={() => setCount(count + 1)}>
          Clicked {count} {count === 1 ? 'time' : 'times'}
        </button>
        <div className="deploy-note">
          Build command: <code>npm run build</code><br />
          Publish directory: <code>dist</code>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
