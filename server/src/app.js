import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { healthRouter } from './routes/health.js';
import { createCompareRouter } from './routes/compare.js';
import { createProviders } from './providers/registry.js';
import { createFoundryProvider } from './providers/foundry.js';
import { createAuth } from './providers/auth.js';
import { createJudge } from './services/judge.js';
import { notFound, errorHandler } from './middleware/errors.js';

export function createApp({
  auth = createAuth({ apiKey: config.foundryApiKey }),
  providers = createProviders({ config, auth }),
  judge = createJudge(
    createFoundryProvider({ endpoint: config.foundryEndpoint, model: config.judgeModel, name: 'Judge', auth }),
  ),
  maxPromptChars = config.maxPromptChars,
  serveClient = config.isProduction,
  clientDir = config.clientDir,
} = {}) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.use('/api/health', healthRouter);
  app.use('/api/compare', createCompareRouter({ providers, judge, maxPromptChars }));

  if (serveClient) {
    app.use(express.static(clientDir));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDir, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
