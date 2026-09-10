const { rangesOverlap } = require('./overlap');
const { addMinutes } = require('./time');

// Returns the open (bookable) slots for one calendar day, as
// [{ start_at, end_at }, ...] sorted chronologically.
//
// dateStr must be 'YYYY-MM-DD'. Availability blocks are assumed to start and
// end within a single calendar day — phase 1 doesn't support a block that
// spans midnight.
function getOpenSlots(db, dateStr) {
  const sameDay = `${dateStr}%`;

  const openBlocks = db
    .prepare(`SELECT * FROM availability_blocks WHERE blocked = 0 AND start_at LIKE ?`)
    .all(sameDay);

  // Anything that can make a candidate slot unavailable: the therapist's own
  // blocked-off time, and bookings that already exist. Both are just "busy
  // ranges" from the point of view of slicing up an open block.
  const busyRanges = [
    ...db
      .prepare(`SELECT start_at, end_at FROM availability_blocks WHERE blocked = 1 AND start_at LIKE ?`)
      .all(sameDay),
    ...db
      .prepare(`SELECT start_at, end_at FROM bookings WHERE status = 'confirmed' AND start_at LIKE ?`)
      .all(sameDay),
  ];

  const slots = [];
  for (const block of openBlocks) {
    let slotStart = block.start_at;
    while (slotStart < block.end_at) {
      const slotEnd = addMinutes(slotStart, block.slot_duration_minutes);
      if (slotEnd > block.end_at) break; // a partial slot at the tail end doesn't count

      const isBusy = busyRanges.some((busy) =>
        rangesOverlap(slotStart, slotEnd, busy.start_at, busy.end_at)
      );
      if (!isBusy) {
        slots.push({ start_at: slotStart, end_at: slotEnd });
      }
      slotStart = slotEnd;
    }
  }

  slots.sort((a, b) => (a.start_at < b.start_at ? -1 : a.start_at > b.start_at ? 1 : 0));
  return slots;
}

module.exports = { getOpenSlots };
