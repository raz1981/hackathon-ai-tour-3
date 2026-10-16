import { afterEach, expect, test, vi } from 'vitest';
import { postCompare } from './compare.js';

afterEach(() => vi.restoreAllMocks());

test('postCompare posts the prompt and returns results', async () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ results: [{ model: 'm' }] }),
  });

  await expect(postCompare('hello')).resolves.toEqual([{ model: 'm' }]);
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/compare',
    expect.objectContaining({ method: 'POST', body: JSON.stringify({ prompt: 'hello' }) }),
  );
});

test('postCompare throws the server error message', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: false,
    status: 400,
    json: async () => ({ error: { message: 'prompt is required' } }),
  });

  await expect(postCompare('x')).rejects.toThrow('prompt is required');
});

test('postCompare falls back to the status when the body is not JSON', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: false,
    status: 502,
    json: async () => {
      throw new Error('not json');
    },
  });

  await expect(postCompare('x')).rejects.toThrow('Request failed with status 502');
});
