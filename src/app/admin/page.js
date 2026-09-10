import { getDb } from '../../lib/db/connection';
import { nowInPracticeTimezone } from '../../lib/availability/time';
import CancelBookingButton from '../../components/admin/CancelBookingButton';
import BlockTimeForm from '../../components/admin/BlockTimeForm';
import LogoutButton from '../../components/admin/LogoutButton';

// This page reads directly from the database on every request — it must
// never be statically prerendered, or the therapist would see a stale
// snapshot from build time instead of live bookings.
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const db = getDb();
  const now = nowInPracticeTimezone();

  const bookings = db
    .prepare(`SELECT * FROM bookings WHERE status = 'confirmed' AND start_at >= ? ORDER BY start_at ASC`)
    .all(now);

  const blockedTimes = db
    .prepare(`SELECT * FROM availability_blocks WHERE blocked = 1 AND start_at >= ? ORDER BY start_at ASC`)
    .all(now);

  return (
    <main className="admin">
      <div className="admin-header">
        <h1>Upcoming bookings</h1>
        <LogoutButton />
      </div>

      {bookings.length === 0 && <p>No upcoming bookings.</p>}
      <ul className="booking-list">
        {bookings.map((booking) => (
          <li key={booking.id}>
            <div>
              <strong>
                {booking.start_at.slice(0, 10)} at {booking.start_at.slice(11, 16)}
              </strong>
              <div>
                {booking.client_name} — {booking.client_email}
              </div>
              {booking.reason && <div className="reason">{booking.reason}</div>}
            </div>
            <CancelBookingButton bookingId={booking.id} />
          </li>
        ))}
      </ul>

      <h2>Blocked-off time</h2>
      {blockedTimes.length === 0 && <p>No upcoming blocked-off time.</p>}
      <ul className="block-list">
        {blockedTimes.map((block) => (
          <li key={block.id}>
            {block.start_at.slice(0, 10)} {block.start_at.slice(11, 16)}–{block.end_at.slice(11, 16)}
          </li>
        ))}
      </ul>

      <h2>Block off time</h2>
      <BlockTimeForm />
    </main>
  );
}
