const { rangesOverlap } = require('./overlap');

class SlotUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SlotUnavailableError';
  }
}

// Same overlap formula as getOpenSlots, applied against the same two
// "busy" sources (confirmed bookings, blocked-off time) — one implementation
// of "do these ranges overlap", used on both the read and write side.
function findConflict(db, startAt, endAt) {
  const sameDay = `${startAt.slice(0, 10)}%`;
  const busyRanges = [
    ...db
      .prepare(`SELECT start_at, end_at FROM bookings WHERE status = 'confirmed' AND start_at LIKE ?`)
      .all(sameDay),
    ...db
      .prepare(`SELECT start_at, end_at FROM availability_blocks WHERE blocked = 1 AND start_at LIKE ?`)
      .all(sameDay),
  ];
  return busyRanges.some((busy) => rangesOverlap(startAt, endAt, busy.start_at, busy.end_at));
}

// Checks for a conflict and inserts the booking as one atomic unit.
// db.transaction() plus better-sqlite3 being synchronous means no other
// request's code can run between the check and the insert — there's no
// window for two requests to both pass the check and double-book the same
// slot. The unique index on bookings(start_at) WHERE status = 'confirmed'
// (see schema.sql) is a second, database-level backstop for the common case
// of two bookings landing on the exact same grid-aligned start time.
function createBooking(db, { availabilityBlockId = null, startAt, endAt, clientName, clientEmail, reason = null }) {
  const insert = db.transaction(() => {
    if (findConflict(db, startAt, endAt)) {
      throw new SlotUnavailableError(`The slot ${startAt}–${endAt} is no longer available.`);
    }
    const result = db
      .prepare(
        `INSERT INTO bookings (availability_block_id, start_at, end_at, client_name, client_email, reason)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(availabilityBlockId, startAt, endAt, clientName, clientEmail, reason);
    return result.lastInsertRowid;
  });

  const id = insert();
  return db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
}

module.exports = { createBooking, SlotUnavailableError };
