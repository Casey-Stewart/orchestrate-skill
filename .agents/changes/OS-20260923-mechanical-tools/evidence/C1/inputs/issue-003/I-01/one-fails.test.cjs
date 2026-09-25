const test = require('node:test');
const assert = require('node:assert/strict');
test('fixture passes', () => { assert.equal(1 + 1, 2); });
test('fixture fails on purpose', () => { assert.ok(false, 'this failure is the fixture'); });
