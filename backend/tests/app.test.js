const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
process.env.DB_NAME = process.env.DB_NAME || 'management_emergency';
process.env.DB_USER = process.env.DB_USER || 'sa';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'YourStrong!Passw0rd';

const { createApp } = require('../src/app');

async function startApp() {
  const app = createApp();
  const server = app.listen(0);
  await once(server, 'listening');
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : null;
  if (!port) {
    throw new Error('Unable to read test server port');
  }
  return { server, port };
}

test('health endpoint returns standardized response', async (t) => {
  const { server, port } = await startApp();
  t.after(() => server.close());

  const response = await fetch(`http://127.0.0.1:${port}/api/health`);
  const json = await response.json();

  assert.equal(response.status, 200);
  assert.equal(json.success, true);
  assert.equal(json.data.ok, true);
  assert.equal(json.data.service, 'management-emergency-backend');
});

test('docs.json is exposed for swagger clients', async (t) => {
  const { server, port } = await startApp();
  t.after(() => server.close());

  const response = await fetch(`http://127.0.0.1:${port}/docs.json`);
  const json = await response.json();

  assert.equal(response.status, 200);
  assert.equal(json.openapi, '3.0.3');
  assert.ok(Array.isArray(json.tags));
});
