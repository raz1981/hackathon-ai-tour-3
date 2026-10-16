import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT) || 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  foundryEndpoint: process.env.FOUNDRY_ENDPOINT,
  foundryApiKey: process.env.FOUNDRY_API_KEY,
  models: (process.env.FOUNDRY_MODELS || 'gpt-4.1,gpt-4.1-mini,gpt-4o')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean),
  judgeModel: process.env.JUDGE_MODEL || 'gpt-4.1',
  maxPromptChars: Number(process.env.MAX_PROMPT_CHARS) || 4000,
  clientDir: path.resolve(here, '../../client/dist'),
};
