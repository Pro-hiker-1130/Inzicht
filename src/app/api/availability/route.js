import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db/connection';
import { getOpenSlots } from '../../../lib/availability/getOpenSlots';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request) {
  const date = new URL(request.url).searchParams.get('date');

  if (!date || !DATE_PATTERN.test(date)) {
    return NextResponse.json({ error: 'Query param "date" must be YYYY-MM-DD.' }, { status: 400 });
  }

  const slots = getOpenSlots(getDb(), date);
  return NextResponse.json({ date, slots });
}
