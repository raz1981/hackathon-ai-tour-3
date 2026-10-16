import { pricing } from '../config/pricing.js';

export function calculateCost(modelId, inputTokens, outputTokens, table = pricing) {
  const price = table[modelId];
  if (!price) return null;
  return (inputTokens / 1e6) * price.inputPerMillion + (outputTokens / 1e6) * price.outputPerMillion;
}
