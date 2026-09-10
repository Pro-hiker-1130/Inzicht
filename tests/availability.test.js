const test = require('node:test');
const assert = require('node:assert/strict');
const { createDb } = require('../src/lib/db/connection');
const { rangesOverlap } = require('../src/lib/availability/overlap');
const { getOpenSlots } = require('../src/lib/availability/getOpenSlots');
const { createBooking, SlotUnavailableError } = require('../src/lib/availability/createBooking');

function freshDb() {
  return createDb(':memory:');
}

test('rangesOverlap: adjacent ranges do not overlap', () => {
  assert.equal(
    rangesOverlap('2026-01-01T09:00:00', '2026-01-01T09:30:00', '2026-01-01T09:30:00', '2026-01-01T10:00:00'),
    false
  );
});

test('rangesOverlap: partial overlap is detected', () => {
  assert.equal(
    rangesOverlap('2026-01-01T09:00:00', '2026-01-01T09:30:00', '2026-01-01T09:15:00', '2026-01-01T09:45:00'),
    true
  );
});

test('rangesOverlap: full containment is detected either direction', () => {
  assert.equal(
    rangesOverlap('2026-01-01T09:00:00', '2026-01-01T10:00:00', '2026-01-01T09:15:00', '2026-01-01T09:45:00'),
    true
  );
  assert.equal(
    rangesOverlap('2026-01-01T09:15:00', '2026-01-01T09:45:00', '2026-01-01T09:00:00', '2026-01-01T10:00:00'),
    true
  );
});

test('rangesOverlap: identical ranges overlap', () => {
  assert.equal(
    rangesOverlap('2026-01-01T09:00:00', '2026-01-01T09:30:00', '2026-01-01T09:00:00', '2026-01-01T09:30:00'),
    true
  );
});

test('getOpenSlots: an empty calendar has no open slots', () => {
  assert.deepEqual(getOpenSlots(freshDb(), '2026-09-15'), []);
});

test('getOpenSlots: an open block with no bookings returns all its slots', () => {
  const db = freshDb();
  db.prepare(
    `INSERT INTO availability_blocks (start_at, end_at, slot_duration_minutes) VALUES (?, ?, ?)`
  ).run('2026-09-15T09:00:00', '2026-09-15T10:00:00', 30);

  assert.deepEqual(getOpenSlots(db, '2026-09-15'), [
    { start_at: '2026-09-15T09:00:00', end_at: '2026-09-15T09:30:00', availability_block_id: 1 },
    { start_at: '2026-09-15T09:30:00', end_at: '2026-09-15T10:00:00', availability_block_id: 1 },
  ]);
});

test('getOpenSlots: a confirmed booking removes only that slot', () => {
  const db = freshDb();
  db.prepare(
    `INSERT INTO availability_blocks (start_at, end_at, slot_duration_minutes) VALUES (?, ?, ?)`
  ).run('2026-09-15T09:00:00', '2026-09-15T10:00:00', 30);
  db.prepare(
    `INSERT INTO bookings (start_at, end_at, client_name, client_email) VALUES (?, ?, ?, ?)`
  ).run('2026-09-15T09:00:00', '2026-09-15T09:30:00', 'A', 'a@example.com');

  assert.deepEqual(getOpenSlots(db, '2026-09-15'), [
    { start_at: '2026-09-15T09:30:00', end_at: '2026-09-15T10:00:00', availability_block_id: 1 },
  ]);
});

test('getOpenSlots: a blocked block removes all slots it covers', () => {
  const db = freshDb();
  db.prepare(
    `INSERT INTO availability_blocks (start_at, end_at, slot_duration_minutes) VALUES (?, ?, ?)`
  ).run('2026-09-15T09:00:00', '2026-09-15T10:00:00', 30);
  db.prepare(
    `INSERT INTO availability_blocks (start_at, end_at, slot_duration_minutes, blocked) VALUES (?, ?, ?, 1)`
  ).run('2026-09-15T09:00:00', '2026-09-15T10:00:00', 30);

  assert.deepEqual(getOpenSlots(db, '2026-09-15'), []);
});

test('getOpenSlots: a slot that would run past the end of the block is dropped', () => {
  const db = freshDb();
  // 45-minute block, 30-minute slots: only one full slot fits, no partial tail slot
  db.prepare(
    `INSERT INTO availability_blocks (start_at, end_at, slot_duration_minutes) VALUES (?, ?, ?)`
  ).run('2026-09-15T09:00:00', '2026-09-15T09:45:00', 30);

  assert.deepEqual(getOpenSlots(db, '2026-09-15'), [
    { start_at: '2026-09-15T09:00:00', end_at: '2026-09-15T09:30:00', availability_block_id: 1 },
  ]);
});

test('createBooking: succeeds for an open slot', () => {
  const db = freshDb();
  const booking = createBooking(db, {
    startAt: '2026-09-15T09:00:00',
    endAt: '2026-09-15T09:30:00',
    clientName: 'Jamie',
    clientEmail: 'jamie@example.com',
    reason: 'Initial consult',
  });

  assert.equal(booking.status, 'confirmed');
  assert.equal(booking.client_name, 'Jamie');
});

test('createBooking: rejects a slot that overlaps an existing confirmed booking', () => {
  const db = freshDb();
  createBooking(db, {
    startAt: '2026-09-15T09:00:00',
    endAt: '2026-09-15T09:30:00',
    clientName: 'Jamie',
    clientEmail: 'jamie@example.com',
  });

  assert.throws(
    () =>
      createBooking(db, {
        startAt: '2026-09-15T09:15:00',
        endAt: '2026-09-15T09:45:00',
        clientName: 'Alex',
        clientEmail: 'alex@example.com',
      }),
    SlotUnavailableError
  );
});

test('createBooking: does not reject a slot that only touches an existing booking\'s edge', () => {
  const db = freshDb();
  createBooking(db, {
    startAt: '2026-09-15T09:00:00',
    endAt: '2026-09-15T09:30:00',
    clientName: 'Jamie',
    clientEmail: 'jamie@example.com',
  });

  const second = createBooking(db, {
    startAt: '2026-09-15T09:30:00',
    endAt: '2026-09-15T10:00:00',
    clientName: 'Alex',
    clientEmail: 'alex@example.com',
  });
  assert.equal(second.status, 'confirmed');
});

test('createBooking: rejects a slot inside blocked-off time', () => {
  const db = freshDb();
  db.prepare(
    `INSERT INTO availability_blocks (start_at, end_at, slot_duration_minutes, blocked) VALUES (?, ?, ?, 1)`
  ).run('2026-09-15T09:00:00', '2026-09-15T10:00:00', 30);

  assert.throws(
    () =>
      createBooking(db, {
        startAt: '2026-09-15T09:00:00',
        endAt: '2026-09-15T09:30:00',
        clientName: 'Jamie',
        clientEmail: 'jamie@example.com',
      }),
    SlotUnavailableError
  );
});

test('createBooking: a cancelled booking does not block a new booking for the same slot', () => {
  const db = freshDb();
  const first = createBooking(db, {
    startAt: '2026-09-15T09:00:00',
    endAt: '2026-09-15T09:30:00',
    clientName: 'Jamie',
    clientEmail: 'jamie@example.com',
  });
  db.prepare(`UPDATE bookings SET status = 'cancelled' WHERE id = ?`).run(first.id);

  const second = createBooking(db, {
    startAt: '2026-09-15T09:00:00',
    endAt: '2026-09-15T09:30:00',
    clientName: 'Alex',
    clientEmail: 'alex@example.com',
  });
  assert.equal(second.status, 'confirmed');
});

test('the unique index blocks an exact duplicate confirmed start time even if the app-level check is bypassed', () => {
  const db = freshDb();
  db.prepare(
    `INSERT INTO bookings (start_at, end_at, client_name, client_email) VALUES (?, ?, ?, ?)`
  ).run('2026-09-15T09:00:00', '2026-09-15T09:30:00', 'A', 'a@example.com');

  assert.throws(() => {
    db.prepare(
      `INSERT INTO bookings (start_at, end_at, client_name, client_email) VALUES (?, ?, ?, ?)`
    ).run('2026-09-15T09:00:00', '2026-09-15T09:45:00', 'B', 'b@example.com');
  });
});
