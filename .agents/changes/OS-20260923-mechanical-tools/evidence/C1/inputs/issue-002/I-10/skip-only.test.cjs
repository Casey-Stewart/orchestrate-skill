const test = require('node:test');
const assert = require('node:assert/strict');
const FEATURE_ON = false;
test('feature adds', { skip: !FEATURE_ON && 'feature off' }, () => { assert.equal(1 + 1, 2); });
