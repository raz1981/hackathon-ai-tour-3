import { test } from 'node:test';
import assert from 'node:assert/strict';
import { postJson } from '../src/providers/http.js';
import { createAuth } from '../src/providers/auth.js';
import { createFoundryProvider } from '../src/providers/foundry.js';
import { createProviders } from '../src/providers/registry.js';

function fakeFetch(body, { ok = true, status = 200 } = {}) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url, init });
    return { ok, status, json: async () => body };
  };
  impl.calls = calls;
  return impl;
}

const keyAuth = createAuth({ apiKey: 'secret-key' });

test('postJson returns parsed JSON and sends a JSON body', async () => {
  const fetchImpl = fakeFetch({ hello: 'world' });
  const data = await postJson('https://example.test', { headers: { a: 'b' }, body: { x: 1 }, fetchImpl });
  assert.deepEqual(data, { hello: 'world' });
  assert.equal(fetchImpl.calls[0].init.method, 'POST');
  assert.equal(fetchImpl.calls[0].init.body, '{"x":1}');
  assert.equal(fetchImpl.calls[0].init.headers.a, 'b');
});

test('postJson throws on a non-ok status without leaking the response body', async () => {
  const fetchImpl = fakeFetch({ error: 'secret detail' }, { ok: false, status: 401 });
  await assert.rejects(postJson('https://example.test', { body: {}, fetchImpl }), {
    message: 'Provider returned status 401',
  });
});

test('postJson maps network failures and timeouts to safe messages', async () => {
  const network = async () => {
    throw new Error('connect ECONNREFUSED with-key-in-url');
  };
  await assert.rejects(postJson('https://example.test', { body: {}, fetchImpl: network }), {
    message: 'Network error',
  });
  const timeout = async () => {
    throw Object.assign(new Error('t'), { name: 'TimeoutError' });
  };
  await assert.rejects(postJson('https://example.test', { body: {}, fetchImpl: timeout }), {
    message: 'Request timed out',
  });
});

test('auth uses the api key header when a key is configured', async () => {
  assert.deepEqual(await keyAuth.getHeaders(), { 'api-key': 'secret-key' });
});

test('auth uses a bearer token from the credential when there is no key', async () => {
  const scopes = [];
  const credential = {
    getToken: async (scope) => {
      scopes.push(scope);
      return { token: 'entra-token' };
    },
  };
  const auth = createAuth({ credential });
  assert.deepEqual(await auth.getHeaders(), { authorization: 'Bearer entra-token' });
  assert.deepEqual(scopes, ['https://cognitiveservices.azure.com/.default']);
});

test('auth hides credential failure details', async () => {
  const credential = {
    getToken: async () => {
      throw new Error('tenant-id-and-other-details');
    },
  };
  await assert.rejects(createAuth({ credential }).getHeaders(), { message: 'Failed to acquire Azure credentials' });
});

test('foundry provider calls the v1 chat completions endpoint and maps text and usage', async () => {
  const fetchImpl = fakeFetch({
    choices: [{ message: { content: 'hi' } }],
    usage: { prompt_tokens: 3, completion_tokens: 5 },
  });
  const provider = createFoundryProvider({
    endpoint: 'https://res.openai.azure.com/',
    model: 'gpt-4.1',
    auth: keyAuth,
    fetchImpl,
  });

  assert.deepEqual(await provider.run('hello'), { text: 'hi', inputTokens: 3, outputTokens: 5 });
  assert.equal(fetchImpl.calls[0].url, 'https://res.openai.azure.com/openai/v1/chat/completions');
  assert.equal(fetchImpl.calls[0].init.headers['api-key'], 'secret-key');
  assert.deepEqual(JSON.parse(fetchImpl.calls[0].init.body), {
    model: 'gpt-4.1',
    messages: [{ role: 'user', content: 'hello' }],
  });
  assert.equal(provider.id, 'gpt-4.1');
  assert.equal(provider.name, 'gpt-4.1');
});

test('foundry provider fails without an endpoint or with an unexpected response', async () => {
  const noEndpoint = createFoundryProvider({ model: 'm', auth: keyAuth });
  await assert.rejects(noEndpoint.run('x'), /FOUNDRY_ENDPOINT/);

  const provider = createFoundryProvider({
    endpoint: 'https://res.openai.azure.com',
    model: 'm',
    auth: keyAuth,
    fetchImpl: fakeFetch({}),
  });
  await assert.rejects(provider.run('x'), /Unexpected response from Foundry/);
});

test('foundry provider defaults usage to zero when absent', async () => {
  const fetchImpl = fakeFetch({ choices: [{ message: { content: 'hi' } }] });
  const provider = createFoundryProvider({ endpoint: 'https://r.test', model: 'm', auth: keyAuth, fetchImpl });
  const result = await provider.run('x');
  assert.equal(result.inputTokens, 0);
  assert.equal(result.outputTokens, 0);
});

test('foundry provider surfaces credential failures', async () => {
  const auth = {
    getHeaders: async () => {
      throw new Error('Failed to acquire Azure credentials');
    },
  };
  const provider = createFoundryProvider({ endpoint: 'https://r.test', model: 'm', auth });
  await assert.rejects(provider.run('x'), /Failed to acquire Azure credentials/);
});

test('createProviders builds one provider per configured model with display names', () => {
  const providers = createProviders({
    config: { foundryEndpoint: 'https://r.test', models: ['gpt-4.1', 'gpt-4.1-mini', 'custom-model'] },
    auth: keyAuth,
  });
  assert.deepEqual(
    providers.map((p) => [p.id, p.name]),
    [
      ['gpt-4.1', 'GPT-4.1'],
      ['gpt-4.1-mini', 'GPT-4.1 mini'],
      ['custom-model', 'custom-model'],
    ],
  );
});
