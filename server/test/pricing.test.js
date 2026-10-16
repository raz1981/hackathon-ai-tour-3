import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCost } from '../src/services/pricing.js';

test('calculateCost uses per-million token prices', () => {
  const table = { m: { inputPerMillion: 2, outputPerMillion: 10 } };
  assert.equal(calculateCost('m', 500_000, 100_000, table), 2);
});

test('calculateCost returns null for a model without pricing', () => {
  assert.equal(calculateCost('unknown', 10, 10, {}), null);
});

test('calculateCost knows the default models', () => {
  assert.ok(calculateCost('gpt-4.1', 1000, 1000) > 0);
});
