import { render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { App } from './App.jsx';

afterEach(() => vi.restoreAllMocks());

test('shows API status once the health check succeeds', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ status: 'ok' }),
  });

  render(<App />);

  expect(await screen.findByText('API status: ok')).toBeInTheDocument();
});

test('shows an error when the API is unavailable', async () => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

  render(<App />);

  expect(await screen.findByRole('alert')).toHaveTextContent('offline');
});
