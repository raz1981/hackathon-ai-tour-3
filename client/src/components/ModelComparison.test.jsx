import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { ModelComparison } from './ModelComparison.jsx';

afterEach(() => vi.restoreAllMocks());

const result = {
  model: 'gpt-4o',
  name: 'GPT-4o',
  inputTokens: 1,
  outputTokens: 2,
  totalTokens: 3,
  latencyMs: 1500,
  tokensPerSecond: 1.3,
  costUsd: 0.0024,
  output: 'answer',
  quality: { score: 8, rationale: 'good' },
  error: null,
};

function submit(text = 'What is 2+2?') {
  fireEvent.change(screen.getByLabelText('Prompt'), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Run across models' }));
}

test('shows a hint before the first run', () => {
  render(<ModelComparison />);
  expect(screen.getByRole('heading', { name: 'Model Comparison' })).toBeInTheDocument();
  expect(screen.getByText(/Ask any question once/)).toBeInTheDocument();
});

test('runs the prompt and shows the comparison table', async () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ results: [result] }),
  });

  render(<ModelComparison />);
  submit();

  expect(screen.getByRole('status')).toHaveTextContent('Running across models');
  expect(screen.getByRole('button', { name: 'Run across models' })).toBeDisabled();
  expect(await screen.findByRole('table')).toBeInTheDocument();
  expect(screen.getByText('$0.0024')).toBeInTheDocument();
  expect(screen.getByText('1.5s')).toBeInTheDocument();
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ prompt: 'What is 2+2?' });
});

test('shows an error when the request fails', async () => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

  render(<ModelComparison />);
  submit();

  expect(await screen.findByRole('alert')).toHaveTextContent('offline');
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});

test('a new run replaces the previous results', async () => {
  vi.spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [result] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [{ ...result, name: 'Second run' }] }) });

  render(<ModelComparison />);
  submit('first');
  await screen.findByRole('button', { name: /GPT-4o/ });
  submit('second');

  expect(await screen.findByRole('button', { name: /Second run/ })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /^▸ GPT-4o/ })).not.toBeInTheDocument();
});

test('collapses and expands the card body', () => {
  render(<ModelComparison />);
  const toggle = screen.getByRole('button', { name: 'Collapse' });
  const body = document.getElementById('model-comparison-body');
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(body).not.toHaveAttribute('hidden');

  fireEvent.click(toggle);
  expect(screen.getByRole('button', { name: 'Expand' })).toHaveAttribute('aria-expanded', 'false');
  expect(body).toHaveAttribute('hidden');

  fireEvent.click(screen.getByRole('button', { name: 'Expand' }));
  expect(body).not.toHaveAttribute('hidden');
});
