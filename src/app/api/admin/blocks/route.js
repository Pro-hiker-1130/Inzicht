import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db/connection';

const TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

// Lets the therapist reserve time for themselves. Reuses
// availability_blocks with blocked = 1 (see schema.sql) rather than a
// separate table.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const { startAt, endAt } = body || {};

  if (!TIMESTAMP_PATTERN.test(startAt) || !TIMESTAMP_PATTERN.test(endAt)) {
    return NextResponse.json({ error: 'startAt and endAt must be YYYY-MM-DDTHH:MM:SS.' }, { status: 400 });
  }
  if (endAt <= startAt) {
    return NextResponse.json({ error: 'The end time must be after the start time.' }, { status: 400 });
  }

  try {
    // slot_duration_minutes is meaningless for a blocked block — it's never
    // sliced into offerable slots (see getOpenSlots, which only reads
    // blocked = 0 blocks for that). The column is NOT NULL, so a placeholder
    // value is stored and simply never read for a blocked row.
    getDb()
      .prepare(
        `INSERT INTO availability_blocks (start_at, end_at, slot_duration_minutes, blocked)
         VALUES (?, ?, 30, 1)`
      )
      .run(startAt, endAt);
  } catch (error) {
    return NextResponse.json({ error: `Could not save that block: ${error.message}` }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
