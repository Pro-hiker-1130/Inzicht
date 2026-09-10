'use client';

import { useState } from 'react';

// Owns its own submission state and talks to the API directly, rather than
// pushing the fetch call up to BookingSection — the parent only needs to
// know the outcome (booked, or the slot turned out to be taken).
export default function BookingForm({ slot, onBooked, onConflict }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | error
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('submitting');
    setError('');

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startAt: slot.start_at,
        endAt: slot.end_at,
        availabilityBlockId: slot.availability_block_id,
        clientName: name,
        clientEmail: email,
        reason,
      }),
    }).catch(() => null);

    if (!response) {
      setStatus('error');
      setError('Could not reach the server. Please try again.');
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      setStatus('error');
      setError(data.error || 'Something went wrong.');
      // 409 means someone else booked this slot between it being shown and
      // submitted — the parent refetches the slot list so the picker
      // reflects reality again.
      if (response.status === 409) {
        onConflict();
      }
      return;
    }

    setStatus('idle');
    onBooked(data.booking);
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <label>
        Name
        <input value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label>
        Reason for consultation
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
        />
      </label>

      {status === 'error' && <p className="form-error">{error}</p>}

      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Booking…' : 'Confirm booking'}
      </button>
    </form>
  );
}
