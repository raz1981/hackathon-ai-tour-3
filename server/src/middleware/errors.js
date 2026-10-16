import { config } from '../config.js';

export function notFound(_req, res) {
  res.status(404).json({ error: { message: 'Not found' } });
}

// Express identifies error handlers by their four-argument signature.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status ?? 500;
  if (status >= 500) console.error(err);
  const message = status >= 500 && config.isProduction ? 'Internal server error' : err.message;
  res.status(status).json({ error: { message } });
}
