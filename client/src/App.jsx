import { useEffect, useState } from 'react';
import { getHealth } from './api/health.js';

export function App() {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    getHealth()
      .then((data) => setState({ status: 'ready', data }))
      .catch((error) => setState({ status: 'error', error }));
  }, []);

  return (
    <main>
      <h1>Hackathon AI Tour 3</h1>
      {state.status === 'loading' && <p>Checking API...</p>}
      {state.status === 'error' && <p role="alert">API unavailable: {state.error.message}</p>}
      {state.status === 'ready' && <p>API status: {state.data.status}</p>}
    </main>
  );
}
