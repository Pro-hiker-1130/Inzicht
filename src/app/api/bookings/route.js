import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db/connection';
import { createBooking, SlotUnavailableError } from '../../../lib/availability/createBooking';

const TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Thin HTTP layer over createBooking(): parse and validate the request body,
// translate SlotUnavailableError into a 409 the frontend can show to the
// visitor, and otherwise hand back the created booking.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Request body must be JSON.' }, { status: 400 });
  }

  const { startAt, endAt, availabilityBlockId, clientName, clientEmail, reason } = body;

  if (!TIMESTAMP_PATTERN.test(startAt) || !TIMESTAMP_PATTERN.test(endAt)) {
    return NextResponse.json({ error: 'startAt and endAt must be YYYY-MM-DDTHH:MM:SS.' }, { status: 400 });
  }
  if (typeof clientName !== 'string' || clientName.trim() === '') {
    return NextResponse.json({ error: 'clientName is required.' }, { status: 400 });
  }
  if (typeof clientEmail !== 'string' || !EMAIL_PATTERN.test(clientEmail)) {
    return NextResponse.json({ error: 'A valid clientEmail is required.' }, { status: 400 });
  }

  try {
    const booking = createBooking(getDb(), {
      availabilityBlockId: availabilityBlockId ?? null,
      startAt,
      endAt,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      reason: typeof reason === 'string' && reason.trim() !== '' ? reason.trim() : null,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof SlotUnavailableError) {
      // error.message (with the exact range) is precise but not visitor
      // language — keep that detail server-side and send a plain one back.
      return NextResponse.json(
        { error: 'That time was just booked by someone else. Please pick another.' },
        { status: 409 }
      );
    }
    throw error;
  }
}
