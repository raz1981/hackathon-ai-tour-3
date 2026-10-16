import { calculateCost } from './pricing.js';

async function runProvider(provider, prompt) {
  const start = performance.now();
  try {
    const { text, inputTokens, outputTokens } = await provider.run(prompt);
    const latencyMs = Math.round(performance.now() - start);
    return {
      model: provider.id,
      name: provider.name,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      latencyMs,
      tokensPerSecond: latencyMs > 0 ? Math.round((outputTokens / (latencyMs / 1000)) * 10) / 10 : null,
      costUsd: calculateCost(provider.id, inputTokens, outputTokens),
      output: text,
      quality: null,
      error: null,
    };
  } catch (err) {
    return {
      model: provider.id,
      name: provider.name,
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
      latencyMs: null,
      tokensPerSecond: null,
      costUsd: null,
      output: null,
      quality: null,
      error: err.message,
    };
  }
}

export async function compare({ prompt, providers, judge }) {
  const results = await Promise.all(providers.map((provider) => runProvider(provider, prompt)));
  await Promise.all(
    results.map(async (result) => {
      if (!result.error) result.quality = await judge.score(prompt, result.output);
    }),
  );
  return results;
}
