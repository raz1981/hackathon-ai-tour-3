import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createJudge } from '../src/services/judge.js';

const providerReturning = (text) => ({ run: async () => ({ text }) });

test('judge parses a valid verdict', async () => {
  const judge = createJudge(providerReturning('{"score": 8, "rationale": "Clear"}'));
  assert.deepEqual(await judge.score('q', 'a'), { score: 8, rationale: 'Clear' });
});

test('judge extracts JSON wrapped in other text', async () => {
  const judge = createJudge(providerReturning('Sure!\n```json\n{"score": 5}\n```'));
  assert.deepEqual(await judge.score('q', 'a'), { score: 5, rationale: '' });
});

test('judge returns null for out-of-range, non-numeric, or malformed verdicts', async () => {
  for (const text of ['{"score": 11}', '{"score": 0}', '{"score": "9"}', '{not json}', 'no json here']) {
    assert.equal(await createJudge(providerReturning(text)).score('q', 'a'), null, text);
  }
});

test('judge returns null when the provider fails', async () => {
  const judge = createJudge({
    run: async () => {
      throw new Error('boom');
    },
  });
  assert.equal(await judge.score('q', 'a'), null);
});

test('judge prompt contains the question and answer but not the model name', async () => {
  let seen;
  const judge = createJudge({
    run: async (p) => {
      seen = p;
      return { text: '{"score": 7}' };
    },
  });
  await judge.score('What is 2+2?', 'Four');
  assert.match(seen, /What is 2\+2\?/);
  assert.match(seen, /Four/);
});

test('judge truncates very long rationales', async () => {
  const long = 'x'.repeat(2000);
  const verdict = await createJudge(providerReturning(JSON.stringify({ score: 6, rationale: long }))).score('q', 'a');
  assert.equal(verdict.rationale.length, 500);
});
