import { postJson } from './http.js';

// Calls a model deployment on an Azure AI Foundry resource (OpenAI-compatible v1 chat completions).
export function createFoundryProvider({ endpoint, model, name = model, auth, fetchImpl }) {
  return {
    id: model,
    name,
    async run(prompt) {
      if (!endpoint) throw new Error('FOUNDRY_ENDPOINT is not configured');
      const headers = await auth.getHeaders();
      const data = await postJson(`${endpoint.replace(/\/+$/, '')}/openai/v1/chat/completions`, {
        headers,
        body: { model, messages: [{ role: 'user', content: prompt }] },
        fetchImpl,
      });
      const text = data.choices?.[0]?.message?.content;
      if (typeof text !== 'string') throw new Error('Unexpected response from Foundry');
      return {
        text,
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
      };
    },
  };
}
