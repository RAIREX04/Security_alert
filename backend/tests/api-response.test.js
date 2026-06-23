const test = require('node:test');
const assert = require('node:assert/strict');
const { success, fail, paginated } = require('../src/utils/api-response');

function createResponse() {
  return {
    statusCode: 0,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return body;
    },
  };
}

test('success response wrapper', () => {
  const res = createResponse();
  success(res, { ok: true }, 'Berhasil', 201);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.payload, {
    success: true,
    message: 'Berhasil',
    data: { ok: true },
  });
});

test('fail response wrapper', () => {
  const res = createResponse();
  fail(res, 'Gagal', 400, { field: 'required' });
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.payload, {
    success: false,
    message: 'Gagal',
    errors: { field: 'required' },
  });
});

test('paginated response wrapper', () => {
  const res = createResponse();
  paginated(res, [{ id: 1 }], { page: 1 }, 'OK', 200);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.payload, {
    success: true,
    message: 'OK',
    data: [{ id: 1 }],
    meta: { page: 1 },
  });
});
