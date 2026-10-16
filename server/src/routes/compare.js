import { Router } from 'express';
import { compare } from '../services/compare.js';

function badRequest(message) {
  return Object.assign(new Error(message), { status: 400 });
}

export function createCompareRouter({ providers, judge, maxPromptChars }) {
  const router = Router();

  router.post('/', async (req, res) => {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    if (!prompt) throw badRequest('prompt is required');
    if (prompt.length > maxPromptChars) {
      throw badRequest(`prompt must be at most ${maxPromptChars} characters`);
    }
    res.json({ results: await compare({ prompt, providers, judge }) });
  });

  return router;
}
