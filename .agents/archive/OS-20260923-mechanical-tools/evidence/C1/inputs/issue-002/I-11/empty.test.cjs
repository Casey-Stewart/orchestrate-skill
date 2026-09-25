const test = require('node:test');
const assert = require('node:assert/strict');
const ROWS = [];
for (const r of ROWS) test('row ' + r, () => { assert.ok(r); });
