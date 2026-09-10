-- Spans of time on the therapist's calendar. `blocked = 0` means open for
-- booking; `blocked = 1` means the therapist has reserved it for themselves
-- (no bookings allowed against it). One table for both cases because they're
-- the same underlying concept — a span of time — and keeping them in one
-- table means there's only one place to look to answer "what does the
-- calendar look like".
CREATE TABLE IF NOT EXISTS availability_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  slot_duration_minutes INTEGER NOT NULL,
  blocked INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (end_at > start_at),
  CHECK (slot_duration_minutes > 0),
  CHECK (blocked IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_availability_blocks_start_at
  ON availability_blocks (start_at);

-- A booked consultation slot. start_at/end_at are stored directly (not
-- looked up through availability_block_id) so a booking stays a
-- self-contained record even if the availability block it came from is
-- later edited. availability_block_id is kept for traceability only.
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  availability_block_id INTEGER REFERENCES availability_blocks (id),
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (end_at > start_at),
  CHECK (status IN ('confirmed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_start_at ON bookings (start_at);

-- Database-level backstop against double-booking: two confirmed bookings
-- can never share an exact start time. This doesn't catch every possible
-- overlap (SQLite has no range-exclusion constraint like Postgres's
-- EXCLUDE USING gist), but it catches the common case for free, even if the
-- application-level conflict check in createBooking() ever had a bug.
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_unique_confirmed_start
  ON bookings (start_at)
  WHERE status = 'confirmed';
