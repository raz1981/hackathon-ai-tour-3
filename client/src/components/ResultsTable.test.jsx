import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ResultsTable } from './ResultsTable.jsx';

const ok = {
  model: 'gpt-4o',
  name: 'GPT-4o',
  inputTokens: 12,
  outputTokens: 240,
  totalTokens: 252,
  latencyMs: 12400,
  tokensPerSecond: 19.4,
  costUsd: 0.034,
  output: 'Full answer text',
  quality: { score: 7, rationale: 'Clear and correct' },
  error: null,
};
const failed = { ...ok, model: 'claude', name: 'Claude 3.5 Sonnet', error: 'provider down', costUsd: null, latencyMs: null, output: null, quality: null };
const unscored = { ...ok, model: 'gemini', name: 'Gemini 1.5 Pro', quality: null, tokensPerSecond: null };

test('renders the comparison table columns and one row per model', () => {
  render(<ResultsTable results={[ok, failed]} />);

  for (const name of ['Model', 'Cost', 'Time', 'Output quality']) {
    expect(screen.getByRole('columnheader', { name })).toBeInTheDocument();
  }
  expect(screen.getAllByRole('row')).toHaveLength(3);
  expect(screen.getByText('$0.03')).toBeInTheDocument();
  expect(screen.getByText('12s')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: '3.5 out of 5' })).toBeInTheDocument();
});

test('expands a row to show the response, tokens, and judge rationale', () => {
  render(<ResultsTable results={[ok]} />);
  const toggle = screen.getByRole('button', { name: /GPT-4o/ });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByText('Full answer text')).not.toBeInTheDocument();

  fireEvent.click(toggle);

  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Full answer text')).toBeInTheDocument();
  expect(screen.getByText('252')).toBeInTheDocument();
  expect(screen.getByText('19.4')).toBeInTheDocument();
  expect(screen.getByText('Judge: Clear and correct')).toBeInTheDocument();

  fireEvent.click(toggle);
  expect(screen.queryByText('Full answer text')).not.toBeInTheDocument();
});

test('shows an inline error and dashes for a failed model', () => {
  render(<ResultsTable results={[failed]} />);

  expect(screen.getByText('provider down')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Claude/ })).not.toBeInTheDocument();
  expect(screen.getAllByText('—')).toHaveLength(3);
});

test('shows "Not scored" and a dash when the judge gave no score', () => {
  render(<ResultsTable results={[unscored]} />);
  expect(screen.getByText('Not scored')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Gemini/ }));
  expect(screen.getByText('—')).toBeInTheDocument();
  expect(screen.queryByText(/Judge:/)).not.toBeInTheDocument();
});
