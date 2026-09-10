import { NextResponse } from 'next/server';
import { ADMIN_PASSWORD, ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '../../../../lib/config';

export async function POST(request) {
  const body = await request.json().catch(() => null);

  if (body?.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return response;
}
