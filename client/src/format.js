export const MAX_PROMPT_CHARS = 4000;

export function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

export function formatCost(usd) {
  if (usd == null) return '—';
  if (usd === 0) return '$0.00';
  return usd < 0.01 ? `$${usd.toFixed(4)}` : `$${usd.toFixed(2)}`;
}

export function formatTime(ms) {
  if (ms == null) return '—';
  return ms < 10000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms / 1000)}s`;
}

// Judge scores are 1-10; stars are 0-5 in half steps.
export function scoreToStars(score) {
  if (score == null) return null;
  return Math.round(score) / 2;
}
