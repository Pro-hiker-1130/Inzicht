const test = require('node:test');
const assert = require('node:assert/strict');
const { addMinutes, nowInPracticeTimezone } = require('../src/lib/availability/time');

test('addMinutes: within the same hour', () => {
  assert.equal(addMinutes('2026-09-15T09:00:00', 30), '2026-09-15T09:30:00');
});

test('addMinutes: crosses an hour boundary', () => {
  assert.equal(addMinutes('2026-09-15T09:45:00', 30), '2026-09-15T10:15:00');
});

test('addMinutes: crosses midnight into the next day', () => {
  assert.equal(addMinutes('2026-09-15T23:45:00', 30), '2026-09-16T00:15:00');
});

test('nowInPracticeTimezone returns a well-formed naive-local timestamp', () => {
  // Can't assert an exact value (it's "now"), only that the shape is right —
  // the real correctness check was done manually against the server's clock.
  assert.match(nowInPracticeTimezone(), /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
});
