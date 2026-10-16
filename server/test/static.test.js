import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { errorHandler } from '../src/middleware/errors.js';

let clientDir;
let app;

before(() => {
  clientDir = fs.mkdtempSync(path.join(os.tmpdir(), 'client-'));
  fs.writeFileSync(path.join(clientDir, 'index.html'), '<html>app</html>');
  app = createApp({ serveClient: true, clientDir, providers: [], judge: { score: async () => null } });
});

after(() => fs.rmSync(clientDir, { recursive: true, force: true }));

test('serves index.html at the root and for client-side routes', async () => {
  for (const url of ['/', '/some/route']) {
    const res = await request(app).get(url);
    assert.equal(res.status, 200);
    assert.match(res.text, /app/);
  }
});

test('unknown /api routes still return a JSON 404 when serving the client', async () => {
  const res = await request(app).get('/api/nope');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: { message: 'Not found' } });
});

test('non-GET requests to unknown routes return 404', async () => {
  const res = await request(app).post('/nope');
  assert.equal(res.status, 404);
});

test('does not serve the client when disabled', async () => {
  const noClient = createApp({ serveClient: false, providers: [], judge: { score: async () => null } });
  const res = await request(noClient).get('/');
  assert.equal(res.status, 404);
});

test('errorHandler defaults to 500 and returns the JSON error shape', (t) => {
  t.mock.method(console, 'error', () => {});
  let status;
  let body;
  const res = {
    status(code) {
      status = code;
      return this;
    },
    json(payload) {
      body = payload;
    },
  };
  errorHandler(new Error('kaboom'), {}, res, () => {});
  assert.equal(status, 500);
  assert.deepEqual(body, { error: { message: 'kaboom' } });
});
