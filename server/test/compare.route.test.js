import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

const providers = [
  { id: 'gpt-4o', name: 'GPT-4o', run: async () => ({ text: 'one', inputTokens: 10, outputTokens: 20 }) },
  {
    id: 'broken',
    name: 'Broken',
    run: async () => {
      throw new Error('provider down');
    },
  },
];
const judge = { score: async () => ({ score: 8, rationale: 'ok' }) };
const app = createApp({ providers, judge, maxPromptChars: 20 });

test('POST /api/compare returns results for each model, including failures', async () => {
  const res = await request(app).post('/api/compare').send({ prompt: '  hello  ' });
  assert.equal(res.status, 200);
  assert.equal(res.body.results.length, 2);
  assert.equal(res.body.results[0].model, 'gpt-4o');
  assert.equal(res.body.results[0].totalTokens, 30);
  assert.deepEqual(res.body.results[0].quality, { score: 8, rationale: 'ok' });
  assert.equal(res.body.results[1].error, 'provider down');
});

test('POST /api/compare rejects a missing or blank prompt', async () => {
  for (const body of [{}, { prompt: '   ' }, { prompt: 42 }]) {
    const res = await request(app).post('/api/compare').send(body);
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: { message: 'prompt is required' } });
  }
});

test('POST /api/compare rejects a request without a body', async () => {
  const res = await request(app).post('/api/compare');
  assert.equal(res.status, 400);
});

test('POST /api/compare rejects a prompt over the limit', async () => {
  const res = await request(app).post('/api/compare').send({ prompt: 'x'.repeat(21) });
  assert.equal(res.status, 400);
  assert.match(res.body.error.message, /at most 20 characters/);
});

test('POST /api/compare rejects malformed JSON with a JSON error', async () => {
  const res = await request(app).post('/api/compare').set('content-type', 'application/json').send('{bad');
  assert.equal(res.status, 400);
  assert.ok(res.body.error.message);
});

test('POST /api/compare returns 200 with per-model errors when every model fails', async () => {
  const failing = createApp({
    providers: [providers[1]],
    judge,
  });
  const res = await request(failing).post('/api/compare').send({ prompt: 'hi' });
  assert.equal(res.status, 200);
  assert.equal(res.body.results[0].error, 'provider down');
});
