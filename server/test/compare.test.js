import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compare } from '../src/services/compare.js';

const okProvider = (id, usage = { inputTokens: 1000, outputTokens: 2000 }) => ({
  id,
  name: id.toUpperCase(),
  run: async () => ({ text: `answer from ${id}`, ...usage }),
});
const failingProvider = (id) => ({
  id,
  name: id,
  run: async () => {
    throw new Error('provider down');
  },
});
const judge = { score: async () => ({ score: 9, rationale: 'good' }) };

test('compare runs every provider and builds metrics', async () => {
  const results = await compare({ prompt: 'q', providers: [okProvider('gpt-4.1'), okProvider('other')], judge });
  assert.equal(results.length, 2);
  const [first, second] = results;
  assert.equal(first.model, 'gpt-4.1');
  assert.equal(first.totalTokens, 3000);
  assert.equal(first.output, 'answer from gpt-4.1');
  assert.ok(first.costUsd > 0);
  assert.ok(first.latencyMs >= 0);
  assert.deepEqual(first.quality, { score: 9, rationale: 'good' });
  assert.equal(first.error, null);
  assert.equal(second.costUsd, null);
});

test('compare keeps going when one provider fails and skips judging it', async () => {
  let judged = 0;
  const countingJudge = {
    score: async () => {
      judged += 1;
      return { score: 5, rationale: '' };
    },
  };
  const results = await compare({
    prompt: 'q',
    providers: [okProvider('a'), failingProvider('b')],
    judge: countingJudge,
  });
  assert.equal(results[0].error, null);
  assert.equal(results[1].error, 'provider down');
  assert.equal(results[1].output, null);
  assert.equal(results[1].costUsd, null);
  assert.equal(judged, 1);
});

test('compare reports every provider as failed when all fail', async () => {
  const results = await compare({ prompt: 'q', providers: [failingProvider('a'), failingProvider('b')], judge });
  assert.ok(results.every((r) => r.error === 'provider down'));
});

test('compare leaves quality null when the judge cannot score', async () => {
  const results = await compare({
    prompt: 'q',
    providers: [okProvider('a')],
    judge: { score: async () => null },
  });
  assert.equal(results[0].quality, null);
});

test('compare handles a zero-latency response without dividing by zero', async (t) => {
  t.mock.method(performance, 'now', () => 100);
  const results = await compare({ prompt: 'q', providers: [okProvider('a')], judge });
  assert.equal(results[0].latencyMs, 0);
  assert.equal(results[0].tokensPerSecond, null);
});
