import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db/connection';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const id = body?.id;

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'A numeric id is required.' }, { status: 400 });
  }

  const result = getDb()
    .prepare(`UPDATE bookings SET status = 'cancelled' WHERE id = ? AND status = 'confirmed'`)
    .run(id);

  if (result.changes === 0) {
    return NextResponse.json({ error: 'Booking not found or already cancelled.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
