const test = require('node:test');
const assert = require('node:assert/strict');
const {
  DEFAULT_DEPARTMENTS,
  normalizeDepartmentName,
} = require('../src/utils/department');

test('normalizeDepartmentName maps aliases to canonical values', () => {
  assert.equal(normalizeDepartmentName('security'), 'ALERT SECURITY');
  assert.equal(normalizeDepartmentName('fire alert'), 'ALERT FIRE STATION');
  assert.equal(normalizeDepartmentName('medical'), 'ALERT MEDICAL');
  assert.equal(normalizeDepartmentName('it helper'), 'IT HELPDESK');
});

test('default department seed contains all main emergency units', () => {
  assert.equal(DEFAULT_DEPARTMENTS.length, 4);
  assert.deepEqual(
    DEFAULT_DEPARTMENTS.map((item) => item.departmentCode),
    ['ALERT SECURITY', 'ALERT FIRE STATION', 'ALERT MEDICAL', 'IT HELPDESK'],
  );
});
