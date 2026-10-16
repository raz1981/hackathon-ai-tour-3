import { useState } from 'react';
import { PromptForm } from './PromptForm.jsx';
import { ResultsTable } from './ResultsTable.jsx';
import { postCompare } from '../api/compare.js';

export function ModelComparison() {
  const [collapsed, setCollapsed] = useState(false);
  const [state, setState] = useState({ status: 'idle', results: [], error: null });

  async function run(prompt) {
    setState({ status: 'loading', results: [], error: null });
    try {
      const results = await postCompare(prompt);
      setState({ status: 'ready', results, error: null });
    } catch (error) {
      setState({ status: 'error', results: [], error: error.message });
    }
  }

  return (
    <section className="card" aria-labelledby="model-comparison-title">
      <header className="card-header">
        <span className="brand-icon" aria-hidden="true">
          ◎
        </span>
        <h1 id="model-comparison-title">Model Comparison</h1>
        <button
          type="button"
          className="collapse"
          aria-expanded={!collapsed}
          aria-controls="model-comparison-body"
          aria-label={collapsed ? 'Expand' : 'Collapse'}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? '⌄' : '⌃'}
        </button>
      </header>
      <div id="model-comparison-body" className="card-body" hidden={collapsed}>
        <PromptForm onSubmit={run} disabled={state.status === 'loading'} />
        {state.status === 'idle' && (
          <p className="hint">Ask any question once and compare cost, time, and quality across models.</p>
        )}
        {state.status === 'loading' && <p role="status">Running across models...</p>}
        {state.status === 'error' && <p role="alert">{state.error}</p>}
        {state.status === 'ready' && <ResultsTable results={state.results} />}
      </div>
    </section>
  );
}
