import { useState } from 'react';
import { MAX_PROMPT_CHARS, estimateTokens } from '../format.js';

export function PromptForm({ onSubmit, disabled }) {
  const [text, setText] = useState('');
  const canRun = !disabled && text.trim().length > 0;

  function submit(event) {
    event.preventDefault();
    if (canRun) onSubmit(text.trim());
  }

  function handleKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') submit(event);
  }

  return (
    <form className="prompt-form" onSubmit={submit}>
      <div className="prompt-field">
        <label htmlFor="prompt">Prompt</label>
        <textarea
          id="prompt"
          rows={1}
          maxLength={MAX_PROMPT_CHARS}
          placeholder="Enter your one-shot prompt here..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <p className="counts">
          {text.length} characters · ~{estimateTokens(text)} tokens
        </p>
      </div>
      <button type="submit" className="run-button" disabled={!canRun}>
        Run across models
      </button>
    </form>
  );
}
